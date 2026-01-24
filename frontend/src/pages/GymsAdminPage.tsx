import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { Building, Home } from 'lucide-react';
import { GymsSection } from '@/components/gym-admin/GymsSection';

const gymAdminSidebarItems = [
  { title: 'Dashboard', path: '/dashboard', icon: Home },
  { title: 'Gyms', path: '/admin/gyms', icon: Building },
];

function GymsAdminPage() {
  const { user } = useAuth();

  // Only allow admin or gym_admin roles
  if (user?.role !== 'admin' && user?.role !== 'gym_admin') {
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
          <div className="text-sm text-muted-foreground">Gym Management</div>
        </div>
        <div className="flex flex-1">
          <DashboardSidebar profileItems={gymAdminSidebarItems} />

          <main className="flex-1 px-4 pt-16 pb-8 sm:px-8 sm:pt-8 md:px-8 lg:px-12">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Building className="h-8 w-8" />
                    Gym Management
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage gym facilities, rooms, and trainer assignments
                  </p>
                </div>
              </div>

              <div id="gyms">
                <GymsSection />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default GymsAdminPage;
