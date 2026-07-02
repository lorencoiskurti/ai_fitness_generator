import { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse, User } from '../types/index';
import { authService } from '../services/auth';

interface AuthContextType {
  user: AuthResponse;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<AuthResponse>({ authenticated: false });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check auth status on mount
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const response = await authService.checkAuth();
        setUserState(response);
      } catch (error) {
        setUserState({ authenticated: false });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const setUser = (newUser: User | null) => {
    if (newUser) {
      setUserState({
        authenticated: true,
        username: newUser.username,
        user_id: newUser.id,
        subscription_active: false,
        subscription_end_date: null,
        subscription_plan: null,
      });
    } else {
      setUserState({ authenticated: false });
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await authService.checkAuth();
      setUserState(response);
    } catch {
      // silently fail
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};