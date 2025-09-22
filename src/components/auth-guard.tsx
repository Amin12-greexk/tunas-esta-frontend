'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRoles?: string[];
}

export function AuthGuard({ 
  children, 
  requiredPermission, 
  requiredRoles 
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading, hasPermission, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Check authentication
      if (!user) {
        router.push('/login');
        return;
      }

      // Check permission if required
      if (requiredPermission && !hasPermission(requiredPermission)) {
        router.push('/unauthorized');
        return;
      }

      // Check roles if required
      if (requiredRoles && !hasRole(requiredRoles)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isLoading, requiredPermission, requiredRoles, hasPermission, hasRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}