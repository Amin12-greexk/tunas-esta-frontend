// src/app/(dashboard)/karyawan/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Karyawan } from '@/types/karyawan';
import { getStatusColor, formatDate } from '@/lib/utils';
import { apiClient, handleApiError } from '@/lib/api';
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Download,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type DepartemenOpt = { value: string; label: string };

export default function KaryawanPage() {
  const { hasPermission } = useAuth();
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [departemenOptions, setDepartemenOptions] = useState<DepartemenOpt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartemen, setFilterDepartemen] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    (async () => {
      await Promise.all([loadKaryawan(), loadDepartemen()]);
    })();
  }, []);

  const loadKaryawan = async () => {
  try {
    setIsLoading(true);
    setError('');

    const res = await apiClient.getKaryawan();

    // handle payload yang mungkin { data: [...] }
    const raw = (res.data && Array.isArray(res.data) ? res.data
               : res.data?.data && Array.isArray(res.data.data) ? res.data.data
               : []) as any[];

    // normalisasi: snake_case -> camelCase yang dipakai komponen
    const normalized: Karyawan[] = raw.map((it: any) => ({
      ...it,
      departemenSaatIni: it.departemenSaatIni ?? it.departemen_saat_ini ?? null,
      jabatanSaatIni: it.jabatanSaatIni ?? it.jabatan_saat_ini ?? null,
    }));

    setKaryawan(normalized);
  } catch (e: any) {
    setError(handleApiError(e) || 'Gagal memuat data karyawan');
  } finally {
    setIsLoading(false);
  }
};


  const loadDepartemen = async () => {
    try {
      const res = await apiClient.getDepartemen();
      const opts: DepartemenOpt[] = [
        { value: 'all', label: 'Semua Departemen' },
        ...(Array.isArray(res.data)
          ? res.data.map((d: any) => ({
              value: String(d.nama_departemen),
              label: d.nama_departemen,
            }))
          : []),
      ];
      setDepartemenOptions(opts);
    } catch {
      setDepartemenOptions([{ value: 'all', label: 'Semua Departemen' }]);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = confirm('Apakah Anda yakin ingin menghapus karyawan ini?');
    if (!ok) return;

    try {
      setDeletingId(id);
      await apiClient.deleteKaryawan(id);
      setKaryawan((prev) => prev.filter((k) => k.karyawan_id !== id));
    } catch (e: any) {
      setError(handleApiError(e) || 'Gagal menghapus karyawan');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredKaryawan = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return karyawan.filter((k) => {
      const matchesSearch =
        !term ||
        k.nama_lengkap.toLowerCase().includes(term) ||
        k.nik.toLowerCase().includes(term) ||
        (k.email || '').toLowerCase().includes(term);

      const matchesDepartemen =
        filterDepartemen === 'all' ||
        k.departemenSaatIni?.nama_departemen === filterDepartemen;

      const matchesStatus =
        filterStatus === 'all' ||
        (k.status || '').toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesDepartemen && matchesStatus;
    });
  }, [karyawan, searchTerm, filterDepartemen, filterStatus]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Karyawan' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Daftar Karyawan"
        description="Kelola data karyawan Tunas Esta Indonesia"
        breadcrumbs={breadcrumbs}
        action={
          hasPermission('create-karyawan') && (
            <Button asChild>
              <Link href="/karyawan/create">
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Karyawan
              </Link>
            </Button>
          )
        }
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="search"
                placeholder="Cari nama, NIK, atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
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
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Resign">Resign</SelectItem>
                  <SelectItem value="Cuti">Cuti</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" title="Export (coming soon)">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredKaryawan.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada data karyawan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIK</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Masuk</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKaryawan.map((k, index) => (
                    <motion.tr
                      key={k.karyawan_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium">{k.nik}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{k.nama_lengkap}</p>
                          <p className="text-sm text-gray-500">{k.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{k.departemenSaatIni?.nama_departemen || '-'}</TableCell>
                      <TableCell>{k.jabatanSaatIni?.nama_jabatan || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(k.status)}>{k.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {k.tanggal_masuk ? formatDate(k.tanggal_masuk, 'dd MMM yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/karyawan/${k.karyawan_id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            {hasPermission('update-karyawan') && (
                              <DropdownMenuItem asChild>
                                <Link href={`/karyawan/${k.karyawan_id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {hasPermission('delete-karyawan') && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(k.karyawan_id)}
                              >
                                {deletingId === k.karyawan_id ? (
                                  <>
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2">Menghapus...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Hapus
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
