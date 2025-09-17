// src/app/(dashboard)/karyawan/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
import { apiClient } from '@/lib/api';
import { Karyawan } from '@/types/karyawan';
import { getStatusColor, formatDate } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Download,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function KaryawanPage() {
  const { hasPermission } = useAuth();
  const [karyawan, setKaryawan] = useState<Karyawan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartemen, setFilterDepartemen] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadKaryawan();
  }, []);

  const loadKaryawan = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Mock data for now
      const mockData: Karyawan[] = [
        {
          karyawan_id: 1,
          nik: 'NK001',
          nama_lengkap: 'John Doe',
          tempat_lahir: 'Jakarta',
          tanggal_lahir: '1990-01-01',
          jenis_kelamin: 'Laki-laki',
          alamat: 'Jl. Contoh No. 1',
          status_perkawinan: 'Menikah',
          nomor_telepon: '081234567890',
          email: 'john.doe@tunasesta.com',
          role: 'karyawan',
          tanggal_masuk: '2020-01-01',
          kategori_gaji: 'Bulanan',
          periode_gaji: 'bulanan',
          status: 'Aktif',
          departemen_id_saat_ini: 1,
          jabatan_id_saat_ini: 1,
          role_karyawan: 'produksi',
          departemenSaatIni: { 
            departemen_id: 1, 
            nama_departemen: 'Produksi',
            menggunakan_shift: true,
            created_at: '',
            updated_at: ''
          },
          jabatanSaatIni: { 
            jabatan_id: 1, 
            nama_jabatan: 'Operator',
            created_at: '',
            updated_at: ''
          },
          created_at: '2020-01-01',
          updated_at: '2024-01-01',
        },
        {
          karyawan_id: 2,
          nik: 'NK002',
          nama_lengkap: 'Jane Smith',
          tempat_lahir: 'Bandung',
          tanggal_lahir: '1992-05-15',
          jenis_kelamin: 'Perempuan',
          alamat: 'Jl. Sample No. 2',
          status_perkawinan: 'Belum Menikah',
          nomor_telepon: '081234567891',
          email: 'jane.smith@tunasesta.com',
          role: 'hr',
          tanggal_masuk: '2019-06-01',
          kategori_gaji: 'Bulanan',
          periode_gaji: 'bulanan',
          status: 'Aktif',
          departemen_id_saat_ini: 2,
          jabatan_id_saat_ini: 2,
          role_karyawan: 'staff',
          departemenSaatIni: { 
            departemen_id: 2, 
            nama_departemen: 'Human Resources',
            menggunakan_shift: false,
            created_at: '',
            updated_at: ''
          },
          jabatanSaatIni: { 
            jabatan_id: 2, 
            nama_jabatan: 'HR Manager',
            created_at: '',
            updated_at: ''
          },
          created_at: '2019-06-01',
          updated_at: '2024-01-01',
        },
      ];
      
      setKaryawan(mockData);
    } catch (error) {
      console.error('Error loading karyawan:', error);
      setError('Gagal memuat data karyawan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) return;
    
    try {
      // await apiClient.deleteKaryawan(id);
      setKaryawan(karyawan.filter(k => k.karyawan_id !== id));
    } catch (error) {
      console.error('Error deleting karyawan:', error);
      setError('Gagal menghapus karyawan');
    }
  };

  const filteredKaryawan = karyawan.filter(k => {
    const matchesSearch = k.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         k.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         k.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartemen = !filterDepartemen || k.departemenSaatIni?.nama_departemen === filterDepartemen;
    const matchesStatus = !filterStatus || k.status === filterStatus;
    
    return matchesSearch && matchesDepartemen && matchesStatus;
  });

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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Departemen</SelectItem>
                  <SelectItem value="Produksi">Produksi</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Resign">Resign</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
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
                      <TableCell>{k.departemenSaatIni?.nama_departemen}</TableCell>
                      <TableCell>{k.jabatanSaatIni?.nama_jabatan}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(k.status)}>
                          {k.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(k.tanggal_masuk, 'dd MMM yyyy')}</TableCell>
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
                                <Trash className="mr-2 h-4 w-4" />
                                Hapus
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