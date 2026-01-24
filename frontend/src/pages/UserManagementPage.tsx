import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Users, Dumbbell, Building2, Shield } from 'lucide-react';
import { ClientsSection } from '@/components/admin/ClientsSection';
import { TrainersSection } from '@/components/admin/TrainersSection';
import { GymAdminsSection } from '@/components/admin/GymAdminsSection';
import { Navigate } from 'react-router-dom';

const adminSidebarItems = [
  { title: 'Clients', path: '/admin/users#clients', icon: Users },
  { title: 'Trainers', path: '/admin/users#trainers', icon: Dumbbell },
  { title: 'Gym Admins', path: '/admin/users#gym-admins', icon: Building2 },
];

function UserManagementPage() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      setTimeout(
        () => el.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100
      );
    }
  }, [location]);

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SidebarProvider>
        <div className="sm:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-12 px-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span className="font-semibold">Menu</span>
          </div>
          <div className="text-sm text-muted-foreground">User Management</div>
        </div>
        <div className="flex flex-1">
          <DashboardSidebar profileItems={adminSidebarItems} />

          <main className="flex-1 px-4 pt-16 pb-8 sm:px-8 sm:pt-8 md:px-8 lg:px-12">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Shield className="h-8 w-8" />
                    User Management
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage users, trainers, and gym administrators
                  </p>
                </div>
              </div>

              <div id="clients">
                <ClientsSection />
              </div>

              <div id="trainers">
                <TrainersSection />
              </div>

              <div id="gym-admins">
                <GymAdminsSection />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default UserManagementPage;
