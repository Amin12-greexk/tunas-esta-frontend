'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { apiClient } from '@/lib/api';
import { 
  CreditCard,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Calculator,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  CalendarDays,
  Users,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PayrollData {
  gaji_id: number;
  nik: string;
  nama_karyawan: string;
  email: string;
  departemen: string;
  periode: string;
  periode_raw: string;
  periode_label?: string;
  tipe_periode: 'harian' | 'mingguan' | 'bulanan';
  tanggal_mulai: string;
  tanggal_selesai: string;
  total_gaji: number;
  status: 'draft' | 'approved' | 'paid' | 'cancelled';
  tanggal_bayar?: string;
  // Additional fields from detail_gaji
  detail?: {
    gaji_pokok?: number;
    upah_lembur?: number;
    premi_kehadiran?: number;
    uang_makan?: number;
    potongan_bpjs?: number;
  };
}

interface Departemen {
  departemen_id: number;
  nama_departemen: string;
}

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [departemenList, setDepartemenList] = useState<Departemen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState(
    new Date().toISOString().slice(0, 7) // Current month YYYY-MM
  );
  const [selectedDepartemen, setSelectedDepartemen] = useState('all');
  const [selectedTipePeriode, setSelectedTipePeriode] = useState<'all' | 'harian' | 'mingguan' | 'bulanan'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Statistics
  const [stats, setStats] = useState({
    totalGaji: 0,
    totalKaryawan: 0,
    totalLembur: 0,
    totalDraft: 0,
    totalApproved: 0,
    totalPaid: 0,
  });

  useEffect(() => {
    loadDepartemen();
  }, []);

  useEffect(() => {
    loadPayrollData();
  }, [selectedPeriode, selectedDepartemen, selectedTipePeriode, currentPage]);

  const loadDepartemen = async () => {
    try {
      const response = await apiClient.getDepartemen();
      setDepartemenList(response.data);
    } catch (error) {
      console.error('Error loading departemen:', error);
    }
  };

  const loadPayrollData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Build params
      const params: any = {
        periode: selectedPeriode,
        page: currentPage,
      };
      
      if (selectedDepartemen !== 'all') {
        params.departemen_id = selectedDepartemen;
      }
      
      if (selectedTipePeriode !== 'all') {
        params.tipe_periode = selectedTipePeriode;
      }

      const response = await apiClient.getAllPayrolls(params);
      
      // Response is paginated
      setPayrollData(response.data.data || []);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
      
      // Calculate statistics
      const data = response.data.data || [];
      const totalGaji = data.reduce((sum: number, item: PayrollData) => sum + (item.total_gaji || 0), 0);
      const totalDraft = data.filter((item: PayrollData) => item.status === 'draft').length;
      const totalApproved = data.filter((item: PayrollData) => item.status === 'approved').length;
      const totalPaid = data.filter((item: PayrollData) => item.status === 'paid').length;
      
      setStats({
        totalGaji,
        totalKaryawan: data.length,
        totalLembur: 0, // Will need to get from detail
        totalDraft,
        totalApproved,
        totalPaid,
      });
      
    } catch (error: any) {
      console.error('Error loading payroll data:', error);
      setError(error.response?.data?.message || 'Gagal memuat data penggajian');
      toast({
        title: "Error",
        description: "Gagal memuat data penggajian",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const response = await apiClient.bulkGeneratePayroll({
        periode: selectedPeriode,
        karyawan_ids: [] // Will need to get selected karyawan
      });
      
      toast({
        title: "Berhasil",
        description: `${response.data.success_count} payroll berhasil digenerate`,
      });
      
      loadPayrollData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal generate payroll",
        variant: "destructive",
      });
    }
  };

  const handleViewDetail = (gajiId: number) => {
    // Navigate to detail page or open modal
    window.location.href = `/payroll/slip/${gajiId}`;
  };

  const handleDownloadSlip = async (gajiId: number) => {
    try {
      const response = await apiClient.getSlipGaji(gajiId);
      // Handle PDF download
      toast({
        title: "Berhasil",
        description: "Slip gaji berhasil didownload",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal download slip gaji",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Dibayar</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Disetujui</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getTipePeriodeBadge = (tipe: string) => {
    switch(tipe) {
      case 'harian':
        return <Badge variant="outline" className="bg-orange-50">Harian</Badge>;
      case 'mingguan':
        return <Badge variant="outline" className="bg-blue-50">Mingguan</Badge>;
      case 'bulanan':
        return <Badge variant="outline" className="bg-green-50">Bulanan</Badge>;
      default:
        return <Badge variant="outline">{tipe}</Badge>;
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Penggajian' },
  ];

  const filteredData = payrollData.filter(item => {
    const matchSearch = item.nama_karyawan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.nik?.includes(searchTerm);
    return matchSearch;
  });

  // Generate periode options (last 12 months)
  const periodeOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: date.toISOString().slice(0, 7),
      label: date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
    };
  });

  return (
    <ProtectedRoute permission="process-payroll">
      <DashboardLayout>
        <PageHeader
          title="Penggajian Karyawan"
          description="Kelola dan proses penggajian karyawan"
          breadcrumbs={breadcrumbs}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button onClick={handleGeneratePayroll}>
                <Calculator className="h-4 w-4 mr-2" />
                Generate Gaji
              </Button>
            </div>
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
                  <p className="text-sm text-gray-600">Total Penggajian</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalGaji)}</p>
                  <p className="text-xs text-gray-500 mt-1">Periode {selectedPeriode}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <Wallet className="h-6 w-6" />
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
                  <p className="text-xs text-gray-500 mt-1">Dalam periode ini</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status Draft</p>
                  <p className="text-2xl font-bold">{stats.totalDraft}</p>
                  <p className="text-xs text-gray-500 mt-1">Perlu approval</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sudah Dibayar</p>
                  <p className="text-2xl font-bold">{stats.totalPaid}</p>
                  <p className="text-xs text-gray-500 mt-1">Selesai diproses</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>Daftar Penggajian</CardTitle>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari nama atau NIK..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-[250px]"
                  />
                </div>

                <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDepartemen} onValueChange={setSelectedDepartemen}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Departemen</SelectItem>
                    {departemenList.map(dept => (
                      <SelectItem key={dept.departemen_id} value={dept.departemen_id.toString()}>
                        {dept.nama_departemen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTipePeriode} onValueChange={(value) => setSelectedTipePeriode(value as any)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    <SelectItem value="harian">Harian</SelectItem>
                    <SelectItem value="mingguan">Mingguan</SelectItem>
                    <SelectItem value="bulanan">Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Tidak ada data penggajian</p>
                <p className="text-sm text-gray-400 mt-1">
                  Silakan generate gaji untuk periode {selectedPeriode}
                </p>
                <Button className="mt-4" onClick={handleGeneratePayroll}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Generate Gaji Sekarang
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NIK</TableHead>
                        <TableHead>Nama Karyawan</TableHead>
                        <TableHead>Departemen</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-right">Total Gaji</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal Bayar</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item, index) => (
                        <motion.tr
                          key={item.gaji_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">{item.nik}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.nama_karyawan}</p>
                              <p className="text-xs text-gray-500">{item.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.departemen}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{item.periode_label || item.periode}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(item.tanggal_mulai, 'dd MMM')} - {formatDate(item.tanggal_selesai, 'dd MMM yyyy')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getTipePeriodeBadge(item.tipe_periode)}</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(item.total_gaji || 0)}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            {item.tanggal_bayar ? (
                              <span className="text-sm">{formatDate(item.tanggal_bayar, 'dd MMM yyyy')}</span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetail(item.gaji_id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadSlip(item.gaji_id)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Download Slip
                                </DropdownMenuItem>
                                {item.status === 'draft' && (
                                  <DropdownMenuItem className="text-blue-600">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                )}
                                {item.status === 'approved' && (
                                  <DropdownMenuItem className="text-green-600">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Proses Bayar
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                      Halaman {currentPage} dari {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}