// src/app/(dashboard)/absensi/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { Absensi } from '@/types/absensi';
import { Karyawan } from '@/types/karyawan';
import { getStatusColor, formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { 
  Search, 
  Filter,
  Download,
  Calendar as CalendarIcon,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Fingerprint,
  RefreshCw,
  FileText,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AbsensiPage() {
  const { user } = useAuth();
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartemen, setFilterDepartemen] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('today');

  // Statistics
  const [stats, setStats] = useState({
    totalKaryawan: 150,
    hadir: 138,
    terlambat: 4,
    izin: 3,
    cuti: 2,
    alpha: 3,
  });

  useEffect(() => {
    loadAbsensi();
  }, [selectedDate, activeTab]);

  const loadAbsensi = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Mock data for now
      const mockData: Absensi[] = [
        {
          absensi_id: 1,
          karyawan_id: 1,
          tanggal_absensi: selectedDate.toISOString().split('T')[0],
          jam_scan_masuk: '08:00:00',
          jam_scan_pulang: '17:00:00',
          durasi_lembur_menit: 0,
          status: 'Hadir',
          jam_lembur: 0,
          jenis_hari: 'weekday',
          hadir_6_hari_periode: true,
          upah_lembur: 0,
          premi: 20000,
          uang_makan: 15000,
          total_gaji_tambahan: 35000,
          karyawan: {
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
              updated_at: '',
            },
            jabatanSaatIni: {
              jabatan_id: 1,
              nama_jabatan: 'Operator',
              created_at: '',
              updated_at: '',
            },
            created_at: '',
            updated_at: '',
          },
          created_at: '',
          updated_at: '',
        },
        {
          absensi_id: 2,
          karyawan_id: 2,
          tanggal_absensi: selectedDate.toISOString().split('T')[0],
          jam_scan_masuk: '08:15:00',
          jam_scan_pulang: '17:30:00',
          durasi_lembur_menit: 30,
          status: 'Terlambat',
          jam_lembur: 0.5,
          jenis_hari: 'weekday',
          hadir_6_hari_periode: true,
          upah_lembur: 15000,
          premi: 0,
          uang_makan: 15000,
          total_gaji_tambahan: 30000,
          karyawan: {
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
              updated_at: '',
            },
            jabatanSaatIni: {
              jabatan_id: 2,
              nama_jabatan: 'HR Manager',
              created_at: '',
              updated_at: '',
            },
            created_at: '',
            updated_at: '',
          },
          created_at: '',
          updated_at: '',
        },
        {
          absensi_id: 3,
          karyawan_id: 3,
          tanggal_absensi: selectedDate.toISOString().split('T')[0],
          jam_scan_masuk: '07:55:00',
          jam_scan_pulang: '17:00:00',
          durasi_lembur_menit: 0,
          status: 'Hadir',
          jam_lembur: 0,
          jenis_hari: 'weekday',
          hadir_6_hari_periode: true,
          upah_lembur: 0,
          premi: 20000,
          uang_makan: 15000,
          total_gaji_tambahan: 35000,
          karyawan: {
            karyawan_id: 3,
            nik: 'NK003',
            nama_lengkap: 'Michael Johnson',
            tempat_lahir: 'Surabaya',
            tanggal_lahir: '1988-03-20',
            jenis_kelamin: 'Laki-laki',
            alamat: 'Jl. Test No. 3',
            status_perkawinan: 'Menikah',
            nomor_telepon: '081234567892',
            email: 'michael.j@tunasesta.com',
            role: 'karyawan',
            tanggal_masuk: '2018-03-01',
            kategori_gaji: 'Bulanan',
            periode_gaji: 'bulanan',
            status: 'Aktif',
            departemen_id_saat_ini: 1,
            jabatan_id_saat_ini: 3,
            role_karyawan: 'produksi',
            departemenSaatIni: {
              departemen_id: 1,
              nama_departemen: 'Produksi',
              menggunakan_shift: true,
              created_at: '',
              updated_at: '',
            },
            jabatanSaatIni: {
              jabatan_id: 3,
              nama_jabatan: 'Supervisor',
              created_at: '',
              updated_at: '',
            },
            created_at: '',
            updated_at: '',
          },
          created_at: '',
          updated_at: '',
        },
      ];
      
      setAbsensi(mockData);
      
      // Calculate statistics
      const hadirCount = mockData.filter(a => a.status === 'Hadir').length;
      const terlambatCount = mockData.filter(a => a.status === 'Terlambat').length;
      const izinCount = mockData.filter(a => a.status === 'Izin').length;
      const cutiCount = mockData.filter(a => a.status === 'Cuti').length;
      const alphaCount = mockData.filter(a => a.status === 'Alpha').length;
      
      setStats({
        totalKaryawan: 150,
        hadir: hadirCount + 135, // Adding base count for demo
        terlambat: terlambatCount + 2,
        izin: izinCount + 3,
        cuti: cutiCount + 2,
        alpha: alphaCount + 3,
      });
    } catch (error) {
      console.error('Error loading absensi:', error);
      setError('Gagal memuat data absensi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAbsensi();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting data...');
  };

  const filteredAbsensi = absensi.filter(item => {
    const matchesSearch = item.karyawan?.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.karyawan?.nik.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartemen = !filterDepartemen || item.karyawan?.departemenSaatIni?.nama_departemen === filterDepartemen;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    
    return matchesSearch && matchesDepartemen && matchesStatus;
  });

  const getAttendancePercentage = () => {
    const total = stats.totalKaryawan;
    const hadir = stats.hadir;
    return total > 0 ? Math.round((hadir / total) * 100) : 0;
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Absensi' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Data Absensi"
        description="Monitor kehadiran karyawan harian"
        breadcrumbs={breadcrumbs}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
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

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Karyawan</p>
                <p className="text-2xl font-bold">{stats.totalKaryawan}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hadir</p>
                <p className="text-2xl font-bold text-green-600">{stats.hadir}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terlambat</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.terlambat}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Izin</p>
                <p className="text-2xl font-bold text-blue-600">{stats.izin}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cuti</p>
                <p className="text-2xl font-bold text-purple-600">{stats.cuti}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alpha</p>
                <p className="text-2xl font-bold text-red-600">{stats.alpha}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Percentage */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tingkat Kehadiran Hari Ini</span>
            <Badge className="text-lg px-3 py-1">
              {getAttendancePercentage()}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getAttendancePercentage()}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-tunas-blue-500 to-tunas-green-500 h-4 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>0%</span>
            <span>Target: 95%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Hari Ini</TabsTrigger>
          <TabsTrigger value="week">Minggu Ini</TabsTrigger>
          <TabsTrigger value="month">Bulan Ini</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle>
                  Absensi {formatDate(selectedDate, 'EEEE, dd MMMM yyyy')}
                </CardTitle>
                
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Cari nama atau NIK..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  
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
                      <SelectItem value="Hadir">Hadir</SelectItem>
                      <SelectItem value="Terlambat">Terlambat</SelectItem>
                      <SelectItem value="Izin">Izin</SelectItem>
                      <SelectItem value="Cuti">Cuti</SelectItem>
                      <SelectItem value="Alpha">Alpha</SelectItem>
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
                        <TableHead>Nama Karyawan</TableHead>
                        <TableHead>Departemen</TableHead>
                        <TableHead>Jam Masuk</TableHead>
                        <TableHead>Jam Pulang</TableHead>
                        <TableHead>Lembur</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Gaji Tambahan</TableHead>
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
                          <TableCell className="font-medium">
                            {item.karyawan?.nik}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.karyawan?.nama_lengkap}</p>
                              <p className="text-sm text-gray-500">{item.karyawan?.jabatanSaatIni?.nama_jabatan}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.karyawan?.departemenSaatIni?.nama_departemen}</TableCell>
                          <TableCell>
                            {item.jam_scan_masuk ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-500" />
                                {formatTime(item.jam_scan_masuk)}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {item.jam_scan_pulang ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-500" />
                                {formatTime(item.jam_scan_pulang)}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {item.jam_lembur > 0 ? (
                              <Badge variant="secondary">
                                {item.jam_lembur} jam
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(item.total_gaji_tambahan)}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Data absensi minggu ini sedang dimuat...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Data absensi bulan ini sedang dimuat...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}