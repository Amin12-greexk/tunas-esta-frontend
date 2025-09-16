
// src/components/dashboard/stats-cards.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Building2, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-tunas-blue-100 text-tunas-blue-600 dark:bg-tunas-blue-900 dark:text-tunas-blue-400',
    green: 'bg-tunas-green-100 text-tunas-green-600 dark:bg-tunas-green-900 dark:text-tunas-green-400',
    yellow: 'bg-tunas-yellow-100 text-tunas-yellow-600 dark:bg-tunas-yellow-900 dark:text-tunas-yellow-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-tunas-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-md ${colorClasses[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {typeof value === 'number' && title.toLowerCase().includes('gaji') 
              ? formatCurrency(value) 
              : value}
          </div>
          {description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend.value > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <Badge 
                variant={trend.value > 0 ? 'default' : 'destructive'}
                className="text-xs"
              >
                {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface DashboardStatsProps {
  stats: {
    totalKaryawan: number;
    karyawanAktif: number;
    hadirHariIni: number;
    totalDepartemen: number;
    totalGajiTambahan: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: 'Total Karyawan',
      value: stats.totalKaryawan,
      description: `${stats.karyawanAktif} aktif`,
      icon: Users,
      color: 'blue' as const,
      trend: {
        value: 5,
        label: 'bulan ini',
      },
    },
    {
      title: 'Hadir Hari Ini',
      value: stats.hadirHariIni,
      description: `dari ${stats.karyawanAktif} karyawan`,
      icon: UserCheck,
      color: 'green' as const,
      trend: {
        value: 2,
        label: 'dari kemarin',
      },
    },
    {
      title: 'Total Departemen',
      value: stats.totalDepartemen,
      description: 'departemen aktif',
      icon: Building2,
      color: 'yellow' as const,
    },
    {
      title: 'Gaji Tambahan Bulan Ini',
      value: stats.totalGajiTambahan,
      description: 'lembur, premi & uang makan',
      icon: Clock,
      color: 'green' as const,
      trend: {
        value: 12,
        label: 'dari bulan lalu',
      },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <StatCard {...card} />
        </motion.div>
      ))}
    </div>
  );
}