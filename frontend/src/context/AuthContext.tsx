import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import authService from '@/lib/authService';
import type {
  UserInfo,
  LoginCredentials,
  LoginResponse,
} from '@/lib/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const isLoggedIn = authService.isLoggedIn();
      const userInfo = authService.getUserInfo();

      setIsAuthenticated(isLoggedIn);
      setUser(userInfo);
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await authService.login(credentials);
      setIsAuthenticated(true);
      setUser({
        userId: response.userId,
        email: response.email,
        role: response.role,
      });

      // Fetch full user info after login
      const fullUserInfo = await authService.fetchAndUpdateUserInfo();
      if (fullUserInfo) {
        setUser(fullUserInfo);
      }

      return response;
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
