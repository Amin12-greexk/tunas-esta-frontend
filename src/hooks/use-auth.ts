// src/hooks/use-auth.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, LoginCredentials, AuthResponse } from '@/types/auth';
import { apiClient, handleApiError } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // IT_DEV has all permissions
    if (user.role === 'it_dev') return true;
    
    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      hr: [
        'view-any-karyawan', 'create-karyawan', 'update-karyawan', 'delete-karyawan',
        'manage-master-data', 'view-master-data', 'process-payroll', 'view-any-slip'
      ],
      direktur: [
        'view-any-karyawan', 'view-master-data', 'approve-payroll', 'view-any-slip'
      ],
      karyawan: [
        'view-own-slip'
      ]
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  };

  // Check if user has specific role(s)
  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(credentials);
      const authData: AuthResponse = response.data;

      // Store token
      Cookies.set('auth_token', authData.access_token, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      setUser(authData.user);
      
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${authData.user.nama_lengkap}!`,
      });

      return true;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Login Gagal",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      Cookies.remove('auth_token');
      setUser(null);
      router.push('/login');
      
      toast({
        title: "Logout Berhasil",
        description: "Anda telah keluar dari sistem.",
      });
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Don't logout on refresh error, might be network issue
    }
  };

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('auth_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        // Token is invalid, remove it
        Cookies.remove('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};