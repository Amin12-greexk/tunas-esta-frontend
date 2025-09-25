// src/components/dashboard/stats-cards.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Building2, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  isLoading?: boolean;
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = 'blue',
  isLoading = false
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  };

  const borderColors = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    yellow: 'border-l-yellow-500',
    red: 'border-l-red-500',
    purple: 'border-l-purple-500',
  };

  if (isLoading) {
    return (
      <Card className={`transition-all duration-200 border-l-4 ${borderColors[color]}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg animate-pulse ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted animate-pulse rounded mb-1"></div>
          <div className="h-3 bg-muted animate-pulse rounded w-3/4"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md border-l-4 ${borderColors[color]} group`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg transition-all group-hover:scale-105 ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground mb-1">
          {typeof value === 'number' && title.toLowerCase().includes('gaji') 
            ? formatCurrency(value) 
            : typeof value === 'number' 
            ? value.toLocaleString('id-ID')
            : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: {
    totalKaryawan: number;
    karyawanAktif: number;
    hadirHariIni: number;
    terlambatHariIni: number;
    alphaHariIni: number;
    totalDepartemen: number;
    attendanceRate: number;
    totalJamLembur: number;
    totalGajiTambahan: number;
  };
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  const attendancePercentage = stats.totalKaryawan > 0 
    ? stats.attendanceRate
    : 0;

  const cards: Array<{
    title: string;
    value: number;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  }> = [
    {
      title: 'Total Karyawan',
      value: stats.totalKaryawan,
      description: stats.karyawanAktif > 0 
        ? `${stats.karyawanAktif} aktif, ${stats.totalKaryawan - stats.karyawanAktif} tidak aktif`
        : stats.totalKaryawan > 0 
        ? 'Semua karyawan'
        : 'Belum ada karyawan',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Kehadiran Hari Ini',
      value: stats.hadirHariIni,
      description: stats.karyawanAktif > 0 
        ? `${attendancePercentage.toFixed(1)}% dari ${stats.karyawanAktif} karyawan aktif`
        : 'Belum ada data kehadiran',
      icon: UserCheck,
      color: stats.hadirHariIni >= stats.karyawanAktif * 0.8 ? 'green' : 'yellow',
    },
    {
      title: 'Terlambat & Alpha',
      value: stats.terlambatHariIni + stats.alphaHariIni,
      description: stats.terlambatHariIni > 0 || stats.alphaHariIni > 0
        ? `${stats.terlambatHariIni} terlambat, ${stats.alphaHariIni} alpha`
        : 'Semua karyawan tepat waktu',
      icon: AlertTriangle,
      color: (stats.terlambatHariIni + stats.alphaHariIni) > 0 ? 'red' : 'green',
    },
    {
      title: stats.totalJamLembur > 0 ? 'Jam Lembur Hari Ini' : 'Total Departemen',
      value: stats.totalJamLembur > 0 ? stats.totalJamLembur : stats.totalDepartemen,
      description: stats.totalJamLembur > 0 
        ? stats.hadirHariIni > 0 
          ? `${(stats.totalJamLembur / stats.hadirHariIni).toFixed(1)} jam rata-rata per orang`
          : 'Total jam lembur'
        : stats.totalDepartemen > 0 
        ? 'departemen aktif'
        : 'Belum ada departemen',
      icon: stats.totalJamLembur > 0 ? Clock : Building2,
      color: stats.totalJamLembur > 0 ? 'purple' : 'blue',
    },
  ];

  // Add gaji tambahan card if there's data
  if (stats.totalGajiTambahan > 0) {
    cards[3] = {
      title: 'Gaji Tambahan Bulan Ini',
      value: stats.totalGajiTambahan,
      description: 'Total lembur, premi & tunjangan',
      icon: Clock,
      color: 'green',
    };
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div key={card.title} className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${index * 100}ms` }}>
          <StatCard {...card} isLoading={isLoading} />
        </div>
      ))}
    </div>
  );
}