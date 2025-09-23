'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { DashboardStats } from '@/components/dashboard/stats-cards';
import RecentActivities, { RecentActivity } from '@/components/dashboard/recent-activities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  TrendingUp,
  Calendar,
  Clock,
  Users,
  CreditCard,
  FileText,
  AlertCircle,
  Building2,
  UserPlus,
} from 'lucide-react';

// API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface DashboardStatsType {
  totalKaryawan: number;
  karyawanAktif: number;
  hadirHariIni: number;
  terlambatHariIni: number;
  totalDepartemen: number;
  absensiToday: number;
  attendanceRate: number;
  totalGajiTambahan: number;
}

interface TodayAttendance {
  total_karyawan: number;
  hadir: number;
  terlambat: number;
  alpha: number;
  attendance_percentage: number;
  total_jam_lembur: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatsType>({
    totalKaryawan: 0,
    karyawanAktif: 0,
    hadirHariIni: 0,
    terlambatHariIni: 0,
    totalDepartemen: 0,
    absensiToday: 0,
    attendanceRate: 0,
    totalGajiTambahan: 0,
  });

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getApiHeaders = () => {
    const token = Cookies.get('auth_token');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const today = new Date().toISOString().split('T')[0];

      const [karyawanResponse, departemenResponse, todayAttendanceResponse, recentAbsensiResponse] =
        await Promise.allSettled([
          fetch(`${API_BASE_URL}/karyawan`, { headers: getApiHeaders() }),
          fetch(`${API_BASE_URL}/departemen`, { headers: getApiHeaders() }),
          fetch(`${API_BASE_URL}/reports/daily/${today}`, { headers: getApiHeaders() }),
          fetch(`${API_BASE_URL}/absensi?start_date=${today}&end_date=${today}`, {
            headers: getApiHeaders(),
          }),
        ]);

      // Process karyawan data
      let totalKaryawan = 0;
      let karyawanAktif = 0;
      if (karyawanResponse.status === 'fulfilled' && karyawanResponse.value.ok) {
        const karyawanData = await karyawanResponse.value.json();
        totalKaryawan = karyawanData.length;
        karyawanAktif = karyawanData.filter((k: any) => k.status === 'Aktif').length;
      }

      // Process departemen data
      let totalDepartemen = 0;
      if (departemenResponse.status === 'fulfilled' && departemenResponse.value.ok) {
        const departemenData = await departemenResponse.value.json();
        totalDepartemen = departemenData.length;
      }

      // Process today's attendance data
      let hadirHariIni = 0;
      let terlambatHariIni = 0;
      let attendanceRate = 0;
      let totalJamLembur = 0;
      if (todayAttendanceResponse.status === 'fulfilled' && todayAttendanceResponse.value.ok) {
        const attendanceData: TodayAttendance = await todayAttendanceResponse.value.json();
        setTodayAttendance(attendanceData);
        hadirHariIni = attendanceData.hadir || 0;
        terlambatHariIni = attendanceData.terlambat || 0;
        attendanceRate = attendanceData.attendance_percentage || 0;
        totalJamLembur = attendanceData.total_jam_lembur || 0;
      }

      // Process recent activities (dari absensi)
      let recentActivitiesData: RecentActivity[] = [];
      if (recentAbsensiResponse.status === 'fulfilled' && recentAbsensiResponse.value.ok) {
        const absensiData = await recentAbsensiResponse.value.json();
        const absensiList = absensiData.data || absensiData || [];

        recentActivitiesData = absensiList.slice(0, 5).map((absensi: any): RecentActivity => ({
          id: Number(absensi.absensi_id), // <-- number agar cocok dengan komponen
          karyawan: absensi.karyawan?.nama_lengkap ?? 'Karyawan',
          action: absensi.jam_scan_pulang ? 'pulang' : 'masuk',
          timestamp:
            absensi.jam_scan_pulang ??
            absensi.jam_scan_masuk ??
            new Date().toISOString(),
        }));
      }

      // Tambahkan aktivitas sistem (opsional)
      if (user) {
        recentActivitiesData.unshift({
          id: Date.now(), // number
          karyawan: user.nama_lengkap,
          action: 'masuk',
          timestamp: new Date().toISOString(),
        });
      }

      // Update stats
      setStats({
        totalKaryawan,
        karyawanAktif,
        hadirHariIni,
        terlambatHariIni,
        totalDepartemen,
        absensiToday: hadirHariIni + terlambatHariIni,
        attendanceRate,
        totalGajiTambahan: 0, // perlu API terpisah
      });

      setActivities(recentActivitiesData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Gagal memuat data dashboard');

      // Fallback stats
      setStats({
        totalKaryawan: 150,
        karyawanAktif: 142,
        hadirHariIni: 138,
        terlambatHariIni: 4,
        totalDepartemen: 8,
        absensiToday: 142,
        attendanceRate: 97.2,
        totalGajiTambahan: 25000000,
      });

      // Fallback activities (pastikan bentuknya RecentActivity)
      setActivities([
        {
          id: 1,
          karyawan: 'John Doe',
          action: 'masuk',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          karyawan: '—',
          action: 'pulang',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          karyawan: 'Jane Smith',
          action: 'masuk',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Absensi Hari Ini',
      description: 'Lihat data kehadiran',
      icon: Calendar,
      href: '/absensi',
      color: 'blue',
    },
    {
      title: 'Generate Gaji',
      description: 'Proses penggajian',
      icon: CreditCard,
      href: '/payroll/generate',
      color: 'green',
    },
    {
      title: 'Tambah Karyawan',
      description: 'Daftarkan karyawan baru',
      icon: UserPlus,
      href: '/karyawan/create',
      color: 'yellow',
    },
    {
      title: 'Laporan',
      description: 'Lihat laporan bulanan',
      icon: FileText,
      href: '/reports',
      color: 'purple',
    },
  ] as const;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={`Selamat Datang, ${user?.nama_lengkap || 'User'}!`}
        description="Monitor dan kelola sistem absensi dan penggajian Tunas Esta Indonesia"
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" className="ml-2" onClick={loadDashboardData}>
              Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <DashboardStats stats={stats} />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link href={action.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex p-3 rounded-lg mb-4 transition-all duration-200 group-hover:scale-110 ${
                        action.color === 'blue'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                          : action.color === 'green'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                          : action.color === 'yellow'
                          ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                      }`}
                    >
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{action.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        {/* Recent Activities */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <RecentActivities activities={activities} />
        </motion.div>

        {/* Today's Summary */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ringkasan Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Total Jam Lembur</p>
                      <p className="text-xs text-gray-500">Hari ini</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold">{todayAttendance?.total_jam_lembur || 0} jam</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Tingkat Kehadiran</p>
                      <p className="text-xs text-gray-500">Persentase hadir</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-green-600">{stats.attendanceRate.toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Karyawan Terlambat</p>
                      <p className="text-xs text-gray-500">Terlambat hari ini</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">{stats.terlambatHariIni}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Total Departemen</p>
                      <p className="text-xs text-gray-500">Departemen aktif</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{stats.totalDepartemen}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/absensi">Lihat Detail Absensi</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/reports">Lihat Laporan Lengkap</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
