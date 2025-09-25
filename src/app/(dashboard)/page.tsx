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
  RefreshCw,
  Activity,
} from 'lucide-react';

// API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

interface DashboardStatsType {
  totalKaryawan: number;
  karyawanAktif: number;
  hadirHariIni: number;
  terlambatHariIni: number;
  totalDepartemen: number;
  attendanceRate: number;
  totalJamLembur: number;
  alphaHariIni: number;
}

interface TodayAttendance {
  total_karyawan: number;
  hadir: number;
  terlambat: number;
  alpha: number;
  attendance_percentage: number;
  total_jam_lembur: number;
}

interface ApiError {
  message: string;
  status?: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStatsType>({
    totalKaryawan: 0,
    karyawanAktif: 0,
    hadirHariIni: 0,
    terlambatHariIni: 0,
    totalDepartemen: 0,
    attendanceRate: 0,
    totalJamLembur: 0,
    alphaHariIni: 0,
  });

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [error, setError] = useState<string>('');
  const [dataLoadTime, setDataLoadTime] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getApiHeaders = () => {
    const token = Cookies.get('auth_token');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const handleApiError = (error: any): ApiError => {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' };
    }
    return { 
      message: error.message || 'Terjadi kesalahan yang tidak diketahui',
      status: error.status 
    };
  };

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');

      const today = new Date().toISOString().split('T')[0];
      const headers = getApiHeaders();

      // Use Promise.allSettled to handle individual failures gracefully
      const [
        karyawanResponse,
        departemenResponse,
        todayAttendanceResponse,
        recentAbsensiResponse
      ] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/karyawan`, { headers }),
        fetch(`${API_BASE_URL}/departemen`, { headers }),
        fetch(`${API_BASE_URL}/reports/daily/${today}`, { headers }),
        fetch(`${API_BASE_URL}/absensi?start_date=${today}&end_date=${today}&limit=10`, { headers }),
      ]);

      // Initialize stats with safe defaults
      let newStats: DashboardStatsType = {
        totalKaryawan: 0,
        karyawanAktif: 0,
        hadirHariIni: 0,
        terlambatHariIni: 0,
        totalDepartemen: 0,
        attendanceRate: 0,
        totalJamLembur: 0,
        alphaHariIni: 0,
      };

      let newActivities: RecentActivity[] = [];
      let hasAnyData = false;

      // Process karyawan data
      if (karyawanResponse.status === 'fulfilled' && karyawanResponse.value.ok) {
        try {
          const karyawanData = await karyawanResponse.value.json();
          if (Array.isArray(karyawanData)) {
            newStats.totalKaryawan = karyawanData.length;
            newStats.karyawanAktif = karyawanData.filter((k: any) => k.status === 'Aktif').length;
            hasAnyData = true;
          }
        } catch (parseError) {
          console.warn('Failed to parse karyawan data:', parseError);
        }
      }

      // Process departemen data
      if (departemenResponse.status === 'fulfilled' && departemenResponse.value.ok) {
        try {
          const departemenData = await departemenResponse.value.json();
          if (Array.isArray(departemenData)) {
            newStats.totalDepartemen = departemenData.length;
            hasAnyData = true;
          }
        } catch (parseError) {
          console.warn('Failed to parse departemen data:', parseError);
        }
      }

      // Process today's attendance data
      if (todayAttendanceResponse.status === 'fulfilled' && todayAttendanceResponse.value.ok) {
        try {
          const attendanceData: TodayAttendance = await todayAttendanceResponse.value.json();
          setTodayAttendance(attendanceData);
          
          newStats.hadirHariIni = attendanceData.hadir || 0;
          newStats.terlambatHariIni = attendanceData.terlambat || 0;
          newStats.alphaHariIni = attendanceData.alpha || 0;
          newStats.attendanceRate = attendanceData.attendance_percentage || 0;
          newStats.totalJamLembur = attendanceData.total_jam_lembur || 0;
          hasAnyData = true;
        } catch (parseError) {
          console.warn('Failed to parse attendance data:', parseError);
        }
      }

      // Process recent activities
      if (recentAbsensiResponse.status === 'fulfilled' && recentAbsensiResponse.value.ok) {
        try {
          const absensiData = await recentAbsensiResponse.value.json();
          const absensiList = absensiData.data || absensiData || [];

          if (Array.isArray(absensiList)) {
            newActivities = absensiList
              .slice(0, 8) // Limit to 8 recent activities
              .map((absensi: any, index: number): RecentActivity => ({
                id: Number(absensi.absensi_id) || Date.now() + index,
                karyawan: absensi.karyawan?.nama_lengkap || absensi.nama_karyawan || 'Unknown',
                action: absensi.jam_scan_pulang ? 'pulang' : 'masuk',
                timestamp: absensi.jam_scan_pulang || absensi.jam_scan_masuk || new Date().toISOString(),
              }))
              .filter((activity): activity is RecentActivity => 
                activity.id !== undefined && 
                activity.karyawan !== 'Unknown' && 
                activity.timestamp !== undefined
              );
            hasAnyData = true;
          }
        } catch (parseError) {
          console.warn('Failed to parse absensi data:', parseError);
        }
      }

      if (!hasAnyData) {
        throw new Error('Tidak ada data yang berhasil dimuat dari server');
      }

      // Update state with real data
      setStats(newStats);
      setActivities(newActivities);
      setDataLoadTime(new Date().toLocaleTimeString('id-ID'));

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      const apiError = handleApiError(err);
      setError(apiError.message);

      // Only show empty state, no mock data
      setStats({
        totalKaryawan: 0,
        karyawanAktif: 0,
        hadirHariIni: 0,
        terlambatHariIni: 0,
        totalDepartemen: 0,
        attendanceRate: 0,
        totalJamLembur: 0,
        alphaHariIni: 0,
      });
      setActivities([]);
      setTodayAttendance(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const quickActions = [
    {
      title: 'Lihat Absensi',
      description: 'Data kehadiran karyawan',
      icon: Calendar,
      href: '/absensi',
      color: 'blue',
    },
    {
      title: 'Kelola Gaji',
      description: 'Proses penggajian',
      icon: CreditCard,
      href: '/payroll',
      color: 'green',
    },
    {
      title: 'Data Karyawan',
      description: 'Kelola karyawan',
      icon: UserPlus,
      href: '/karyawan',
      color: 'purple',
    },
    {
      title: 'Laporan',
      description: 'Analisis & laporan',
      icon: FileText,
      href: '/reports',
      color: 'orange',
    },
  ] as const;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-500">Memuat data dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasData = stats.totalKaryawan > 0 || stats.totalDepartemen > 0 || activities.length > 0;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <PageHeader
          title={`Selamat Datang, ${user?.nama_lengkap || 'User'}!`}
          description="Sistem Manajemen Absensi dan Penggajian"
        />
        <div className="flex items-center gap-2">
          {dataLoadTime && (
            <span className="text-xs text-gray-500">
              Diperbarui: {dataLoadTime}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-4"
            >
              {isRefreshing ? 'Memuat...' : 'Coba Lagi'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!hasData && !error ? (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Belum Ada Data
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Sistem siap digunakan. Mulai dengan menambahkan data karyawan dan departemen.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/karyawan/create">Tambah Karyawan</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/departemen">Kelola Departemen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Aksi Cepat
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link href={action.href}>
                    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border-2 hover:border-gray-300">
                      <CardContent className="p-6">
                        <div
                          className={`inline-flex p-3 rounded-xl mb-4 transition-all duration-200 group-hover:scale-105 ${
                            action.color === 'blue'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                              : action.color === 'green'
                              ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                              : action.color === 'purple'
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                              : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                          }`}
                        >
                          <action.icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3 mt-8">
            {/* Recent Activities - Takes 2 columns */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <RecentActivities 
                activities={activities}
              />
            </motion.div>

            {/* Today's Summary - Takes 1 column */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5" />
                    Ringkasan Hari Ini
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayAttendance ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Hadir</p>
                          <p className="text-lg font-bold text-green-700 dark:text-green-300">
                            {stats.hadirHariIni}
                          </p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Alpha</p>
                          <p className="text-lg font-bold text-red-700 dark:text-red-300">
                            {stats.alphaHariIni}
                          </p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Terlambat</p>
                        <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                          {stats.terlambatHariIni} orang
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Tingkat Kehadiran</p>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {stats.attendanceRate.toFixed(1)}%
                        </p>
                      </div>

                      {stats.totalJamLembur > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Jam Lembur</p>
                          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                            {stats.totalJamLembur} jam
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Belum ada data absensi hari ini</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <Button className="w-full" asChild size="sm">
                      <Link href="/absensi">Lihat Detail Absensi</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild size="sm">
                      <Link href="/reports">Laporan Lengkap</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}