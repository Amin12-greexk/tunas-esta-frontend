// src/components/layout/header.tsx - Complete version
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getInitials } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Users,
  Building2,
  FileText,
  CreditCard,
  Calendar,
  BarChart3,
  Clock,
  X,
  ArrowRight,
  Command as CommandIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { apiClient } from '@/lib/api';

interface HeaderProps {
  onMenuClick: () => void;
}

type SearchResultType = 'employee' | 'department' | 'menu';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  href: string;
  badge?: string;
}

interface Employee {
  karyawan_id: number;
  nik: string;
  nama_lengkap: string;
  email?: string;
  status?: string;
  departemenSaatIni?: { nama_departemen: string };
  jabatanSaatIni?: { nama_jabatan: string };
}

interface Department {
  departemen_id: number;
  nama_departemen: string;
  karyawan_count?: number;
}

const menuItems: SearchResult[] = [
  {
    id: 'dashboard',
    type: 'menu',
    title: 'Dashboard',
    description: 'Halaman utama dengan ringkasan data',
    icon: <BarChart3 className="h-4 w-4" />,
    href: '/dashboard',
  },
  {
    id: 'employees',
    type: 'menu',
    title: 'Karyawan',
    description: 'Kelola data karyawan',
    icon: <Users className="h-4 w-4" />,
    href: '/karyawan',
  },
  {
    id: 'attendance',
    type: 'menu',
    title: 'Absensi',
    description: 'Monitoring kehadiran karyawan',
    icon: <Clock className="h-4 w-4" />,
    href: '/absensi',
  },
  {
    id: 'payroll',
    type: 'menu',
    title: 'Penggajian',
    description: 'Proses dan kelola gaji karyawan',
    icon: <CreditCard className="h-4 w-4" />,
    href: '/payroll',
  },
  {
    id: 'departments',
    type: 'menu',
    title: 'Departemen',
    description: 'Kelola departemen perusahaan',
    icon: <Building2 className="h-4 w-4" />,
    href: '/master/departemen',
  },
  {
    id: 'schedule',
    type: 'menu',
    title: 'Jadwal Shift',
    description: 'Atur jadwal kerja karyawan',
    icon: <Calendar className="h-4 w-4" />,
    href: '/schedule',
  },
  {
    id: 'reports',
    type: 'menu',
    title: 'Laporan',
    description: 'Laporan dan analisis data',
    icon: <FileText className="h-4 w-4" />,
    href: '/reports',
  },
  {
    id: 'settings',
    type: 'menu',
    title: 'Pengaturan',
    description: 'Konfigurasi sistem',
    icon: <Settings className="h-4 w-4" />,
    href: '/settings',
  },
];

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  // Data sources
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Demo notifications (ganti dengan API bila sudah ada)
  const [notifications] = useState([
    { id: 1, title: 'Absensi Terlambat', message: '5 karyawan terlambat hari ini', type: 'warning' as const, time: '5 menit lalu' },
    { id: 2, title: 'Payroll Generated', message: 'Gaji bulan ini telah digenerate', type: 'success' as const, time: '1 jam lalu' },
  ]);

  // Load lists for search
  useEffect(() => {
    (async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          apiClient.getKaryawan(),
          apiClient.getDepartemen(),
        ]);

        const empRaw = empRes.data || [];
        const deptRaw = deptRes.data || [];

        // Jika backend kirim {data: [...]}, fallback:
        const empList: Employee[] = Array.isArray(empRaw?.data) ? empRaw.data : empRaw;
        const deptList: Department[] = Array.isArray(deptRaw?.data) ? deptRaw.data : deptRaw;

        setEmployees(
          empList.filter((e) => (e.status ? e.status === 'Aktif' : true))
        );
        setDepartments(deptList);
      } catch (err) {
        // silent fail for header
        // console.error('Header data load error', err);
      }
    })();
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCmdK) {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSearchResults(true);
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getResultIcon = (result: SearchResult) => {
    switch (result.type) {
      case 'employee':
        return (
          <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <User className="h-3 w-3" />
          </div>
        );
      case 'department':
        return (
          <div className="p-1.5 rounded-md bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
            <Building2 className="h-3 w-3" />
          </div>
        );
      case 'menu':
        return (
          <div className="p-1.5 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            {result.icon}
          </div>
        );
      default:
        return result.icon;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
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

  const getRoleLabel = (role?: string) => {
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
        return role || 'User';
    }
  };

  // Search core (no debounce here)
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const lower = query.toLowerCase();
      const results: SearchResult[] = [];

      // Employees
      employees.forEach((emp) => {
        const hits =
          emp.nama_lengkap?.toLowerCase().includes(lower) ||
          emp.nik?.toLowerCase().includes(lower) ||
          emp.email?.toLowerCase().includes(lower) ||
          emp.departemenSaatIni?.nama_departemen?.toLowerCase().includes(lower) ||
          emp.jabatanSaatIni?.nama_jabatan?.toLowerCase().includes(lower);

        if (hits) {
          results.push({
            id: `emp-${emp.karyawan_id}`,
            type: 'employee',
            title: emp.nama_lengkap,
            subtitle: `NIK: ${emp.nik}`,
            description: `${emp.jabatanSaatIni?.nama_jabatan || ''} - ${emp.departemenSaatIni?.nama_departemen || ''}`,
            href: `/karyawan/${emp.karyawan_id}`,
            badge: emp.status,
          });
        }
      });

      // Departments
      departments.forEach((dept) => {
        if (dept.nama_departemen.toLowerCase().includes(lower)) {
          results.push({
            id: `dept-${dept.departemen_id}`,
            type: 'department',
            title: dept.nama_departemen,
            subtitle: 'Departemen',
            description: `${dept.karyawan_count || 0} karyawan`,
            href: `/master/departemen?highlight=${dept.departemen_id}`,
            badge: 'Departemen',
          });
        }
      });

      // Menus
      menuItems.forEach((item) => {
        if (item.title.toLowerCase().includes(lower) || item.description?.toLowerCase().includes(lower)) {
          results.push(item);
        }
      });

      // Sort relevance
      results.sort((a, b) => {
        const la = a.title.toLowerCase();
        const lb = b.title.toLowerCase();
        const exactA = la === lower;
        const exactB = lb === lower;
        if (exactA && !exactB) return -1;
        if (!exactA && exactB) return 1;

        const startsA = la.startsWith(lower);
        const startsB = lb.startsWith(lower);
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;

        return la.localeCompare(lb);
      });

      setSearchResults(results.slice(0, 8));
      setIsSearching(false);
    },
    [employees, departments]
  );

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchQuery, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      router.push(searchResults[0].href);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href);
    setShowSearchResults(false);
    setSearchQuery('');
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

        {/* Enhanced Search */}
        <div className="flex flex-1 justify-center">
          <div ref={searchRef} className="relative w-full max-w-lg">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <input
                  ref={inputRef}
                  type="search"
                  placeholder="Cari karyawan, departemen, menu... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pl-9 pr-10 py-2 text-sm focus:border-tunas-blue-500 focus:outline-none focus:ring-2 focus:ring-tunas-blue-500/20"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                  <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <CommandIcon className="h-3 w-3" />K
                  </kbd>
                </div>
              </div>
            </form>

            {/* Search Results */}
            <AnimatePresence>
              {showSearchResults && (searchQuery || searchResults.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg z-50 max-h-96 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-gray-500">Mencari...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="p-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
                        {searchResults.length} hasil ditemukan
                      </div>
                      {searchResults.map((result, idx) => (
                        <motion.button
                          key={result.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => handleResultClick(result)}
                          className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                        >
                          {getResultIcon(result)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {result.title}
                              </p>
                              {result.badge && (
                                <Badge variant="outline" className="text-xs">
                                  {result.badge}
                                </Badge>
                              )}
                            </div>
                            {result.subtitle && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{result.subtitle}</p>
                            )}
                            {result.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                {result.description}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </motion.button>
                      ))}
                    </>
                  ) : searchQuery ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">Tidak ada hasil ditemukan</p>
                      <p className="text-xs text-gray-400 mt-1">Coba kata kunci yang berbeda</p>
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Menu Populer
                      </p>
                      {menuItems.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleResultClick(item)}
                          className="w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 rounded-md"
                        >
                          <div className="p-1.5 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start p-4">
                <div className="flex items-center gap-2 w-full">
                  <div className={cn('h-2 w-2 rounded-full', n.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500')} />
                  <span className="font-medium text-sm">{n.title}</span>
                  <span className="text-xs text-gray-500 ml-auto">{n.time}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
              </DropdownMenuItem>
            ))}
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
                    <p className="text-sm font-medium leading-none">{user.nama_lengkap}</p>
                    <Badge className={cn('text-xs', getRoleBadgeColor(user.role))}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>NIK: {user.nik}</span>
                    {user.departemenSaatIni && <span>• {user.departemenSaatIni.nama_departemen}</span>}
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
              <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={logout}>
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
