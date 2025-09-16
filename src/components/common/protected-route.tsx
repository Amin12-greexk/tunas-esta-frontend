// src/components/common/protected-route.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from './loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  roles?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  permission, 
  roles, 
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <Alert className="m-4">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          Anda harus login untuk mengakses halaman ini.
        </AlertDescription>
      </Alert>
    );
  }

  if (permission && !hasPermission(permission)) {
    return fallback || (
      <Alert className="m-4" variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </AlertDescription>
      </Alert>
    );
  }

  if (roles && !hasRole(roles)) {
    return fallback || (
      <Alert className="m-4" variant="destructive">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          Role Anda tidak diizinkan untuk mengakses halaman ini.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}