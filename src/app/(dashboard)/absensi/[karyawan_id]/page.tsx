// src/app/(dashboard)/absensi/[karyawan_id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Karyawan } from '@/types/karyawan';
import { Absensi } from '@/types/absensi';
import { getInitials, formatDate, formatTime, formatCurrency, getStatusColor } from '@/lib/utils';
import { 
  Calendar as CalendarIcon,
  Clock,
  User,
  Download,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Building2,
  Briefcase,
  DollarSign,
  Timer
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AbsensiKaryawanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [karyawan, setKaryawan] = useState<Karyawan | null>(null);
  const [absensiData, setAbsensiData] = useState<Absensi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Statistics
  const [stats, setStats] = useState({
    totalHadir: 0,
    totalTerlambat: 0,
    totalIzin: 0,
    totalCuti: 0,
    totalAlpha: 0,
    totalLembur: 0,
    totalGajiTambahan: 0,
    persentaseKehadiran: 0,
  });

  useEffect(() => {
    loadData();
  }, [params.karyawan_id, selectedMonth]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Mock data karyawan
      const mockKaryawan: Karyawan = {
        karyawan_id: Number(params.karyawan_id),
        nik: 'NK001',
        nama_lengkap: 'John Doe',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '1990-01-01',
        jenis_kelamin: 'Laki-laki',
        alamat: 'Jl. Contoh No. 123',
        status_perkawinan: 'Menikah',
        nomor_telepon: '081234567890',
        email: 'john.doe@tunasesta.com',
        role: 'karyawan',
        tanggal_masuk: '2020-01-15',
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
      };

      // Mock data absensi untuk bulan yang dipilih
      const mockAbsensi: Absensi[] = generateMonthlyAttendance(Number(params.karyawan_id), selectedMonth);
      
      setKaryawan(mockKaryawan);
      setAbsensiData(mockAbsensi);
      
      // Calculate statistics
      const hadir = mockAbsensi.filter(a => a.status === 'Hadir').length;
      const terlambat = mockAbsensi.filter(a => a.status === 'Terlambat').length;
      const izin = mockAbsensi.filter(a => a.status === 'Izin').length;
      const cuti = mockAbsensi.filter(a => a.status === 'Cuti').length;
      const alpha = mockAbsensi.filter(a => a.status === 'Alpha').length;
      const totalLembur = mockAbsensi.reduce((sum, a) => sum + a.jam_lembur, 0);
      const totalGajiTambahan = mockAbsensi.reduce((sum, a) => sum + a.total_gaji_tambahan, 0);
      const totalHariKerja = mockAbsensi.filter(a => a.jenis_hari === 'weekday').length;
      const persentaseKehadiran = totalHariKerja > 0 ? Math.round(((hadir + terlambat) / totalHariKerja) * 100) : 0;

      setStats({
        totalHadir: hadir,
        totalTerlambat: terlambat,
        totalIzin: izin,
        totalCuti: cuti,
        totalAlpha: alpha,
        totalLembur: totalLembur,
        totalGajiTambahan: totalGajiTambahan,
        persentaseKehadiran: persentaseKehadiran,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Gagal memuat data absensi karyawan');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock attendance data for a month
  const generateMonthlyAttendance = (karyawanId: number, periode: string): Absensi[] => {
    const [year, month] = periode.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const attendance: Absensi[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Skip weekends for most cases
      if (isWeekend && Math.random() > 0.3) continue;

      const random = Math.random();
      let status: Absensi['status'] = 'Hadir';
      let jamMasuk: string | undefined = '08:00:00';
let jamPulang: string | undefined = '17:00:00';

      let lembur = 0;

      if (random < 0.7) {
        status = 'Hadir';
        jamMasuk = `08:${Math.floor(Math.random() * 10).toString().padStart(2, '0')}:00`;
        jamPulang = `17:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`;
        lembur = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
      } else if (random < 0.85) {
        status = 'Terlambat';
        jamMasuk = `08:${(15 + Math.floor(Math.random() * 45)).toString().padStart(2, '0')}:00`;
        jamPulang = `17:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}:00`;
      } else if (random < 0.92) {
        status = 'Izin';
        jamMasuk = undefined;
        jamPulang = undefined;
      } else if (random < 0.96) {
        status = 'Cuti';
        jamMasuk = undefined;
        jamPulang = undefined;
      } else {
        status = 'Alpha';
        jamMasuk = undefined;
        jamPulang = undefined;
      }

      attendance.push({
        absensi_id: day,
        karyawan_id: karyawanId,
        tanggal_absensi: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        jam_scan_masuk: jamMasuk,
        jam_scan_pulang: jamPulang,
        durasi_lembur_menit: lembur * 60,
        status: status,
        jam_lembur: lembur,
        jenis_hari: isWeekend ? 'weekend' : 'weekday',
        hadir_6_hari_periode: status === 'Hadir' && day % 7 !== 0,
        upah_lembur: lembur * 30000,
        premi: status === 'Hadir' ? 20000 : 0,
        uang_makan: status === 'Hadir' || status === 'Terlambat' ? 15000 : 0,
        total_gaji_tambahan: (lembur * 30000) + (status === 'Hadir' ? 20000 : 0) + (status === 'Hadir' || status === 'Terlambat' ? 15000 : 0),
        created_at: '',
        updated_at: '',
      });
    }

    return attendance;
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting attendance data...');
  };

  const getAttendanceDates = () => {
    return absensiData.map(a => new Date(a.tanggal_absensi));
  };

  const getAttendanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return absensiData.find(a => a.tanggal_absensi === dateStr);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Absensi', href: '/absensi' },
    { label: karyawan?.nama_lengkap || 'Detail Karyawan' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !karyawan) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Data karyawan tidak ditemukan'}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Detail Absensi Karyawan"
        description={`${karyawan.nama_lengkap} - ${karyawan.nik}`}
        breadcrumbs={breadcrumbs}
        showBackButton
        action={
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employee Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={karyawan.nama_lengkap} />
                  <AvatarFallback className="text-lg tunas-gradient text-white">
                    {getInitials(karyawan.nama_lengkap)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{karyawan.nama_lengkap}</CardTitle>
                  <CardDescription>{karyawan.nik}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>{karyawan.departemenSaatIni?.nama_departemen}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span>{karyawan.jabatanSaatIni?.nama_jabatan}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <Badge>{karyawan.role_karyawan}</Badge>
              </div>
              
              <div className="pt-4 border-t">
                <Label className="text-sm text-gray-500">Periode</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-01">Januari 2024</SelectItem>
                    <SelectItem value="2023-12">Desember 2023</SelectItem>
                    <SelectItem value="2023-11">November 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Attendance Percentage */}
              <div className="pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Kehadiran</span>
                  <span className="font-semibold">{stats.persentaseKehadiran}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.persentaseKehadiran}%` }}
                    transition={{ duration: 1 }}
                    className={`h-2 rounded-full ${
                      stats.persentaseKehadiran >= 95 ? 'bg-green-500' :
                      stats.persentaseKehadiran >= 80 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Ringkasan Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Hadir</span>
                </div>
                <Badge className="bg-green-100 text-green-800">{stats.totalHadir}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Terlambat</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">{stats.totalTerlambat}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Izin</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{stats.totalIzin}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Cuti</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800">{stats.totalCuti}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Alpha</span>
                </div>
                <Badge className="bg-red-100 text-red-800">{stats.totalAlpha}</Badge>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Total Lembur</span>
                </div>
                <span className="font-semibold">{stats.totalLembur} jam</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Gaji Tambahan</span>
                </div>
                <span className="font-semibold">{formatCurrency(stats.totalGajiTambahan)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detail">Detail</TabsTrigger>
              <TabsTrigger value="calendar">Kalender</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Hari Kerja</p>
                        <p className="text-2xl font-bold">{absensiData.length}</p>
                      </div>
                      <CalendarIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Lembur</p>
                        <p className="text-2xl font-bold">{stats.totalLembur} jam</p>
                      </div>
                      <Timer className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Gaji Tambahan</p>
                        <p className="text-lg font-bold">{formatCurrency(stats.totalGajiTambahan)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Trend Kehadiran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <BarChart3 className="h-12 w-12 text-gray-300" />
                    <span className="ml-3 text-gray-500">Chart visualization here</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Detail Tab */}
            <TabsContent value="detail">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Absensi</CardTitle>
                  <CardDescription>
                    Periode: {formatDate(selectedMonth + '-01', 'MMMM yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Hari</TableHead>
                          <TableHead>Jam Masuk</TableHead>
                          <TableHead>Jam Pulang</TableHead>
                          <TableHead>Lembur</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Gaji Tambahan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {absensiData.map((item, index) => (
                          <motion.tr
                            key={item.absensi_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                          >
                            <TableCell>
                              {formatDate(item.tanggal_absensi, 'dd MMM')}
                            </TableCell>
                            <TableCell>
                              {formatDate(item.tanggal_absensi, 'EEEE')}
                            </TableCell>
                            <TableCell>
                              {item.jam_scan_masuk ? formatTime(item.jam_scan_masuk) : '-'}
                            </TableCell>
                            <TableCell>
                              {item.jam_scan_pulang ? formatTime(item.jam_scan_pulang) : '-'}
                            </TableCell>
                            <TableCell>
                              {item.jam_lembur > 0 ? `${item.jam_lembur} jam` : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(item.total_gaji_tambahan)}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Kalender Absensi</CardTitle>
                  <CardDescription>
                    Visualisasi kehadiran dalam kalender
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hadir: getAttendanceDates().filter(d => {
                        const attendance = getAttendanceForDate(d);
                        return attendance?.status === 'Hadir';
                      }),
                      terlambat: getAttendanceDates().filter(d => {
                        const attendance = getAttendanceForDate(d);
                        return attendance?.status === 'Terlambat';
                      }),
                      alpha: getAttendanceDates().filter(d => {
                        const attendance = getAttendanceForDate(d);
                        return attendance?.status === 'Alpha';
                      }),
                    }}
                    modifiersStyles={{
                      hadir: { backgroundColor: '#10b981', color: 'white' },
                      terlambat: { backgroundColor: '#f59e0b', color: 'white' },
                      alpha: { backgroundColor: '#ef4444', color: 'white' },
                    }}
                  />
                  
                  {selectedDate && (
                    <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h4 className="font-medium mb-2">
                        {formatDate(selectedDate, 'EEEE, dd MMMM yyyy')}
                      </h4>
                      {(() => {
                        const attendance = getAttendanceForDate(selectedDate);
                        if (attendance) {
                          return (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <Badge className={getStatusColor(attendance.status)}>
                                  {attendance.status}
                                </Badge>
                              </div>
                              {attendance.jam_scan_masuk && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Jam Masuk:</span>
                                  <span>{formatTime(attendance.jam_scan_masuk)}</span>
                                </div>
                              )}
                              {attendance.jam_scan_pulang && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Jam Pulang:</span>
                                  <span>{formatTime(attendance.jam_scan_pulang)}</span>
                                </div>
                              )}
                              {attendance.jam_lembur > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Lembur:</span>
                                  <span>{attendance.jam_lembur} jam</span>
                                </div>
                              )}
                              {attendance.total_gaji_tambahan > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Gaji Tambahan:</span>
                                  <span className="font-medium">
                                    {formatCurrency(attendance.total_gaji_tambahan)}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return <p className="text-gray-500">Tidak ada data absensi</p>;
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

// Helper component for separator
function Separator({ className }: { className?: string }) {
  return <div className={`border-t ${className}`} />;
}

// Helper component for labels
function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={className}>{children}</p>;
}