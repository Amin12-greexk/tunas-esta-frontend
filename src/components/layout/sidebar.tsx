// src/components/layout/sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  Building2,
  Briefcase,
  Clock,
  Fingerprint,
  BarChart3,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  roles?: string[];
  children?: MenuItem[];
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'karyawan',
    label: 'Karyawan',
    icon: Users,
    permission: 'view-any-karyawan',
    children: [
      {
        id: 'karyawan-list',
        label: 'Daftar Karyawan',
        href: '/karyawan',
        icon: Users,
      },
      {
        id: 'karyawan-create',
        label: 'Tambah Karyawan',
        href: '/karyawan/create',
        icon: Users,
        permission: 'create-karyawan',
      },
    ],
  },
  {
    id: 'absensi',
    label: 'Absensi',
    icon: Calendar,
    children: [
      {
        id: 'absensi-list',
        label: 'Data Absensi',
        href: '/absensi',
        icon: Calendar,
      },
      {
        id: 'fingerprint',
        label: 'Fingerprint',
        icon: Fingerprint,
        roles: ['it_dev', 'hr'],
        children: [
          {
            id: 'fingerprint-device',
            label: 'Device Control',
            href: '/fingerprint/device',
            icon: Fingerprint,
          },
          {
            id: 'fingerprint-logs',
            label: 'Attendance Logs',
            href: '/fingerprint/logs',
            icon: Clock,
          },
        ],
      },
    ],
  },
  {
    id: 'payroll',
    label: 'Penggajian',
    icon: CreditCard,
    permission: 'process-payroll',
    children: [
      {
        id: 'payroll-list',
        label: 'Daftar Gaji',
        href: '/payroll',
        icon: CreditCard,
      },
      {
        id: 'payroll-generate',
        label: 'Generate Gaji',
        href: '/payroll/generate',
        icon: CreditCard,
      },
    ],
  },
  {
    id: 'master-data',
    label: 'Master Data',
    icon: Building2,
    permission: 'manage-master-data',
    children: [
      {
        id: 'departemen',
        label: 'Departemen',
        href: '/master-data/departemen',
        icon: Building2,
      },
      {
        id: 'jabatan',
        label: 'Jabatan',
        href: '/master-data/jabatan',
        icon: Briefcase,
      },
      {
        id: 'shift',
        label: 'Shift',
        href: '/master-data/shift',
        icon: Clock,
      },
    ],
  },
  {
    id: 'settings',
    label: 'Pengaturan',
    icon: Settings,
    children: [
      {
        id: 'setting-gaji',
        label: 'Setting Gaji',
        href: '/settings/gaji',
        icon: CreditCard,
        roles: ['it_dev', 'hr'],
      },
      {
        id: 'profile',
        label: 'Profil',
        href: '/settings/profile',
        icon: Users,
      },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, hasPermission, hasRole, logout } = useAuth();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand active menu item
  useEffect(() => {
    const findActiveParent = (items: MenuItem[]): string[] => {
      for (const item of items) {
        if (item.href === pathname) {
          return [item.id];
        }
        if (item.children) {
          const childResult = findActiveParent(item.children);
          if (childResult.length > 0) {
            return [item.id, ...childResult];
          }
        }
      }
      return [];
    };

    const activeParents = findActiveParent(menuItems);
    setExpandedItems(activeParents);
  }, [pathname]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const isItemVisible = (item: MenuItem): boolean => {
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    if (item.roles && !hasRole(item.roles)) {
      return false;
    }
    return true;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    if (!isItemVisible(item)) return null;

    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    const ItemContent = (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'group flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          level > 0 && 'ml-4',
          isActive
            ? 'tunas-gradient text-white shadow-lg'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className={cn(
            'h-4 w-4 transition-colors',
            isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
          )} />
          <span>{item.label}</span>
          {item.badge && (
            <Badge
              variant={item.badgeVariant || 'default'}
              className="h-5 px-1.5 text-xs"
            >
              {item.badge}
            </Badge>
          )}
        </div>
        
        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        )}
      </motion.div>
    );

    return (
      <div key={item.id}>
        {item.href ? (
          <Link href={item.href} onClick={onClose}>
            {ItemContent}
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpanded(item.id)}
            className="w-full"
          >
            {ItemContent}
          </button>
        )}

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="py-1 space-y-1">
                {item.children!.map(child => renderMenuItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-80 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <Logo size="md" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-full tunas-gradient flex items-center justify-center text-white font-semibold">
                  {user.nama_lengkap.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.nama_lengkap}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user.role === 'it_dev' ? 'IT Developer' : user.role}
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-4">
            <nav className="space-y-2">
              {menuItems.map(item => renderMenuItem(item))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Keluar
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}