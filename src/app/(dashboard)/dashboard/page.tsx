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
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { apiClient, handleApiError } from '@/lib/api';
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
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStatsType {
  totalKaryawan: number;
  karyawanAktif: number;
  hadirHariIni: number;
  terlambatHariIni: number;
  alphaHariIni: number;
  totalDepartemen: number;
  attendanceRate: number;
  totalJamLembur: number;
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const [stats, setStats] = useState<DashboardStatsType>({
    totalKaryawan: 0,
    karyawanAktif: 0,
    hadirHariIni: 0,
    terlambatHariIni: 0,
    alphaHariIni: 0,
    totalDepartemen: 0,
    attendanceRate: 0,
    totalJamLembur: 0,
    totalGajiTambahan: 0,
  });

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');

      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().slice(0, 7);

      const [
        karyawanResult,
        departemenResult,
        attendanceResult,
        recentAbsensiResult,
        gajiTambahanResult
      ] = await Promise.allSettled([
        apiClient.getKaryawan(),
        apiClient.getDepartemen(),
        apiClient.getAbsensiSummary ? apiClient.getAbsensiSummary(today) : apiClient.getAbsensi({ start_date: today, end_date: today }),
        apiClient.getAbsensi({ 
          start_date: today, 
          end_date: today,
          limit: 10,
          sort: 'created_at',
          order: 'desc'
        }),
        apiClient.getGajiTambahanPeriode ? apiClient.getGajiTambahanPeriode(0, currentMonth) : Promise.resolve({ data: null })
      ]);

      let newStats: DashboardStatsType = {
        totalKaryawan: 0,
        karyawanAktif: 0,
        hadirHariIni: 0,
        terlambatHariIni: 0,
        alphaHariIni: 0,
        totalDepartemen: 0,
        attendanceRate: 0,
        totalJamLembur: 0,
        totalGajiTambahan: 0,
      };

      let newActivities: RecentActivity[] = [];
      let hasAnyData = false;

      // Process karyawan data
      if (karyawanResult.status === 'fulfilled') {
        try {
          const karyawanData = karyawanResult.value.data;
          const karyawanArray = Array.isArray(karyawanData) ? karyawanData : Array.isArray(karyawanData?.data) ? karyawanData.data : [];
          
          newStats.totalKaryawan = karyawanArray.length;
          newStats.karyawanAktif = karyawanArray.filter((k: any) => k.status === 'Aktif').length;
          hasAnyData = true;
        } catch (parseError) {
          console.warn('Failed to parse karyawan data');
        }
      }

      // Process departemen data
      if (departemenResult.status === 'fulfilled') {
        try {
          const departemenData = departemenResult.value.data;
          const departemenArray = Array.isArray(departemenData) ? departemenData : [];
          newStats.totalDepartemen = departemenArray.length;
          hasAnyData = true;
        } catch (parseError) {
          console.warn('Failed to parse departemen data');
        }
      }

      // Process attendance data
      if (attendanceResult.status === 'fulfilled') {
        try {
          const attendanceData = attendanceResult.value.data;
          
          if (attendanceData.hadir !== undefined) {
            // Summary format
            const summary: TodayAttendance = attendanceData;
            setTodayAttendance(summary);
            
            newStats.hadirHariIni = summary.hadir || 0;
            newStats.terlambatHariIni = summary.terlambat || 0;
            newStats.alphaHariIni = summary.alpha || 0;
            newStats.attendanceRate = summary.attendance_percentage || 0;
            newStats.totalJamLembur = summary.total_jam_lembur || 0;
          } else {
            // Raw absensi data - calculate summary
            const absensiArray = Array.isArray(attendanceData) ? attendanceData : Array.isArray(attendanceData.data) ? attendanceData.data : [];
            
            const hadir = absensiArray.filter((a: any) => a.status === 'Hadir').length;
            const terlambat = absensiArray.filter((a: any) => a.status === 'Terlambat').length;
            const alpha = absensiArray.filter((a: any) => a.status === 'Alpha').length;
            const totalJamLembur = absensiArray.reduce((sum: number, a: any) => sum + (a.jam_lembur || 0), 0);
            
            newStats.hadirHariIni = hadir;
            newStats.terlambatHariIni = terlambat;
            newStats.alphaHariIni = alpha;
            newStats.totalJamLembur = totalJamLembur;
            newStats.attendanceRate = newStats.karyawanAktif > 0 ? ((hadir + terlambat) / newStats.karyawanAktif * 100) : 0;
            
            setTodayAttendance({
              total_karyawan: newStats.karyawanAktif,
              hadir,
              terlambat,
              alpha,
              attendance_percentage: newStats.attendanceRate,
              total_jam_lembur: totalJamLembur
            });
          }
          hasAnyData = true;
        } catch (parseError) {
          console.warn('Failed to parse attendance data');
        }
      }

      // Process recent activities
      if (recentAbsensiResult.status === 'fulfilled') {
        try {
          const absensiResponse = recentAbsensiResult.value.data;
          const absensiList = Array.isArray(absensiResponse) ? absensiResponse : Array.isArray(absensiResponse.data) ? absensiResponse.data : [];

          newActivities = absensiList
            .slice(0, 10)
            .map((absensi: any, index: number): RecentActivity => ({
              id: Number(absensi.absensi_id) || Date.now() + index,
              karyawan: absensi.karyawan?.nama_lengkap || 'Unknown',
              action: absensi.jam_scan_pulang ? 'pulang' : 'masuk',
              timestamp: absensi.jam_scan_pulang || absensi.jam_scan_masuk || absensi.created_at || new Date().toISOString(),
            }))
            .filter((activity): activity is RecentActivity => 
              activity.karyawan !== 'Unknown' && 
              activity.timestamp !== undefined
            );
          hasAnyData = true;
        } catch (parseError) {
          console.warn('Failed to parse recent activities');
        }
      }

      // Process gaji tambahan
      if (gajiTambahanResult.status === 'fulfilled' && gajiTambahanResult.value.data) {
        try {
          const gajiData = gajiTambahanResult.value.data;
          newStats.totalGajiTambahan = gajiData.total || 0;
        } catch (parseError) {
          console.warn('Failed to parse gaji tambahan data');
        }
      }

      if (!hasAnyData) {
        throw new Error('Tidak dapat memuat data dari server');
      }

      setStats(newStats);
      setActivities(newActivities);
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));

    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(handleApiError(err));
      
      setStats({
        totalKaryawan: 0,
        karyawanAktif: 0,
        hadirHariIni: 0,
        terlambatHariIni: 0,
        alphaHariIni: 0,
        totalDepartemen: 0,
        attendanceRate: 0,
        totalJamLembur: 0,
        totalGajiTambahan: 0,
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
      title: 'Kelola Absensi',
      description: 'Lihat & edit data kehadiran',
      icon: Calendar,
      href: '/absensi',
      color: 'blue' as const,
      count: stats.hadirHariIni,
    },
    {
      title: 'Proses Payroll',
      description: 'Generate slip gaji',
      icon: CreditCard,
      href: '/payroll',
      color: 'green' as const,
    },
    {
      title: 'Data Karyawan',
      description: 'Kelola karyawan',
      icon: UserPlus,
      href: '/karyawan',
      color: 'purple' as const,
      count: stats.karyawanAktif,
    },
    {
      title: 'Laporan & Analisis',
      description: 'Dashboard & insights',
      icon: BarChart3,
      href: '/reports',
      color: 'orange' as const,
      count: stats.totalDepartemen,
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Memuat dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasData = stats.totalKaryawan > 0 || stats.totalDepartemen > 0 || activities.length > 0;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title={`Selamat datang, ${user?.nama_lengkap || 'User'}!`}
          description="Sistem Manajemen Absensi dan Penggajian"
        />
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Diperbarui: {lastUpdated}
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
            {isRefreshing ? 'Memuat...' : 'Refresh'}
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
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Dashboard Siap Digunakan
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Mulai dengan menambahkan data karyawan dan departemen untuk melihat statistik dan aktivitas terkini.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/karyawan/create">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Tambah Karyawan
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/master-data">
                  <Building2 className="h-4 w-4 mr-2" />
                  Kelola Master Data
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <DashboardStats stats={stats} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
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
                    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`p-3 rounded-xl transition-all duration-200 group-hover:scale-105 ${
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
                          {action.count !== undefined && action.count > 0 && (
                            <span className="text-2xl font-bold text-muted-foreground">
                              {action.count}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3 mt-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <RecentActivities 
                activities={activities}
                isLoading={isRefreshing}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Ringkasan Hari Ini
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
  {todayAttendance && stats.totalKaryawan > 0 ? (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">Hadir</p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300">
            {todayAttendance.hadir}
          </p>
          <p className="text-xs text-green-600 dark:text-green-500">
            dari {todayAttendance.total_karyawan} karyawan
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs font-medium text-red-700 dark:text-red-400">Alpha</p>
          <p className="text-2xl font-bold text-red-800 dark:text-red-300">
            {todayAttendance.alpha}
          </p>
          <p className="text-xs text-red-600 dark:text-red-500">tidak hadir</p>
        </div>
      </div>

      {todayAttendance.terlambat > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Terlambat</p>
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
            {todayAttendance.terlambat}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-500">orang terlambat</p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Tingkat Kehadiran</p>
        <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
          {Number(todayAttendance.attendance_percentage ?? 0).toFixed(1)}%
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-500">persentase kehadiran</p>
      </div>

      {todayAttendance.total_jam_lembur > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs font-medium text-purple-700 dark:text-purple-400">Total Lembur</p>
          <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
            {todayAttendance.total_jam_lembur}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-500">jam lembur</p>
        </div>
      )}
    </>
  ) : stats.totalKaryawan > 0 ? (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">Hadir</p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300">
            {stats.hadirHariIni}
          </p>
          <p className="text-xs text-green-600 dark:text-green-500">
            dari {stats.karyawanAktif} karyawan
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-xs font-medium text-red-700 dark:text-red-400">Alpha</p>
          <p className="text-2xl font-bold text-red-800 dark:text-red-300">
            {stats.alphaHariIni}
          </p>
          <p className="text-xs text-red-600 dark:text-red-500">tidak hadir</p>
        </div>
      </div>

      {stats.terlambatHariIni > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Terlambat</p>
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
            {stats.terlambatHariIni}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-500">orang terlambat</p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Tingkat Kehadiran</p>
        <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
          {Number(stats.attendanceRate ?? 0).toFixed(1)}%
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-500">persentase kehadiran</p>
      </div>

      {stats.totalJamLembur > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-xs font-medium text-purple-700 dark:text-purple-400">Total Lembur</p>
          <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
            {stats.totalJamLembur}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-500">jam lembur hari ini</p>
        </div>
      )}
    </>
  ) : (
    <div className="text-center py-8">
      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">Belum ada data absensi hari ini</p>
    </div>
  )}

  <div className="pt-4 border-t space-y-2">
    <Button className="w-full" asChild size="sm">
      <Link href="/absensi">
        <Calendar className="h-4 w-4 mr-2" />
        Lihat Detail Absensi
      </Link>
    </Button>
    <Button variant="outline" className="w-full" asChild size="sm">
      <Link href="/reports">
        <FileText className="h-4 w-4 mr-2" />
        Laporan Lengkap
      </Link>
    </Button>
  </div>
</CardContent>

              </Card>
            </motion.div>
          </div>

          {hasData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <AttendanceChart />
            </motion.div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}