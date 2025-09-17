'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PayrollChartProps {
  data?: { bulan: string; total_gaji: number }[];
}

export function PayrollChart({ data }: PayrollChartProps) {
  // Dummy data kalau belum ada API
  const chartData =
    data && data.length > 0
      ? data
      : [
          { bulan: 'Jan', total_gaji: 12000000 },
          { bulan: 'Feb', total_gaji: 15000000 },
          { bulan: 'Mar', total_gaji: 14000000 },
          { bulan: 'Apr', total_gaji: 17000000 },
          { bulan: 'Mei', total_gaji: 16000000 },
        ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Payroll</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(value)
                }
              />
              <Line
                type="monotone"
                dataKey="total_gaji"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                name="Total Gaji"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
