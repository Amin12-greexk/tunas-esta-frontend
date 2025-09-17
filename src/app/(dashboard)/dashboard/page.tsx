// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { DashboardStats } from '@/components/dashboard/stats-cards';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Users,
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalKaryawan: 0,
    karyawanAktif: 0,
    hadirHariIni: 0,
    totalDepartemen: 0,
    totalGajiTambahan: 0,
  });
  type Activity = {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    user?: string;
  };

  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load dashboard stats
      // For now using mock data, replace with actual API calls
      setStats({
        totalKaryawan: 150,
        karyawanAktif: 142,
        hadirHariIni: 138,
        totalDepartemen: 8,
        totalGajiTambahan: 25000000,
      });

      setActivities([
        {
          id: '1',
          type: 'attendance',
          title: 'Absensi Masuk',
          description: 'John Doe melakukan absensi masuk',
          timestamp: new Date().toISOString(),
          user: 'John Doe',
        },
        {
          id: '2',
          type: 'payroll',
          title: 'Slip Gaji Generated',
          description: 'Slip gaji periode Januari 2024 telah dibuat',
          timestamp: new Date().toISOString(),
        },
        {
          id: '3',
          type: 'employee',
          title: 'Karyawan Baru',
          description: 'Jane Smith telah ditambahkan sebagai karyawan',
          timestamp: new Date().toISOString(),
          user: 'HR Manager',
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Gagal memuat data dashboard');
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
      icon: Users,
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
  ];

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
          <AlertDescription>{error}</AlertDescription>
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
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-lg bg-tunas-${action.color}-100 text-tunas-${action.color}-600 dark:bg-tunas-${action.color}-900 dark:text-tunas-${action.color}-400 mb-4`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RecentActivities activities={activities} />
        </motion.div>

        {/* Today's Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
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
                      <p className="text-sm font-medium">Total Jam Kerja</p>
                      <p className="text-xs text-gray-500">Semua karyawan</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold">1,104 jam</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Tingkat Kehadiran</p>
                      <p className="text-xs text-gray-500">Persentase hadir</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-green-600">97.2%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Karyawan Terlambat</p>
                      <p className="text-xs text-gray-500">Terlambat hari ini</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">4</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button className="w-full" asChild>
                  <Link href="/absensi">
                    Lihat Detail Absensi
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}