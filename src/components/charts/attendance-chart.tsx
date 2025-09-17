'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AttendanceChartProps {
  data?: { date: string; hadir: number; izin: number; sakit: number; alpha: number }[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  // contoh dummy data kalau belum ada API
  const chartData =
    data && data.length > 0
      ? data
      : [
          { date: '01 Sep', hadir: 30, izin: 2, sakit: 1, alpha: 0 },
          { date: '02 Sep', hadir: 28, izin: 1, sakit: 2, alpha: 2 },
          { date: '03 Sep', hadir: 29, izin: 0, sakit: 3, alpha: 1 },
          { date: '04 Sep', hadir: 31, izin: 1, sakit: 0, alpha: 1 },
        ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Kehadiran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hadir" stackId="a" fill="#22c55e" name="Hadir" />
              <Bar dataKey="izin" stackId="a" fill="#3b82f6" name="Izin" />
              <Bar dataKey="sakit" stackId="a" fill="#f59e0b" name="Sakit" />
              <Bar dataKey="alpha" stackId="a" fill="#ef4444" name="Alpha" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
