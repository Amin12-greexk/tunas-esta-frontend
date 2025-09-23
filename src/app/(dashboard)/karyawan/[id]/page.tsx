// src/app/(dashboard)/karyawan/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Karyawan } from '@/types/karyawan';
import { Absensi } from '@/types/absensi';
import { RiwayatGaji } from '@/types/payroll';
import { getInitials, formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building2,
  Briefcase,
  Edit,
  Download,
  Clock,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

// API URL - adjust based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export default function KaryawanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [karyawan, setKaryawan] = useState<Karyawan | null>(null);
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [riwayatGaji, setRiwayatGaji] = useState<RiwayatGaji[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      loadKaryawanData();
    }
  }, [params.id]);

  const getApiHeaders = () => {
    const token = Cookies.get('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const loadKaryawanData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch karyawan data
      const karyawanResponse = await fetch(`${API_BASE_URL}/karyawan/${params.id}`, {
        headers: getApiHeaders(),
      });

      if (!karyawanResponse.ok) {
        throw new Error(`HTTP error! status: ${karyawanResponse.status}`);
      }

      const karyawanData: Karyawan = await karyawanResponse.json();
      setKaryawan(karyawanData);

      // Fetch attendance data for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const absensiResponse = await fetch(
        `${API_BASE_URL}/absensi?karyawan_id=${params.id}&start_date=${currentMonth}-01&end_date=${currentMonth}-31`,
        {
          headers: getApiHeaders(),
        }
      );

      if (absensiResponse.ok) {
        const absensiResult = await absensiResponse.json();
        // Handle pagination response
        setAbsensi(absensiResult.data || absensiResult || []);
      }

      // Fetch payroll history
      const payrollResponse = await fetch(`${API_BASE_URL}/payroll/history/${params.id}`, {
        headers: getApiHeaders(),
      });

      if (payrollResponse.ok) {
        const payrollData: RiwayatGaji[] = await payrollResponse.json();
        setRiwayatGaji(payrollData || []);
      }

    } catch (error) {
      console.error('Error loading karyawan data:', error);
      setError(error instanceof Error ? error.message : 'Gagal memuat data karyawan');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAttendanceStats = () => {
    const total = absensi.length;
    const hadir = absensi.filter(a => a.status === 'Hadir').length;
    const terlambat = absensi.filter(a => a.status === 'Terlambat').length;
    const izin = absensi.filter(a => a.status === 'Izin').length;
    const alpha = absensi.filter(a => a.status === 'Alpha').length;
    
    return { total, hadir, terlambat, izin, alpha };
  };

  const handleDownloadCV = async () => {
    try {
      // You can implement CV download API call here
      console.log('Download CV for karyawan:', karyawan?.karyawan_id);
      // Example API call:
      // const response = await fetch(`${API_BASE_URL}/karyawan/${params.id}/cv`, {
      //   headers: apiHeaders,
      // });
      // Handle file download...
    } catch (error) {
      console.error('Error downloading CV:', error);
    }
  };

  const stats = calculateAttendanceStats();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Karyawan', href: '/karyawan' },
    { label: karyawan?.nama_lengkap || 'Detail' },
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
          <AlertDescription>
            {error || 'Karyawan tidak ditemukan'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={loadKaryawanData} 
          className="mt-4"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Coba Lagi'}
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={karyawan.nama_lengkap}
        description={`NIK: ${karyawan.nik}`}
        breadcrumbs={breadcrumbs}
        showBackButton
        action={
          hasPermission('update-karyawan') && (
            <Button asChild>
              <Link href={`/karyawan/${params.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Karyawan
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" alt={karyawan.nama_lengkap} />
                  <AvatarFallback className="text-2xl tunas-gradient text-white">
                    {getInitials(karyawan.nama_lengkap)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <CardTitle>{karyawan.nama_lengkap}</CardTitle>
                  <CardDescription>{karyawan.email}</CardDescription>
                </div>
                <Badge className={getStatusColor(karyawan.status)}>
                  {karyawan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span>{karyawan.departemenSaatIni?.nama_departemen}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span>{karyawan.jabatanSaatIni?.nama_jabatan}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{karyawan.nomor_telepon}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-xs">{karyawan.alamat}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tanggal Masuk</span>
                    <span className="font-medium">
                      {formatDate(karyawan.tanggal_masuk, 'dd MMM yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Masa Kerja</span>
                    <span className="font-medium">
                      {Math.floor((new Date().getTime() - new Date(karyawan.tanggal_masuk).getTime()) / (1000 * 60 * 60 * 24 * 365))} tahun
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleDownloadCV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CV
                </Button>
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="attendance">Absensi</TabsTrigger>
              <TabsTrigger value="payroll">Gaji</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Attendance Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistik Absensi Bulan Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.hadir}</div>
                      <p className="text-sm text-gray-500">Hadir</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{stats.terlambat}</div>
                      <p className="text-sm text-gray-500">Terlambat</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.izin}</div>
                      <p className="text-sm text-gray-500">Izin</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.alpha}</div>
                      <p className="text-sm text-gray-500">Alpha</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payroll */}
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Gaji Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                  {riwayatGaji.length > 0 ? (
                    <div className="space-y-3">
                      {riwayatGaji.slice(0, 3).map((gaji) => (
                        <div
                          key={gaji.gaji_id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium">{gaji.periode_label}</p>
                              <p className="text-sm text-gray-500">
                                {gaji.tanggal_pembayaran ? formatDate(gaji.tanggal_pembayaran, 'dd MMM yyyy') : 'Pending'}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(gaji.gaji_final || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Belum ada riwayat gaji</p>
                      <Button 
                        className="mt-2" 
                        variant="outline" 
                        onClick={loadKaryawanData}
                      >
                        Refresh Data
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Personal Data Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Pribadi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm text-gray-500">NIK</Label>
                      <p className="font-medium">{karyawan.nik}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Nama Lengkap</Label>
                      <p className="font-medium">{karyawan.nama_lengkap}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Tempat, Tanggal Lahir</Label>
                      <p className="font-medium">
                        {karyawan.tempat_lahir}, {formatDate(karyawan.tanggal_lahir, 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Jenis Kelamin</Label>
                      <p className="font-medium">{karyawan.jenis_kelamin}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Status Perkawinan</Label>
                      <p className="font-medium">{karyawan.status_perkawinan}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Role Karyawan</Label>
                      <p className="font-medium capitalize">{karyawan.role_karyawan}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-500">Alamat Lengkap</Label>
                    <p className="font-medium">{karyawan.alamat}</p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm text-gray-500">Email</Label>
                      <p className="font-medium">{karyawan.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">No. Telepon</Label>
                      <p className="font-medium">{karyawan.nomor_telepon}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Riwayat Absensi</CardTitle>
                      <CardDescription>Data kehadiran bulan ini</CardDescription>
                    </div>
                    <Button variant="outline" onClick={loadKaryawanData}>
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {absensi.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {absensi.map((item) => (
                        <div
                          key={item.absensi_id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              item.status === 'Hadir' ? 'bg-green-100' :
                              item.status === 'Terlambat' ? 'bg-yellow-100' :
                              item.status === 'Izin' ? 'bg-blue-100' :
                              'bg-red-100'
                            }`}>
                              {item.status === 'Hadir' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                               item.status === 'Terlambat' ? <Clock className="h-4 w-4 text-yellow-600" /> :
                               item.status === 'Izin' ? <AlertCircle className="h-4 w-4 text-blue-600" /> :
                               <XCircle className="h-4 w-4 text-red-600" />}
                            </div>
                            <div>
                              <p className="font-medium">
                                {formatDate(item.tanggal_absensi, 'EEEE, dd MMM yyyy')}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.jam_scan_masuk ? `Masuk: ${item.jam_scan_masuk.toString().substring(11, 16)}` : '-'}
                                {item.jam_scan_pulang ? ` | Pulang: ${item.jam_scan_pulang.toString().substring(11, 16)}` : ''}
                              </p>
                              {item.jam_lembur > 0 && (
                                <p className="text-xs text-orange-600">
                                  Lembur: {item.jam_lembur} jam
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Belum ada data absensi bulan ini</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payroll Tab */}
            <TabsContent value="payroll" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Riwayat Penggajian</CardTitle>
                      <CardDescription>Data gaji historis</CardDescription>
                    </div>
                    <Button variant="outline" onClick={loadKaryawanData}>
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {riwayatGaji.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {riwayatGaji.map((gaji) => (
                        <div
                          key={gaji.gaji_id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => {
                            // Navigate to slip gaji detail if needed
                            // router.push(`/payroll/slip/${gaji.gaji_id}`);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600">
                              <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{gaji.periode_label}</p>
                              <p className="text-sm text-gray-500">
                                {gaji.tipe_periode && (
                                  <span className="capitalize">{gaji.tipe_periode} </span>
                                )}
                                • Dibayar: {gaji.tanggal_pembayaran ? formatDate(gaji.tanggal_pembayaran, 'dd MMM yyyy') : 'Pending'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(gaji.gaji_final || 0)}</p>
                            <Badge className="mt-1" variant={gaji.tanggal_pembayaran ? 'default' : 'secondary'}>
                              {gaji.tanggal_pembayaran ? 'Paid' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Belum ada riwayat penggajian</p>
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

// Helper component for labels
function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={className}>{children}</p>;
}