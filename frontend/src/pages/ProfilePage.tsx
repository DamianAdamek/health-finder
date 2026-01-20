import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
  User,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Edit,
  Dumbbell,
} from 'lucide-react';
import type { UserProfile } from '@/lib/authService';

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!location || location.pathname !== '/profile') return;
    const hash = location.hash;
    if (!hash) return;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      setTimeout(
        () => el.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        50
      );
    }
  }, [location, isLoading, profile]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/user-management/users/me');
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    toast.info('Edit functionality coming soon!');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value?: string;
  }) => (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  const personalFields = [
    {
      label: 'Full Name',
      value:
        profile?.firstName && profile?.lastName
          ? `${profile.firstName} ${profile.lastName}`
          : user?.email?.split('@')[0],
      icon: User,
    },
    {
      label: 'Email Address',
      value: profile?.email,
      icon: Mail,
    },
    {
      label: 'Role',
      value: profile?.role.toUpperCase(),
      icon: Shield,
    },
    {
      label: 'Phone Number',
      value: profile?.contactNumber,
      icon: Phone,
    },
    {
      label: 'Member Since',
      value: formatDate(profile?.createdAt),
      icon: Calendar,
    },
  ];

  const locationFields = [
    {
      label: 'City',
      value: profile?.client?.location?.city,
    },
    {
      label: 'Postal Code',
      value: profile?.client?.location?.zipCode,
    },
    {
      label: 'Street',
      value: profile?.client?.location?.street,
    },
    {
      label: 'Building',
      value: profile?.client?.location?.buildingNumber,
    },
    {
      label: 'Apartment',
      value: profile?.client?.location?.apartmentNumber,
    },
  ];

  const trainerFields = [
    {
      label: 'Specialization',
      value: profile?.trainer?.specialization,
      icon: User,
    },
    {
      label: 'Description',
      value: profile?.trainer?.description,
      icon: User,
    },
  ];

  const role = (profile?.role || user?.role || '').toUpperCase();

  const clientProfileItems = [
    { title: 'Personal Information', path: '/profile#personal', icon: User },
    { title: 'Address', path: '/profile#address', icon: MapPin },
    { title: 'Training Form', path: '/profile#training-form', icon: Dumbbell },
  ];

  const trainerProfileItems = [
    { title: 'Personal Information', path: '/profile#personal', icon: User },
    {
      title: 'Trainer Details',
      path: '/profile#trainer-details',
      icon: Dumbbell,
    },
  ];

  const profileItems =
    role === 'TRAINER' ? trainerProfileItems : clientProfileItems;

  return (
    <div className="min-h-screen flex flex-col">
      <SidebarProvider>
        <div className="sm:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-12 px-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span className="font-semibold">Menu</span>
          </div>
          <div className="text-sm text-muted-foreground">Profile</div>
        </div>
        <div className="flex flex-1">
          <DashboardSidebar profileItems={profileItems} />

          <main className="flex-1 px-4 pt-16 pb-8 sm:px-8 sm:pt-8 md:px-8 lg:px-12">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your account information
                  </p>
                </div>
              </div>

              {isLoading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Personal Information */}
                  <Card id="personal">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Your basic account details
                      </CardDescription>
                      <CardAction>
                        <Button
                          onClick={handleEdit}
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="divide-y">
                      {personalFields.map((field) => (
                        <InfoItem
                          key={field.label}
                          icon={field.icon}
                          label={field.label}
                          value={field.value}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  {/* Client address Information */}
                  {profile?.client?.location && (
                    <Card id="address">
                      <CardHeader>
                        <CardTitle>Address</CardTitle>
                        <CardDescription>Your location details</CardDescription>
                      </CardHeader>
                      <CardContent className="divide-y">
                        {locationFields.map((field) => (
                          <InfoItem
                            key={field.label}
                            icon={MapPin}
                            label={field.label}
                            value={field.value}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Trainer Information */}
                  {profile?.trainer && (
                    <Card id="trainer-details">
                      <CardHeader>
                        <CardTitle>Trainer Information</CardTitle>
                        <CardDescription>Your trainer details</CardDescription>
                      </CardHeader>
                      <CardContent className="divide-y">
                        {trainerFields.map((field) => (
                          <InfoItem
                            key={field.label}
                            icon={User}
                            label={field.label}
                            value={field.value}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Future Form Section */}
                  {profile?.client && (
                    <Card id="training-form" className="border-dashed">
                      <CardHeader>
                        <CardTitle className="text-muted-foreground">
                          Training Form
                        </CardTitle>
                        <CardDescription>
                          More options will be available here in the future
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                          <p className="text-sm">Form section coming soon...</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default ProfilePage;
