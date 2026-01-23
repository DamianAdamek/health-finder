import { LogOut, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { ChevronsUpDown, Home, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ModeToggle } from '../ui/mode-toggle';

const sidebarItems = [{ title: 'Home', path: '/dashboard', icon: Home }];
const adminItems = [
  { title: 'User Management', path: '/admin/users', icon: Shield },
];

export function DashboardSidebar({
  profileItems,
}: {
  profileItems?: { title: string; path: string; icon: any }[];
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center justify-between px-2">
          <h1 className="text-2xl font-bold">HealthFinder</h1>
          <ModeToggle />
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === 'admin' && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.path} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Profile Section */}
        {profileItems && profileItems.length && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel>
              {user?.role === 'trainer'
                ? 'Trainer Profile'
                : user?.role === 'admin'
                  ? 'User Management'
                  : 'Client Profile'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {(profileItems ?? []).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.path} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with User Account */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="hover:bg-accent h-12 py-3 w-full">
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email?.split('@')[0]}
                      </span>
                      <Badge variant="outline" className="w-fit text-xs">
                        {user?.role}
                      </Badge>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? 'top' : 'right'}
                align={isMobile ? 'center' : 'end'}
                sideOffset={6}
                className={isMobile ? 'w-full max-w-sm mx-2' : 'w-56'}
              >
                <div className="flex flex-col gap-2 p-2">
                  <div className="text-sm">
                    <p className="font-medium truncate">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
