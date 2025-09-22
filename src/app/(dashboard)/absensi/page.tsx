// src/app/(dashboard)/absensi/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Absensi } from '@/types/absensi';
import { getStatusColor, formatTime } from '@/lib/utils';
import {
  Search,
  RefreshCw,
  Fingerprint,
  Users,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { apiClient, handleApiError } from '@/lib/api';

type DepartemenOpt = { value: string; label: string };

export default function AbsensiPage() {
  const { user } = useAuth();

  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [departemenOptions, setDepartemenOptions] = useState<DepartemenOpt[]>([
    { value: 'all', label: 'Semua Departemen' },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    // YYYY-MM-DD (local)
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartemen, setFilterDepartemen] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // load master dropdown once
    loadDepartemen();
  }, []);

  useEffect(() => {
    // load absensi whenever filter changes
    loadAbsensi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, filterDepartemen, filterStatus, searchTerm]);

  const loadDepartemen = async () => {
    try {
      const res = await apiClient.getDepartemen();
      const opts: DepartemenOpt[] = [
        { value: 'all', label: 'Semua Departemen' },
        ...(Array.isArray(res.data)
          ? res.data.map((d: any) => ({
              value: String(d.nama_departemen), // filter by name (sesuai tampilan)
              label: d.nama_departemen,
            }))
          : []),
      ];
      setDepartemenOptions(opts);
    } catch (e) {
      // bukan fatal untuk halaman ini
      setDepartemenOptions([{ value: 'all', label: 'Semua Departemen' }]);
    }
  };

  const loadAbsensi = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params: any = {
        tanggal_absensi: selectedDate,
      };
      if (filterDepartemen !== 'all') params.departemen = filterDepartemen;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm.trim()) params.q = searchTerm.trim();

      const res = await apiClient.getAbsensi(params);
      const data = Array.isArray(res.data) ? res.data : [];
      setAbsensi(data);
    } catch (e: any) {
      setError(handleApiError(e) || 'Gagal memuat data absensi');
      setAbsensi([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Kalau backend belum mendukung filter di server, ini tetap aman.
  const filteredAbsensi = useMemo(() => {
    return absensi.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        item.karyawan?.nama_lengkap?.toLowerCase().includes(q) ||
        item.karyawan?.nik?.toLowerCase().includes(q);

      const matchesDepartemen =
        filterDepartemen === 'all' ||
        item.karyawan?.departemenSaatIni?.nama_departemen === filterDepartemen;

      const matchesStatus =
        filterStatus === 'all' || (item.status || '') === filterStatus;

      return matchesSearch && matchesDepartemen && matchesStatus;
    });
  }, [absensi, searchTerm, filterDepartemen, filterStatus]);

  // Statistik sederhana dari data yang tampil
  const stats = useMemo(() => {
    const total = new Set(
      filteredAbsensi.map((a) => a.karyawan?.karyawan_id).filter(Boolean)
    ).size;

    const countBy = (s: string) =>
      filteredAbsensi.filter((a) => a.status === s).length;

    return {
      totalKaryawan: total,
      hadir: countBy('Hadir'),
      terlambat: countBy('Terlambat'),
      izin: countBy('Izin'),
      cuti: countBy('Cuti'),
      alpha: countBy('Alpha'),
    };
  }, [filteredAbsensi]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Data Absensi"
        description="Monitor kehadiran karyawan harian"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Absensi' }]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAbsensi}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/fingerprint/device">
                <Fingerprint className="h-4 w-4 mr-2" />
                Sync Device
              </Link>
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Cari nama atau NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-72"
          />
        </div>

        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-[160px]"
          aria-label="Tanggal absensi"
        />

        <Select value={filterDepartemen} onValueChange={setFilterDepartemen}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Departemen" />
          </SelectTrigger>
          <SelectContent>
            {departemenOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Hadir">Hadir</SelectItem>
            <SelectItem value="Terlambat">Terlambat</SelectItem>
            <SelectItem value="Izin">Izin</SelectItem>
            <SelectItem value="Cuti">Cuti</SelectItem>
            <SelectItem value="Alpha">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistik ringkas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        <StatPill label="Total" value={stats.totalKaryawan} />
        <StatPill label="Hadir" value={stats.hadir} />
        <StatPill label="Terlambat" value={stats.terlambat} />
        <StatPill label="Izin" value={stats.izin} />
        <StatPill label="Cuti" value={stats.cuti} />
        <StatPill label="Alpha" value={stats.alpha} />
      </div>

      {/* Tabel */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAbsensi.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data absensi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIK</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Jam Masuk</TableHead>
                    <TableHead>Jam Pulang</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAbsensi.map((item, index) => (
                    <motion.tr
                      key={item.absensi_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>{item.karyawan?.nik || '-'}</TableCell>
                      <TableCell>{item.karyawan?.nama_lengkap || '-'}</TableCell>
                      <TableCell>
                        {item.karyawan?.departemenSaatIni?.nama_departemen || '-'}
                      </TableCell>
                      <TableCell>
                        {item.jam_scan_masuk ? formatTime(item.jam_scan_masuk) : '-'}
                      </TableCell>
                      <TableCell>
                        {item.jam_scan_pulang ? formatTime(item.jam_scan_pulang) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
