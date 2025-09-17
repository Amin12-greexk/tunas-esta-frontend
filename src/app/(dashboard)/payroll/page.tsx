// src/app/(dashboard)/payroll/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RiwayatGaji } from '@/types/payroll';
import { 
  CreditCard,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Calculator,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState<RiwayatGaji[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('2024-01');
  const [filterDepartemen, setFilterDepartemen] = useState('');
  
  // Statistics
  const [stats, setStats] = useState({
    totalGaji: 850000000,
    totalKaryawan: 142,
    avgGaji: 5985915,
    totalLembur: 45000000,
    totalPotongan: 12000000,
    totalBersih: 838000000,
  });

  useEffect(() => {
    loadPayrollData();
  }, [selectedPeriode]);

  const loadPayrollData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Mock data for now
      const mockData: RiwayatGaji[] = [
        {
          gaji_id: 1,
          karyawan_id: 1,
          periode: '2024-01',
          periode_label: 'Januari 2024',
          tipe_periode: 'bulanan',
          periode_mulai: '2024-01-01',
          periode_selesai: '2024-01-31',
          gaji_final: 5500000,
          tanggal_pembayaran: '2024-02-01',
          karyawan: {
            karyawan_id: 1,
            nik: 'NK001',
            nama_lengkap: 'John Doe',
            email: 'john.doe@tunasesta.com',
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
            tempat_lahir: 'Jakarta',
            tanggal_lahir: '1990-01-01',
            jenis_kelamin: 'Laki-laki',
            alamat: 'Jl. Contoh No. 1',
            status_perkawinan: 'Menikah',
            nomor_telepon: '081234567890',
            role: 'karyawan',
            tanggal_masuk: '2020-01-01',
            kategori_gaji: 'Bulanan',
            periode_gaji: 'bulanan',
            status: 'Aktif',
            departemen_id_saat_ini: 1,
            jabatan_id_saat_ini: 1,
            role_karyawan: 'produksi',
            created_at: '',
            updated_at: '',
          },
          created_at: '2024-02-01',
          updated_at: '2024-02-01',
        },
        {
          gaji_id: 2,
          karyawan_id: 2,
          periode: '2024-01',
          periode_label: 'Januari 2024',
          tipe_periode: 'bulanan',
          periode_mulai: '2024-01-01',
          periode_selesai: '2024-01-31',
          gaji_final: 7500000,
          tanggal_pembayaran: '2024-02-01',
          karyawan: {
            karyawan_id: 2,
            nik: 'NK002',
            nama_lengkap: 'Jane Smith',
            email: 'jane.smith@tunasesta.com',
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
            tempat_lahir: 'Bandung',
            tanggal_lahir: '1992-05-15',
            jenis_kelamin: 'Perempuan',
            alamat: 'Jl. Sample No. 2',
            status_perkawinan: 'Belum Menikah',
            nomor_telepon: '081234567891',
            role: 'hr',
            tanggal_masuk: '2019-06-01',
            kategori_gaji: 'Bulanan',
            periode_gaji: 'bulanan',
            status: 'Aktif',
            departemen_id_saat_ini: 2,
            jabatan_id_saat_ini: 2,
            role_karyawan: 'staff',
            created_at: '',
            updated_at: '',
          },
          created_at: '2024-02-01',
          updated_at: '2024-02-01',
        },
      ];
      
      setPayrollData(mockData);
    } catch (error) {
      console.error('Error loading payroll data:', error);
      setError('Gagal memuat data penggajian');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSlip = async (gajiId: number) => {
    try {
      toast({
        title: 'Generating Slip',
        description: 'Slip gaji sedang dibuat...',
      });
      
      // Simulate API call
      setTimeout(() => {
        toast({
          title: 'Berhasil',
          description: 'Slip gaji berhasil dibuat',
        });
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal membuat slip gaji',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (tanggalPembayaran?: string) => {
    if (!tanggalPembayaran) {
      return <Badge variant="outline">Pending</Badge>;
    }
    
    const today = new Date();
    const paymentDate = new Date(tanggalPembayaran);
    
    if (paymentDate > today) {
      return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
    }
    
    return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Penggajian' },
  ];

  return (
    <ProtectedRoute permission="process-payroll">
      <DashboardLayout>
        <PageHeader
          title="Penggajian"
          description="Kelola dan proses penggajian karyawan"
          breadcrumbs={breadcrumbs}
          action={
            <Button asChild>
              <Link href="/payroll/generate">
                <Calculator className="h-4 w-4 mr-2" />
                Generate Gaji
              </Link>
            </Button>
          }
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Gaji</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalGaji)}</p>
                  <p className="text-xs text-gray-500 mt-1">Periode {selectedPeriode}</p>
                </div>
                <div className="p-3 rounded-lg bg-tunas-blue-100 text-tunas-blue-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Karyawan</p>
                  <p className="text-2xl font-bold">{stats.totalKaryawan}</p>
                  <p className="text-xs text-gray-500 mt-1">Karyawan aktif</p>
                </div>
                <div className="p-3 rounded-lg bg-tunas-green-100 text-tunas-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rata-rata Gaji</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.avgGaji)}</p>
                  <p className="text-xs text-gray-500 mt-1">Per karyawan</p>
                </div>
                <div className="p-3 rounded-lg bg-tunas-yellow-100 text-tunas-yellow-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Lembur</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalLembur)}</p>
                  <p className="text-xs text-gray-500 mt-1">Upah lembur</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>Daftar Penggajian</CardTitle>
              
              <div className="flex gap-2">
                <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-01">Januari 2024</SelectItem>
                    <SelectItem value="2023-12">Desember 2023</SelectItem>
                    <SelectItem value="2023-11">November 2023</SelectItem>
                  </SelectContent>
                </Select>

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

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : payrollData.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada data penggajian untuk periode ini</p>
                <Button className="mt-4" asChild>
                  <Link href="/payroll/generate">Generate Gaji</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NIK</TableHead>
                      <TableHead>Nama Karyawan</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Total Gaji</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal Bayar</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollData.map((gaji, index) => (
                      <motion.tr
                        key={gaji.gaji_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TableCell className="font-medium">
                          {gaji.karyawan?.nik}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{gaji.karyawan?.nama_lengkap}</p>
                            <p className="text-sm text-gray-500">{gaji.karyawan?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {gaji.karyawan?.departemenSaatIni?.nama_departemen}
                        </TableCell>
                        <TableCell>{gaji.periode_label}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(gaji.gaji_final || 0)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(gaji.tanggal_pembayaran)}
                        </TableCell>
                        <TableCell>
                          {gaji.tanggal_pembayaran ? 
                            formatDate(gaji.tanggal_pembayaran, 'dd MMM yyyy') : 
                            '-'
                          }
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
                                <Link href={`/payroll/${gaji.gaji_id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Lihat Detail
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleGenerateSlip(gaji.gaji_id)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Slip
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
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
    </ProtectedRoute>
  );
}