import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Dashboard Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard">
            <h1 className="text-xl font-bold">
              <span className="font-medium">Health</span>
              <span className="font-bold">Finder</span>
            </h1>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                {user?.role}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
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
  );
}

export default DashboardPage;
