import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Calendar,
  Building,
  Dumbbell,
  Clock,
  User,
  CheckCircle,
} from 'lucide-react';
import { fetchProfile } from '@/lib/profileService';
import { fetchTrainerProfile } from '@/lib/profileService';
import type { UserProfile } from '@/lib/authService';
import { AvailabilitySchedule } from '@/components/sections/AvailabilitySchedule';
import { TrainerGyms } from '@/components/sections/TrainerGyms';
import { ClientTrainings } from '@/components/sections/ClientTrainings';
import { TrainerTrainings } from '@/components/sections/TrainerTrainings';
import { ClientCompletedTrainings } from '@/components/sections/ClientCompletedTrainings';

function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trainerProfile, setTrainerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const role = user?.role?.toLowerCase();
  const location = useLocation();

  useEffect(() => {
    loadProfile();
  }, [role]);

  // Scroll to anchor when hash in URL changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Delay to ensure element is rendered
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [location.hash]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await fetchProfile();
      console.log('Profile data:', data);
      console.log('Client schedule:', data?.client?.schedule);
      console.log('Client scheduleId:', data?.client?.schedule?.scheduleId);
      setProfile(data);

      // If trainer, also load full trainer profile with gyms
      if (role === 'trainer') {
        const trainerData = await fetchTrainerProfile();
        console.log('Trainer profile data:', trainerData);
        console.log('Trainer schedule:', trainerData?.schedule);
        console.log('Trainer scheduleId:', trainerData?.schedule?.scheduleId);
        setTrainerProfile(trainerData);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const trainerSidebarItems = [
    { title: 'My Trainings', path: '/dashboard#trainings', icon: Dumbbell },
    { title: 'My Gyms', path: '/dashboard#gyms', icon: Building },
    { title: 'Schedule', path: '/dashboard#schedule', icon: Calendar },
  ];

  const clientSidebarItems = [
    { title: 'Trainings', path: '/dashboard#trainings', icon: Dumbbell },
    { title: 'Completed', path: '/dashboard#completed', icon: CheckCircle },
    { title: 'Availability', path: '/dashboard#availability', icon: Clock },
  ];

  const profileItems =
    role === 'trainer'
      ? trainerSidebarItems
      : role === 'client'
        ? clientSidebarItems
        : [];

  const renderTrainerDashboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Welcome, {profile?.firstName || user?.email?.split('@')[0]}!
            </CardTitle>
            <CardDescription>
              Trainer panel - manage your gyms and trainings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Building className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {trainerProfile?.gyms?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Gyms</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Dumbbell className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {trainerProfile?.specialization || 'None'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Specialization
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {trainerProfile?.rating?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trainer Trainings Section */}
        <div id="trainings">
          <TrainerTrainings onTrainingChange={loadProfile} />
        </div>

        {/* Trainer Gyms Section */}
        <div id="gyms">
          <TrainerGyms
            gyms={trainerProfile?.gyms}
            trainerId={trainerProfile?.trainerId}
            scheduleId={trainerProfile?.schedule?.scheduleId}
            onTrainingCreated={loadProfile}
          />
        </div>

        {/* Trainer Schedule Section */}
        <div id="schedule">
          <AvailabilitySchedule
            scheduleId={trainerProfile?.schedule?.scheduleId}
            title="Availability Schedule"
            description="Time windows when you are available for clients. Windows with assigned training are booked."
            isTrainer={true}
            onScheduleChange={loadProfile}
          />
        </div>
      </div>
    );
  };

  const renderClientDashboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Welcome, {profile?.firstName || user?.email?.split('@')[0]}!
            </CardTitle>
            <CardDescription>
              Client panel - find and manage your trainings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Search for trainings near you, sign up, and manage your schedule.
            </p>
          </CardContent>
        </Card>

        {/* Client Trainings Section */}
        <div id="trainings">
          <ClientTrainings onTrainingChange={loadProfile} />
        </div>

        {/* Client Completed Trainings Section */}
        <div id="completed">
          <ClientCompletedTrainings onTrainingChange={loadProfile} />
        </div>

        {/* Client Availability Schedule */}
        <div id="availability">
          <AvailabilitySchedule
            scheduleId={profile?.client?.schedule?.scheduleId}
            title="My Availability"
            description="Specify when you can have trainings. Trainers will see these time windows when planning."
            isTrainer={false}
            onScheduleChange={loadProfile}
          />
        </div>
      </div>
    );
  };

  const renderDefaultDashboard = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-3xl font-semibold mb-4">Welcome to Dashboard</h2>
      <p className="text-muted-foreground mb-8">
        Logged in as <strong>{user?.email}</strong>
      </p>
      <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
        <h3 className="font-medium mb-2">Your account</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <strong>ID:</strong> {user?.userId}
          </li>
          <li>
            <strong>Email:</strong> {user?.email}
          </li>
          <li>
            <strong>Role:</strong> {user?.role}
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SidebarProvider>
        {/* Mobile header */}
        <div className="sm:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-12 px-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span className="font-semibold">Menu</span>
          </div>
          <div className="text-sm text-muted-foreground">Dashboard</div>
        </div>

        <div className="flex flex-1">
          <DashboardSidebar profileItems={profileItems} />

          <main className="flex-1 px-4 pt-16 pb-8 sm:px-8 sm:pt-8 md:px-8 lg:px-12">
            <div className="max-w-5xl mx-auto">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  {role === 'trainer'
                    ? 'Manage your trainings and schedule'
                    : role === 'client'
                      ? 'Find and manage your trainings'
                      : 'Welcome to HealthFinder app'}
                </p>
              </div>

              {/* Role-specific content */}
              {role === 'trainer' && renderTrainerDashboard()}
              {role === 'client' && renderClientDashboard()}
              {role !== 'trainer' &&
                role !== 'client' &&
                renderDefaultDashboard()}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default DashboardPage;
