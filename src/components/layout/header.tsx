'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getInitials, cn } from '@/lib/utils';
import {
  Menu,
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications] = useState([
    {
      id: 1,
      title: 'Absensi Terlambat',
      message: '5 karyawan terlambat hari ini',
      type: 'warning',
      time: '5 menit lalu',
    },
    {
      id: 2,
      title: 'Payroll Generated',
      message: 'Gaji bulan ini telah digenerate',
      type: 'success',
      time: '1 jam lalu',
    },
  ]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'it_dev':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'hr':
        return 'bg-tunas-blue-100 text-tunas-blue-800 dark:bg-tunas-blue-900 dark:text-tunas-blue-200';
      case 'direktur':
        return 'bg-tunas-yellow-100 text-tunas-yellow-800 dark:bg-tunas-yellow-900 dark:text-tunas-yellow-200';
      case 'karyawan':
        return 'bg-tunas-green-100 text-tunas-green-800 dark:bg-tunas-green-900 dark:text-tunas-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'it_dev':
        return 'IT Developer';
      case 'hr':
        return 'HR Manager';
      case 'direktur':
        return 'Direktur';
      case 'karyawan':
        return 'Karyawan';
      default:
        return role;
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md px-4 lg:px-6"
    >
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Search */}
<div className="flex flex-1 justify-center">
  <div className="relative w-full max-w-lg">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
    <input
      type="search"
      placeholder="Cari karyawan, departemen..."
      className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pl-9 pr-4 py-2 text-sm focus:border-tunas-blue-500 focus:outline-none focus:ring-2 focus:ring-tunas-blue-500/20"
    />
  </div>
</div>
      </div>

      {/* Right: Theme, Notifications, User */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center"
                >
                  {notifications.length}
                </motion.div>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-4"
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      notification.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    )}
                  />
                  <span className="font-medium text-sm">
                    {notification.title}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {notification.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))}
            {notifications.length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Tidak ada notifikasi baru
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt={user.nama_lengkap} />
                  <AvatarFallback className="tunas-gradient text-white">
                    {getInitials(user.nama_lengkap)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">
                      {user.nama_lengkap}
                    </p>
                    <Badge
                      className={cn('text-xs', getRoleBadgeColor(user.role))}
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>NIK: {user.nik}</span>
                    {user.departemenSaatIni && (
                      <span>• {user.departemenSaatIni.nama_departemen}</span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/settings/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.header>
  );
}
