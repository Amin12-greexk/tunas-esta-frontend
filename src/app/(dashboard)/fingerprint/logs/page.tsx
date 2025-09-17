'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Fingerprint } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

interface FingerprintLog {
  id: number;
  karyawan: {
    nik: string;
    nama_lengkap: string;
    departemen: string;
  };
  status: 'masuk' | 'pulang';
  timestamp: string | null;
}

export default function FingerprintLogsPage() {
  const [logs, setLogs] = useState<FingerprintLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [search, filterDate]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Contoh endpoint, ganti sesuai backend
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (filterDate) query.append('date', filterDate);

      const res = await fetch(`/api/fingerprint/logs?${query.toString()}`);
      if (!res.ok) {
        throw new Error('Network response not ok');
      }
      const data = await res.json();

      // Pastikan data sesuai tipe FingerprintLog[]
      setLogs(data);
    } catch (err: any) {
      console.error('Error fetch logs:', err);
      setError('Gagal memuat log fingerprint');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateSafe = (datetime?: string | null) => {
    if (!datetime) return '-';
    const d = new Date(datetime);
    if (isNaN(d.getTime())) return '-';
    return formatDate(datetime, 'dd MMM yyyy');
  };

  const formatTimeSafe = (datetime?: string | null) => {
    if (!datetime) return '-';
    const d = new Date(datetime);
    if (isNaN(d.getTime())) return '-';
    return formatTime(datetime);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Fingerprint' },
    { label: 'Logs' },
  ];

  return (
    <ProtectedRoute permission="view-fingerprint-logs">
      <DashboardLayout>
        <PageHeader
          title="Fingerprint Logs"
          description="Riwayat scan fingerprint karyawan"
          breadcrumbs={breadcrumbs}
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Cari nama atau NIK..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button onClick={fetchLogs} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Filter'}
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Log Fingerprint</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Fingerprint className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada log fingerprint</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NIK</TableHead>
                      <TableHead>Nama Karyawan</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{log.karyawan.nik}</TableCell>
                        <TableCell>{log.karyawan.nama_lengkap}</TableCell>
                        <TableCell>{log.karyawan.departemen}</TableCell>
                        <TableCell>
                          {log.status === 'masuk' ? (
                            <span className="text-green-600 font-semibold">Masuk</span>
                          ) : (
                            <span className="text-red-600 font-semibold">Pulang</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDateSafe(log.timestamp)}</TableCell>
                        <TableCell>{formatTimeSafe(log.timestamp)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
