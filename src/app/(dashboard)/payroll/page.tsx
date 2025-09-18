
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
import { formatCurrency } from '@/lib/utils';
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
  DollarSign,
  Filter,
  Search,
  CalendarDays,
  CalendarClock,
  Users,
  BanknoteIcon,
  Building2,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Interface untuk Payroll Harian
interface PayrollHarian {
  no: number;
  pin: string;
  nama: string;
  rek: string;
  hari: string;
  gajiPokok: number;
  week: number;
  jamPertamaLembur: number;
  jamKeduaLembur: number;
  jamLemburSabtu: number;
  jamLemburMinggu: number;
  jamLemburLibur: number;
  upah: number;
  upahLemburWeekday: number;
  upahLemburSabtu: number;
  upahLemburMinggu: number;
  upahLemburLibur: number;
  subsidi: number;
  departemen?: string;
  jabatan?: string;
  status?: 'draft' | 'approved' | 'paid';
}

// Interface untuk Payroll Bulanan
interface PayrollBulanan {
  no: number;
  nik: string;
  nama: string;
  rekening: string;
  departemen: string;
  jabatan: string;
  hariKerja: number;
  gajiPokok: number;
  tunjanganJabatan: number;
  tunjanganTransport: number;
  tunjanganMakan: number;
  tunjanganKehadiran: number;
  lembur: number;
  bonus: number;
  potonganAbsen: number;
  potonganBpjs: number;
  potonganPinjaman: number;
  totalGaji: number;
  status: 'draft' | 'approved' | 'paid';
}

export default function PayrollPage() {
  const [tipePeriode, setTipePeriode] = useState<'harian' | 'bulanan'>('harian');
  const [payrollHarian, setPayrollHarian] = useState<PayrollHarian[]>([]);
  const [payrollBulanan, setPayrollBulanan] = useState<PayrollBulanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('2024-01');
  const [selectedDepartemen, setSelectedDepartemen] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Statistics
  const [stats, setStats] = useState({
    totalGaji: 0,
    totalKaryawan: 0,
    totalLembur: 0,
    totalTunjangan: 0,
    karyawanHarian: 0,
    karyawanBulanan: 0,
    totalPotongan: 0,
    totalBersih: 0,
  });

  useEffect(() => {
    loadPayrollData();
  }, [selectedPeriode, tipePeriode]);

  const loadPayrollData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (tipePeriode === 'harian') {
        // Mock data untuk payroll harian
        const mockHarian: PayrollHarian[] = [
          {
            no: 1,
            pin: '550',
            nama: 'SITI NURKIPTIYAH',
            rek: '7638822226300',
            hari: '6/6',
            gajiPokok: 83000,
            week: 251,
            jamPertamaLembur: 5,
            jamKeduaLembur: 14.5,
            jamLemburSabtu: 8,
            jamLemburMinggu: 0,
            jamLemburLibur: 0,
            upah: 415000,
            upahLemburWeekday: 385254,
            upahLemburSabtu: 168879,
            upahLemburMinggu: 0,
            upahLemburLibur: 0,
            subsidi: 0,
            departemen: 'Produksi',
            jabatan: 'Operator',
            status: 'paid'
          },
          {
            no: 2,
            pin: '575',
            nama: 'NOVITA RATNA SARI',
            rek: '7638851827100',
            hari: '6/6',
            gajiPokok: 104000,
            week: 573,
            jamPertamaLembur: 4.5,
            jamKeduaLembur: 2.5,
            jamLemburSabtu: 7.5,
            jamLemburMinggu: 0,
            jamLemburLibur: 0,
            upah: 520000,
            upahLemburWeekday: 155399,
            upahLemburSabtu: 198382,
            upahLemburMinggu: 0,
            upahLemburLibur: 0,
            subsidi: 0,
            departemen: 'Quality Control',
            jabatan: 'Inspector',
            status: 'approved'
          },
          // Add more mock data...
        ];
        
        setPayrollHarian(mockHarian);
        
        // Calculate stats for harian
        const totalGajiHarian = mockHarian.reduce((sum, item) => 
          sum + item.upah + item.upahLemburWeekday + item.upahLemburSabtu + 
          item.upahLemburMinggu + item.upahLemburLibur + item.subsidi, 0
        );
        
        const totalLemburHarian = mockHarian.reduce((sum, item) => 
          sum + item.upahLemburWeekday + item.upahLemburSabtu + 
          item.upahLemburMinggu + item.upahLemburLibur, 0
        );
        
        setStats(prev => ({
          ...prev,
          totalGaji: totalGajiHarian,
          totalKaryawan: mockHarian.length,
          karyawanHarian: mockHarian.length,
          totalLembur: totalLemburHarian,
          totalBersih: totalGajiHarian,
        }));
        
      } else {
        // Mock data untuk payroll bulanan
        const mockBulanan: PayrollBulanan[] = [
          {
            no: 1,
            nik: 'EMP001',
            nama: 'Ahmad Wijaya',
            rekening: '1234567890',
            departemen: 'Management',
            jabatan: 'General Manager',
            hariKerja: 22,
            gajiPokok: 15000000,
            tunjanganJabatan: 5000000,
            tunjanganTransport: 1500000,
            tunjanganMakan: 1000000,
            tunjanganKehadiran: 500000,
            lembur: 2000000,
            bonus: 3000000,
            potonganAbsen: 0,
            potonganBpjs: 450000,
            potonganPinjaman: 1000000,
            totalGaji: 26550000,
            status: 'paid'
          },
          {
            no: 2,
            nik: 'EMP002',
            nama: 'Siti Nurhaliza',
            rekening: '0987654321',
            departemen: 'Human Resources',
            jabatan: 'HR Manager',
            hariKerja: 21,
            gajiPokok: 8000000,
            tunjanganJabatan: 2000000,
            tunjanganTransport: 750000,
            tunjanganMakan: 500000,
            tunjanganKehadiran: 400000,
            lembur: 500000,
            bonus: 1000000,
            potonganAbsen: 200000,
            potonganBpjs: 240000,
            potonganPinjaman: 0,
            totalGaji: 12710000,
            status: 'approved'
          },
          {
            no: 3,
            nik: 'EMP003',
            nama: 'Budi Santoso',
            rekening: '5432167890',
            departemen: 'Finance',
            jabatan: 'Finance Staff',
            hariKerja: 22,
            gajiPokok: 5500000,
            tunjanganJabatan: 500000,
            tunjanganTransport: 500000,
            tunjanganMakan: 400000,
            tunjanganKehadiran: 300000,
            lembur: 800000,
            bonus: 0,
            potonganAbsen: 0,
            potonganBpjs: 165000,
            potonganPinjaman: 500000,
            totalGaji: 7335000,
            status: 'draft'
          },
        ];
        
        setPayrollBulanan(mockBulanan);
        
        // Calculate stats for bulanan
        setStats(prev => ({
          ...prev,
          totalGaji: mockBulanan.reduce((sum, item) => sum + item.totalGaji, 0),
          totalKaryawan: mockBulanan.length,
          karyawanBulanan: mockBulanan.length,
          totalTunjangan: mockBulanan.reduce((sum, item) => 
            sum + item.tunjanganJabatan + item.tunjanganTransport + 
            item.tunjanganMakan + item.tunjanganKehadiran, 0
          ),
          totalPotongan: mockBulanan.reduce((sum, item) => 
            sum + item.potonganAbsen + item.potonganBpjs + item.potonganPinjaman, 0
          ),
          totalLembur: mockBulanan.reduce((sum, item) => sum + item.lembur, 0),
          totalBersih: mockBulanan.reduce((sum, item) => sum + item.totalGaji, 0),
        }));
      }
    } catch (error) {
      console.error('Error loading payroll data:', error);
      setError('Gagal memuat data penggajian');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalGajiHarian = (item: PayrollHarian) => {
    return item.upah + item.upahLemburWeekday + item.upahLemburSabtu + 
           item.upahLemburMinggu + item.upahLemburLibur + item.subsidi;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Dibayar</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Disetujui</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Penggajian' },
  ];

  const filteredHarian = payrollHarian.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.pin.includes(searchTerm);
    const matchDepartemen = selectedDepartemen === 'all' || item.departemen === selectedDepartemen;
    return matchSearch && matchDepartemen;
  });

  const filteredBulanan = payrollBulanan.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.nik.includes(searchTerm);
    const matchDepartemen = selectedDepartemen === 'all' || item.departemen === selectedDepartemen;
    return matchSearch && matchDepartemen;
  });

  return (
    <ProtectedRoute permission="process-payroll">
      <DashboardLayout>
        <PageHeader
          title="Penggajian Karyawan"
          description="Kelola dan proses penggajian karyawan harian dan bulanan"
          breadcrumbs={breadcrumbs}
          action={
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button asChild>
                <Link href="/payroll/generate">
                  <Calculator className="h-4 w-4 mr-2" />
                  Generate Gaji
                </Link>
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
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalBersih)}</p>
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
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-gray-500">Harian: {stats.karyawanHarian}</span>
                    <span className="text-xs text-gray-500">Bulanan: {stats.karyawanBulanan}</span>
                  </div>
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {tipePeriode === 'harian' ? 'Total Subsidi' : 'Total Tunjangan'}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(tipePeriode === 'harian' ? 0 : stats.totalTunjangan)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tipePeriode === 'harian' ? 'Tunjangan harian' : 'Semua tunjangan'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                  <BanknoteIcon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <CardTitle>Detail Penggajian</CardTitle>
                <Tabs value={tipePeriode} onValueChange={(value) => setTipePeriode(value as 'harian' | 'bulanan')}>
                  <TabsList>
                    <TabsTrigger value="harian" className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Harian
                    </TabsTrigger>
                    <TabsTrigger value="bulanan" className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      Bulanan
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari nama atau ID..."
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
                    <SelectItem value="2024-01">Januari 2024</SelectItem>
                    <SelectItem value="2023-12">Desember 2023</SelectItem>
                    <SelectItem value="2023-11">November 2023</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDepartemen} onValueChange={setSelectedDepartemen}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Departemen</SelectItem>
                    <SelectItem value="Produksi">Produksi</SelectItem>
                    <SelectItem value="Quality Control">Quality Control</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                {/* Tabel Payroll Harian */}
                {tipePeriode === 'harian' && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-green-600 hover:bg-green-600">
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">No</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">PIN</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300">Nama</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300">Departemen</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Rek</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Hari</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Gaji<br/>Pokok</TableHead>
                          <TableHead colSpan={5} className="text-white border border-gray-300 text-center">Jam Lembur</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Upah</TableHead>
                          <TableHead colSpan={4} className="text-white border border-gray-300 text-center">Upah Lembur</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Subsidi</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Total</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Status</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Aksi</TableHead>
                        </TableRow>
                        <TableRow className="bg-green-600 hover:bg-green-600">
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Jam I</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Jam II</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Sabtu</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Minggu</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Libur</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Weekday</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Sabtu</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Minggu</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Libur</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHarian.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={19} className="text-center py-8">
                              <div className="text-gray-500">
                                <CalendarDays className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>Tidak ada data payroll harian</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredHarian.map((item, index) => (
                            <motion.tr
                              key={item.no}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50"
                            >
                              <TableCell className="border border-gray-300 text-center">{item.no}</TableCell>
                              <TableCell className="border border-gray-300 text-center font-medium">{item.pin}</TableCell>
                              <TableCell className="border border-gray-300 font-medium">{item.nama}</TableCell>
                              <TableCell className="border border-gray-300">{item.departemen}</TableCell>
                              <TableCell className="border border-gray-300 text-center">{item.rek}</TableCell>
                              <TableCell className="border border-gray-300 text-center">{item.hari}</TableCell>
                              <TableCell className="border border-gray-300 text-right">{item.gajiPokok.toLocaleString()}</TableCell>
                              <TableCell className="border border-gray-300 text-center">{item.jamPertamaLembur}</TableCell>
                              <TableCell className="border border-gray-300 text-center">{item.jamKeduaLembur}</TableCell>
                              <TableCell className="border border-gray-300 text-center">{item.jamLemburSabtu}</TableCell>
                              <TableCell className="border border-gray-300 text-center">{item.jamLemburMinggu}</TableCell>
                              <TableCell className="border border-gray-300 text-center">{item.jamLemburLibur}</TableCell>
                              <TableCell className="border border-gray-300 text-right font-semibold">{item.upah.toLocaleString()}</TableCell>
                              <TableCell className="border border-gray-300 text-right">{item.upahLemburWeekday.toLocaleString()}</TableCell>
                              <TableCell className="border border-gray-300 text-right">{item.upahLemburSabtu.toLocaleString()}</TableCell>
                              <TableCell className="border border-gray-300 text-right">{item.upahLemburMinggu.toLocaleString()}</TableCell>
                              <TableCell className="border border-gray-300 text-right">{item.upahLemburLibur.toLocaleString()}</TableCell>
                              <TableCell className="border border-gray-300 text-right">{item.subsidi.toLocaleString()}</TableCell>
                              <TableCell className="border border-gray-300 text-right font-bold text-green-600">
                                {calculateTotalGajiHarian(item).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-center">
                                {getStatusBadge(item.status || 'draft')}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Lihat Detail
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
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
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Tabel Payroll Bulanan */}
                {tipePeriode === 'bulanan' && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-600 hover:bg-blue-600">
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">No</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">NIK</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300">Nama Karyawan</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300">Departemen</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300">Jabatan</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Hari<br/>Kerja</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Gaji<br/>Pokok</TableHead>
                          <TableHead colSpan={5} className="text-white border border-gray-300 text-center">Tunjangan</TableHead>
                          <TableHead colSpan={2} className="text-white border border-gray-300 text-center">Tambahan</TableHead>
                          <TableHead colSpan={3} className="text-white border border-gray-300 text-center">Potongan</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Total<br/>Gaji</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Status</TableHead>
                          <TableHead rowSpan={2} className="text-white border border-gray-300 text-center">Aksi</TableHead>
                        </TableRow>
                        <TableRow className="bg-blue-600 hover:bg-blue-600">
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Jabatan</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Transport</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Makan</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Kehadiran</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Total</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Lembur</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Bonus</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Absen</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">BPJS</TableHead>
                          <TableHead className="text-white border border-gray-300 text-center text-xs">Pinjaman</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBulanan.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={18} className="text-center py-8">
                              <div className="text-gray-500">
                                <CalendarClock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>Tidak ada data payroll bulanan</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          <>
                            {filteredBulanan.map((item, index) => {
                              const totalTunjangan = item.tunjanganJabatan + item.tunjanganTransport + 
                                                    item.tunjanganMakan + item.tunjanganKehadiran;
                              return (
                                <motion.tr
                                  key={item.no}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="hover:bg-gray-50"
                                >
                                  <TableCell className="border border-gray-300 text-center">{item.no}</TableCell>
                                  <TableCell className="border border-gray-300 text-center font-medium">{item.nik}</TableCell>
                                  <TableCell className="border border-gray-300">
                                    <div>
                                      <p className="font-medium">{item.nama}</p>
                                      <p className="text-xs text-gray-500">Rek: {item.rekening}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="border border-gray-300">{item.departemen}</TableCell>
                                  <TableCell className="border border-gray-300">{item.jabatan}</TableCell>
                                  <TableCell className="border border-gray-300 text-center">{item.hariKerja}</TableCell>
                                  <TableCell className="border border-gray-300 text-right font-semibold">
                                    {item.gajiPokok.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 text-right">{item.tunjanganJabatan.toLocaleString()}</TableCell>
                                  <TableCell className="border border-gray-300 text-right">{item.tunjanganTransport.toLocaleString()}</TableCell>
                                  <TableCell className="border border-gray-300 text-right">{item.tunjanganMakan.toLocaleString()}</TableCell>
                                  <TableCell className="border border-gray-300 text-right">{item.tunjanganKehadiran.toLocaleString()}</TableCell>
                                  <TableCell className="border border-gray-300 text-right font-semibold bg-blue-50">
                                    {totalTunjangan.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 text-right">{item.lembur.toLocaleString()}</TableCell>
                                  <TableCell className="border border-gray-300 text-right">{item.bonus.toLocaleString()}</TableCell>
                                  <TableCell className="border border-gray-300 text-right text-red-600">
                                    {item.potonganAbsen > 0 && '-'}{item.potonganAbsen.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 text-right text-red-600">
                                    {item.potonganBpjs > 0 && '-'}{item.potonganBpjs.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 text-right text-red-600">
                                    {item.potonganPinjaman > 0 && '-'}{item.potonganPinjaman.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 text-right font-bold text-green-600 text-lg">
                                    {item.totalGaji.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 text-center">
                                    {getStatusBadge(item.status)}
                                  </TableCell>
                                  <TableCell className="border border-gray-300 text-center">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          <Eye className="mr-2 h-4 w-4" />
                                          Lihat Detail
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <FileText className="mr-2 h-4 w-4" />
                                          Generate Slip
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Download className="mr-2 h-4 w-4" />
                                          Download PDF
                                        </DropdownMenuItem>
                                        {item.status === 'draft' && (
                                          <>
                                            <DropdownMenuItem className="text-blue-600">
                                              <CheckCircle className="mr-2 h-4 w-4" />
                                              Approve
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                        {item.status === 'approved' && (
                                          <DropdownMenuItem className="text-green-600">
                                            <BanknoteIcon className="mr-2 h-4 w-4" />
                                            Proses Bayar
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </motion.tr>
                              );
                            })}
                            
                            {/* Total Row untuk Bulanan */}
                            <TableRow className="bg-gray-100 font-bold">
                              <TableCell colSpan={6} className="border border-gray-300 text-center">
                                TOTAL
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right">
                                {filteredBulanan.reduce((sum, item) => sum + item.gajiPokok, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right">
                                {filteredBulanan.reduce((sum, item) => sum + item.tunjanganJabatan, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right">
                                {filteredBulanan.reduce((sum, item) => sum + item.tunjanganTransport, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right">
                                {filteredBulanan.reduce((sum, item) => sum + item.tunjanganMakan, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right">
                                {filteredBulanan.reduce((sum, item) => sum + item.tunjanganKehadiran, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right bg-blue-50">
                                {filteredBulanan.reduce((sum, item) => 
                                  sum + item.tunjanganJabatan + item.tunjanganTransport + 
                                  item.tunjanganMakan + item.tunjanganKehadiran, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right">
                                {filteredBulanan.reduce((sum, item) => sum + item.lembur, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right">
                                {filteredBulanan.reduce((sum, item) => sum + item.bonus, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right text-red-600">
                                -{filteredBulanan.reduce((sum, item) => sum + item.potonganAbsen, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right text-red-600">
                                -{filteredBulanan.reduce((sum, item) => sum + item.potonganBpjs, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right text-red-600">
                                -{filteredBulanan.reduce((sum, item) => sum + item.potonganPinjaman, 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="border border-gray-300 text-right text-green-600 text-lg">
                                {filteredBulanan.reduce((sum, item) => sum + item.totalGaji, 0).toLocaleString()}
                              </TableCell>
                              <TableCell colSpan={2} className="border border-gray-300"></TableCell>
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Summary Section */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Total Pembayaran</p>
                          <p className="text-2xl font-bold text-green-800">
                            {formatCurrency(
                              tipePeriode === 'harian' 
                                ? filteredHarian.reduce((sum, item) => sum + calculateTotalGajiHarian(item), 0)
                                : filteredBulanan.reduce((sum, item) => sum + item.totalGaji, 0)
                            )}
                          </p>
                        </div>
                        <Wallet className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Jumlah Karyawan</p>
                          <p className="text-2xl font-bold text-blue-800">
                            {tipePeriode === 'harian' ? filteredHarian.length : filteredBulanan.length} Orang
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Periode Gaji</p>
                          <p className="text-xl font-bold text-purple-800">
                            {tipePeriode === 'harian' ? 'Harian' : 'Bulanan'} - {selectedPeriode}
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* File Structure Info */}
      </DashboardLayout>
    </ProtectedRoute>
  );
}