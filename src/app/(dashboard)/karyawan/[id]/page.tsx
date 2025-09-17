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
    loadKaryawanData();
  }, [params.id]);

  const loadKaryawanData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Mock data for now
      const mockKaryawan: Karyawan = {
        karyawan_id: Number(params.id),
        nik: 'NK001',
        nama_lengkap: 'John Doe',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '1990-01-01',
        jenis_kelamin: 'Laki-laki',
        alamat: 'Jl. Contoh No. 123, Jakarta Selatan',
        status_perkawinan: 'Menikah',
        nomor_telepon: '081234567890',
        email: 'john.doe@tunasesta.com',
        role: 'karyawan',
        tanggal_masuk: '2020-01-15',
        kategori_gaji: 'Bulanan',
        periode_gaji: 'bulanan',
        jam_kerja_masuk: '08:00:00',
        jam_kerja_pulang: '17:00:00',
        status: 'Aktif',
        departemen_id_saat_ini: 1,
        jabatan_id_saat_ini: 1,
        pin_fingerprint: '12345',
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
        created_at: '2020-01-15',
        updated_at: '2024-01-01',
      };

      const mockAbsensi: Absensi[] = [
        {
          absensi_id: 1,
          karyawan_id: Number(params.id),
          tanggal_absensi: '2024-01-15',
          jam_scan_masuk: '08:00:00',
          jam_scan_pulang: '17:15:00',
          durasi_lembur_menit: 15,
          status: 'Hadir',
          jam_lembur: 0.25,
          jenis_hari: 'weekday',
          hadir_6_hari_periode: true,
          upah_lembur: 7500,
          premi: 20000,
          uang_makan: 15000,
          total_gaji_tambahan: 42500,
          created_at: '',
          updated_at: '',
        },
        {
          absensi_id: 2,
          karyawan_id: Number(params.id),
          tanggal_absensi: '2024-01-14',
          jam_scan_masuk: '08:05:00',
          jam_scan_pulang: '17:00:00',
          durasi_lembur_menit: 0,
          status: 'Terlambat',
          jam_lembur: 0,
          jenis_hari: 'weekday',
          hadir_6_hari_periode: true,
          upah_lembur: 0,
          premi: 0,
          uang_makan: 15000,
          total_gaji_tambahan: 15000,
          created_at: '',
          updated_at: '',
        },
      ];

      const mockGaji: RiwayatGaji[] = [
        {
          gaji_id: 1,
          karyawan_id: Number(params.id),
          periode: '2024-01',
          periode_label: 'Januari 2024',
          tipe_periode: 'bulanan',
          periode_mulai: '2024-01-01',
          periode_selesai: '2024-01-31',
          gaji_final: 5500000,
          tanggal_pembayaran: '2024-02-01',
          created_at: '',
          updated_at: '',
        },
      ];

      setKaryawan(mockKaryawan);
      setAbsensi(mockAbsensi);
      setRiwayatGaji(mockGaji);
    } catch (error) {
      console.error('Error loading karyawan:', error);
      setError('Gagal memuat data karyawan');
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
          <AlertDescription>{error || 'Karyawan tidak ditemukan'}</AlertDescription>
        </Alert>
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

                <Button className="w-full" variant="outline">
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
                                {formatDate(gaji.tanggal_pembayaran || '', 'dd MMM yyyy')}
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
                    <p className="text-gray-500 text-center py-4">Belum ada riwayat gaji</p>
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
                      <Label className="text-sm text-gray-500">Agama</Label>
                      <p className="font-medium">Islam</p>
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
                  <CardTitle>Riwayat Absensi</CardTitle>
                  <CardDescription>Data kehadiran 30 hari terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
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
                              {item.jam_scan_masuk ? `Masuk: ${item.jam_scan_masuk.substring(0, 5)}` : '-'}
                              {item.jam_scan_pulang ? ` | Pulang: ${item.jam_scan_pulang.substring(0, 5)}` : ''}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payroll Tab */}
            <TabsContent value="payroll" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Penggajian</CardTitle>
                  <CardDescription>Data gaji 12 bulan terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riwayatGaji.map((gaji) => (
                      <div
                        key={gaji.gaji_id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{gaji.periode_label}</p>
                            <p className="text-sm text-gray-500">
                              Dibayar: {gaji.tanggal_pembayaran ? formatDate(gaji.tanggal_pembayaran, 'dd MMM yyyy') : 'Pending'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(gaji.gaji_final || 0)}</p>
                          <Badge className="mt-1">
                            {gaji.tanggal_pembayaran ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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