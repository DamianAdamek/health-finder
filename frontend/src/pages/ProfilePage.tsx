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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Edit,
  Plus,
  Dumbbell,
  Building,
  Home,
} from 'lucide-react';
import type { UserProfile } from '@/lib/authService';
import {
  fetchProfile,
  updateUser,
  updateClientLocation,
  updateTrainerProfile,
  type UpdateUserPayload,
  type UpdateClientLocationPayload,
  type UpdateTrainerPayload,
} from '@/lib/profileService';
import { TrainingFormSection } from '@/components/sections/TrainingFormSection';
import enumsService from '@/lib/enumsService';

// ===================== InfoItem Component =====================
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

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Dialog states
  const [isPersonalDialogOpen, setIsPersonalDialogOpen] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isTrainerDialogOpen, setIsTrainerDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Personal info form state
  const [personalForm, setPersonalForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
  });

  // Address form state
  const [addressForm, setAddressForm] = useState({
    city: '',
    zipCode: '',
    street: '',
    buildingNumber: '',
    apartmentNumber: '',
  });

  // Trainer form state
  const [trainerForm, setTrainerForm] = useState({
    specialization: '' as string,
    description: '',
  });

  const [trainingTypeOptions, setTrainingTypeOptions] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
    // load enums used in this page (trainer specializations)
    let mounted = true;
    (async () => {
      try {
        const types = await enumsService.getTrainingTypes();
        if (!mounted) return;
        setTrainingTypeOptions(types);
      } catch (err) {
        console.error('Failed to load training types:', err);
      }
    })();
    return () => {
      mounted = false;
    };
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

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await fetchProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  // ===================== Personal Info Handlers =====================
  const openPersonalDialog = () => {
    setPersonalForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      contactNumber: profile?.contactNumber || '',
    });
    setIsPersonalDialogOpen(true);
  };

  const handleSavePersonal = async () => {
    try {
      setIsSaving(true);
      const payload: UpdateUserPayload = {};

      if (personalForm.firstName.trim())
        payload.firstName = personalForm.firstName.trim();
      if (personalForm.lastName.trim())
        payload.lastName = personalForm.lastName.trim();
      if (personalForm.contactNumber.trim())
        payload.contactNumber = personalForm.contactNumber.trim();

      await updateUser(payload);
      await loadProfile();
      setIsPersonalDialogOpen(false);
      toast.success('Personal info updated successfully');
    } catch (error) {
      console.error('Failed to update personal info:', error);
      toast.error('Failed to update personal info');
    } finally {
      setIsSaving(false);
    }
  };

  // ===================== Address Handlers =====================
  const openAddressDialog = () => {
    setAddressForm({
      city: profile?.client?.location?.city || '',
      zipCode: profile?.client?.location?.zipCode || '',
      street: profile?.client?.location?.street || '',
      buildingNumber: profile?.client?.location?.buildingNumber || '',
      apartmentNumber: profile?.client?.location?.apartmentNumber || '',
    });
    setIsAddressDialogOpen(true);
  };

  const handleSaveAddress = async () => {
    if (
      !addressForm.city.trim() ||
      !addressForm.zipCode.trim() ||
      !addressForm.street.trim() ||
      !addressForm.buildingNumber.trim()
    ) {
      toast.error('Fields marked with * are required');
      return;
    }

    try {
      setIsSaving(true);
      const payload: UpdateClientLocationPayload = {
        city: addressForm.city.trim(),
        zipCode: addressForm.zipCode.trim(),
        street: addressForm.street.trim(),
        buildingNumber: addressForm.buildingNumber.trim(),
        apartmentNumber: addressForm.apartmentNumber.trim() || undefined,
      };

      await updateClientLocation(payload);
      await loadProfile();
      setIsAddressDialogOpen(false);
      toast.success('Address updated successfully');
    } catch (error) {
      console.error('Failed to update address:', error);
      toast.error('Address update failed');
    } finally {
      setIsSaving(false);
    }
  };

  // ===================== Trainer Handlers =====================
  const openTrainerDialog = () => {
    setTrainerForm({
      specialization: profile?.trainer?.specialization || '',
      description: profile?.trainer?.description || '',
    });
    setIsTrainerDialogOpen(true);
  };

  const handleSaveTrainer = async () => {
    try {
      setIsSaving(true);
      const payload: UpdateTrainerPayload = {};

      if (trainerForm.specialization)
        payload.specialization = trainerForm.specialization;
      if (trainerForm.description.trim())
        payload.description = trainerForm.description.trim();

      await updateTrainerProfile(payload);
      await loadProfile();
      setIsTrainerDialogOpen(false);
      toast.success('Trainer info updated successfully');
    } catch (error) {
      console.error('Failed to update trainer info:', error);
      toast.error('Failed to update trainer info');
    } finally {
      setIsSaving(false);
    }
  };

  // ===================== Field Definitions =====================
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
      value: profile?.role?.toUpperCase(),
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
    { label: 'City', value: profile?.client?.location?.city, icon: MapPin },
    {
      label: 'Postal code',
      value: profile?.client?.location?.zipCode,
      icon: MapPin,
    },
    { label: 'Street', value: profile?.client?.location?.street, icon: Home },
    {
      label: 'Building',
      value: profile?.client?.location?.buildingNumber,
      icon: Building,
    },
    {
      label: 'Apartment',
      value: profile?.client?.location?.apartmentNumber,
      icon: Building,
    },
  ];

  const trainerFields = [
    {
      label: 'Specialization',
      value: profile?.trainer?.specialization,
      icon: Dumbbell,
    },
    {
      label: 'Description',
      value: profile?.trainer?.description,
      icon: User,
    },
  ];

  const role = (profile?.role || user?.role || '').toUpperCase();
  const hasAddress = profile?.client?.location?.city;
  const hasTrainerDetails =
    profile?.trainer?.specialization || profile?.trainer?.description;

  const clientProfileItems = [
    { title: 'Personal Information', path: '/profile#personal', icon: User },
    { title: 'Address', path: '/profile#address', icon: MapPin },
    { title: 'Training Form', path: '/profile#training-form', icon: Dumbbell },
  ];

  const gymAdminProfileItems = [
    { title: 'Personal Information', path: '/profile#personal', icon: User },
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
    role === 'CLIENT'
      ? clientProfileItems
      : role === 'TRAINER'
        ? trainerProfileItems
        : gymAdminProfileItems;

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
                          onClick={openPersonalDialog}
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

                  {/* Client Address Information */}
                  {profile?.client && (
                    <Card id="address">
                      <CardHeader>
                        <CardTitle>Address</CardTitle>
                        <CardDescription>Your location data</CardDescription>
                        <CardAction>
                          <Button
                            onClick={openAddressDialog}
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            {hasAddress ? (
                              <>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                              </>
                            )}
                          </Button>
                        </CardAction>
                      </CardHeader>
                      <CardContent className="divide-y">
                        {hasAddress ? (
                          locationFields.map((field) => (
                            <InfoItem
                              key={field.label}
                              icon={field.icon}
                              label={field.label}
                              value={field.value}
                            />
                          ))
                        ) : (
                          <div className="py-8 text-center text-muted-foreground">
                            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>You haven't added your address yet.</p>
                            <p className="text-sm mt-1">
                              Add your address to help find local training
                              options.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Trainer Information */}
                  {profile?.trainer && (
                    <Card id="trainer-details">
                      <CardHeader>
                        <CardTitle>Trainer Details</CardTitle>
                        <CardDescription>Your trainer profile</CardDescription>
                        <CardAction>
                          <Button
                            onClick={openTrainerDialog}
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            {hasTrainerDetails ? (
                              <>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Complete
                              </>
                            )}
                          </Button>
                        </CardAction>
                      </CardHeader>
                      <CardContent className="divide-y">
                        {hasTrainerDetails ? (
                          trainerFields.map((field) => (
                            <InfoItem
                              key={field.label}
                              icon={field.icon}
                              label={field.label}
                              value={field.value}
                            />
                          ))
                        ) : (
                          <div className="py-8 text-center text-muted-foreground">
                            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>
                              You haven't completed your trainer profile yet.
                            </p>
                            <p className="text-sm mt-1">
                              Complete your profile so clients can find you.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Training Form Section - Separated Component */}
                  {profile?.client && (
                    <TrainingFormSection
                      clientId={profile.client.clientId!}
                      onFormUpdate={loadProfile}
                    />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>

      {/* Personal Info Dialog */}
      <Dialog
        open={isPersonalDialogOpen}
        onOpenChange={setIsPersonalDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Personal Information</DialogTitle>
            <DialogDescription>
              Update your basic information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={personalForm.firstName}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                placeholder="John"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={personalForm.lastName}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                placeholder="Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalForm.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactNumber">Phone Number</Label>
              <Input
                id="contactNumber"
                value={personalForm.contactNumber}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    contactNumber: e.target.value,
                  }))
                }
                placeholder="+1 555 555 5555"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPersonalDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePersonal} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {hasAddress ? 'Edit Address' : 'Add Address'}
            </DialogTitle>
            <DialogDescription>
              {hasAddress
                ? 'Update your address information.'
                : 'Add your address to help find nearby training options.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                  placeholder="Warsaw"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zipCode">Postal Code *</Label>
                <Input
                  id="zipCode"
                  value={addressForm.zipCode}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      zipCode: e.target.value,
                    }))
                  }
                  placeholder="00-001"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="street">Street *</Label>
              <Input
                id="street"
                value={addressForm.street}
                onChange={(e) =>
                  setAddressForm((prev) => ({
                    ...prev,
                    street: e.target.value,
                  }))
                }
                placeholder="e.g. Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="buildingNumber">Building Number *</Label>
                <Input
                  id="buildingNumber"
                  value={addressForm.buildingNumber}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      buildingNumber: e.target.value,
                    }))
                  }
                  placeholder="12A"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apartmentNumber">Apartment Number</Label>
                <Input
                  id="apartmentNumber"
                  value={addressForm.apartmentNumber}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      apartmentNumber: e.target.value,
                    }))
                  }
                  placeholder="5"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddressDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trainer Dialog */}
      <Dialog open={isTrainerDialogOpen} onOpenChange={setIsTrainerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {hasTrainerDetails
                ? 'Edit Trainer Profile'
                : 'Complete Trainer Profile'}
            </DialogTitle>
            <DialogDescription>
              Provide information about your specialization and experience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={trainerForm.specialization}
                onValueChange={(value) =>
                  setTrainerForm((prev) => ({ ...prev, specialization: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {trainingTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={trainerForm.description}
                onChange={(e) =>
                  setTrainerForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your experience, certifications, and teaching style..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTrainerDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTrainer} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfilePage;
