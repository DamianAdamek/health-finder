import { useAuth } from '@/context/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';

function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      {/* Dashboard with Sidebar */}
      <SidebarProvider>
        {/* Mobile-only floating trigger for the sidebar */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <SidebarTrigger />
        </div>
        <div className="flex flex-1">
          <DashboardSidebar />

          {/* Main Content */}
          <main className="flex-1 px-4 py-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h2 className="text-3xl font-semibold mb-4">
                Welcome to your Dashboard
              </h2>
              <p className="text-muted-foreground mb-8">
                You are logged in as <strong>{user?.email}</strong>
              </p>
              <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                <h3 className="font-medium mb-2">Your Account Details</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>User ID:</strong> {user?.userId}
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
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default DashboardPage;
