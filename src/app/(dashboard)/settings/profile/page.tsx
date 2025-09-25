// src/app/(dashboard)/settings/profile/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { getInitials, formatDate } from '@/lib/utils';
import {
  User,
  Calendar,
  Key,
  Shield,
  Save,
  Camera,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';

// === Types (singkat; sesuaikan dengan milikmu bila sudah diekspor dari /types) ===
interface Karyawan {
  karyawan_id: number;
  nik: string;
  nama_lengkap: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
  alamat?: string;
  status_perkawinan?: 'Belum Menikah' | 'Menikah' | 'Cerai';
  nomor_telepon?: string;
  email: string;
  role: 'it_dev' | 'hr' | 'direktur' | 'karyawan';
  tanggal_masuk: string;
  kategori_gaji: 'Bulanan' | 'Harian' | 'Borongan';
  periode_gaji?: 'mingguan' | 'bulanan' | 'harian';
  jam_kerja_masuk?: string;
  jam_kerja_pulang?: string;
  status: 'Aktif' | 'Resign';
  departemen_id_saat_ini: number;
  jabatan_id_saat_ini: number;
  pin_fingerprint?: string;
  role_karyawan: 'produksi' | 'staff';
  tarif_harian?: number;
  departemenSaatIni?: { departemen_id: number; nama_departemen: string; menggunakan_shift?: boolean };
  jabatanSaatIni?: { jabatan_id: number; nama_jabatan: string };
  // kemungkinan backend kirim snake_case:
  departemen_saat_ini?: { departemen_id: number; nama_departemen: string; menggunakan_shift?: boolean };
  jabatan_saat_ini?: { jabatan_id: number; nama_jabatan: string };
}

interface PersonalDataForm {
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  alamat: string;
  status_perkawinan: 'Belum Menikah' | 'Menikah' | 'Cerai';
  nomor_telepon: string;
  email: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function ProfileSettingsPage() {
  // pakai isLoading dari context sebagai authLoading
  const { user, isLoading: authLoading, refreshUser } = useAuth();

  // state lokal terpisah agar tidak tabrakan nama
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');

  // sumber kebenaran untuk UI ini
  const [karyawan, setKaryawan] = useState<Karyawan | null>(null);

  // helper nama departemen/jabatan dengan fallback snake_case
  const deptName = useMemo(
    () =>
      karyawan?.departemenSaatIni?.nama_departemen ??
      (karyawan as any)?.departemen_saat_ini?.nama_departemen ??
      '',
    [karyawan]
  );
  const jabatanName = useMemo(
    () =>
      karyawan?.jabatanSaatIni?.nama_jabatan ??
      (karyawan as any)?.jabatan_saat_ini?.nama_jabatan ??
      '',
    [karyawan]
  );

  // form states
  const [personalData, setPersonalData] = useState<PersonalDataForm>({
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki',
    alamat: '',
    status_perkawinan: 'Belum Menikah',
    nomor_telepon: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordForm>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // 1) Minta user dari context bila belum ada
  useEffect(() => {
    if (!user) {
      void refreshUser();
    }
  }, [user, refreshUser]);

  // 2) Normalisasi user -> Karyawan saat user di context sudah ada
  useEffect(() => {
    if (user) {
      const payload: any = user;
      const normalized: Karyawan = {
        ...payload,
        departemenSaatIni: payload?.departemenSaatIni ?? payload?.departemen_saat_ini ?? undefined,
        jabatanSaatIni: payload?.jabatanSaatIni ?? payload?.jabatan_saat_ini ?? undefined,
      };
      setKaryawan(normalized);
    }
  }, [user]);

  // 3) Populate form dari karyawan
  useEffect(() => {
    if (karyawan) {
      setPersonalData({
        nama_lengkap: karyawan.nama_lengkap || '',
        tempat_lahir: karyawan.tempat_lahir || '',
        tanggal_lahir: karyawan.tanggal_lahir || '',
        jenis_kelamin: (karyawan.jenis_kelamin as any) || 'Laki-laki',
        alamat: karyawan.alamat || '',
        status_perkawinan: (karyawan.status_perkawinan as any) || 'Belum Menikah',
        nomor_telepon: karyawan.nomor_telepon || '',
        email: karyawan.email || '',
      });
    }
  }, [karyawan]);

  const handleSavePersonal = async () => {
    try {
      // validasi sederhana
      if (!personalData.nama_lengkap.trim()) {
        toast({ title: 'Error', description: 'Nama lengkap wajib diisi', variant: 'destructive' });
        return;
      }
      if (!personalData.email.trim()) {
        toast({ title: 'Error', description: 'Email wajib diisi', variant: 'destructive' });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalData.email)) {
        toast({ title: 'Error', description: 'Format email tidak valid', variant: 'destructive' });
        return;
      }

      if (!karyawan) return;

      setSavingProfile(true);

      // gunakan apiClient agar token dari Cookies interceptor ikut
      await apiClient.updateKaryawan(karyawan.karyawan_id, personalData);

      toast({ title: 'Berhasil', description: 'Profil berhasil diperbarui' });

      // refresh user di context supaya kartu profil ikut update
      await refreshUser();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Gagal memperbarui profil',
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordData.current_password.trim()) {
        toast({ title: 'Error', description: 'Password lama wajib diisi', variant: 'destructive' });
        return;
      }
      if (!passwordData.new_password.trim()) {
        toast({ title: 'Error', description: 'Password baru wajib diisi', variant: 'destructive' });
        return;
      }
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast({ title: 'Error', description: 'Konfirmasi password tidak cocok', variant: 'destructive' });
        return;
      }
      if (passwordData.new_password.length < 8) {
        toast({ title: 'Error', description: 'Password minimal 8 karakter', variant: 'destructive' });
        return;
      }

      setChangingPassword(true);

      // jika belum ada wrapper di apiClient, tetap pakai fetch ke endpoint auth backend kamu
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // axios interceptor sudah pakai Cookies, tapi fetch ini perlu header manual jika endpoint itu butuh
          // kalau backend kamu pakai middleware token dari cookie, header Authorization boleh dihapus
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          password: passwordData.new_password,
          password_confirmation: passwordData.confirm_password,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || 'Gagal mengubah password');
      }

      toast({ title: 'Berhasil', description: 'Password berhasil diubah' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Gagal mengubah password',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'it_dev':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'hr':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'direktur':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getStatusBadgeColor = (status: string) =>
    status === 'Aktif'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan' },
    { label: 'Profil' },
  ];

  // loading dari context
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  // user belum ada setelah refresh
  if (!karyawan) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Data karyawan tidak ditemukan. Silakan login ulang.</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Pengaturan Profil"
        description="Kelola informasi pribadi dan keamanan akun Anda"
        breadcrumbs={breadcrumbs}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" alt={karyawan.nama_lengkap} />
                    <AvatarFallback className="text-2xl tunas-gradient text-white">
                      {getInitials(karyawan.nama_lengkap || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    title="Ubah foto profil"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <CardTitle>{karyawan.nama_lengkap}</CardTitle>
                  <CardDescription>{karyawan.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">NIK</span>
                  <span className="text-sm font-medium">{karyawan.nik}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Role System</span>
                  <Badge className={getRoleBadgeColor(karyawan.role)}>
                    {karyawan.role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Role Karyawan</span>
                  <Badge variant="outline">
                    {karyawan.role_karyawan?.charAt(0).toUpperCase() + karyawan.role_karyawan?.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Departemen</span>
                  <span className="text-sm font-medium">{deptName || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Jabatan</span>
                  <span className="text-sm font-medium">{jabatanName || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge className={getStatusBadgeColor(karyawan.status)}>{karyawan.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Kategori Gaji</span>
                  <span className="text-sm font-medium">{karyawan.kategori_gaji}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tanggal Masuk</span>
                  <span className="text-sm font-medium">
                    {formatDate(karyawan.tanggal_masuk, 'dd MMM yyyy')}
                  </span>
                </div>
                {karyawan.jam_kerja_masuk && karyawan.jam_kerja_pulang && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Jam Kerja</span>
                    <span className="text-sm font-medium">
                      {karyawan.jam_kerja_masuk} - {karyawan.jam_kerja_pulang}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">
                <User className="h-4 w-4 mr-2" />
                Data Pribadi
              </TabsTrigger>
              <TabsTrigger value="security">
                <Key className="h-4 w-4 mr-2" />
                Keamanan
              </TabsTrigger>
            </TabsList>

            {/* Personal Data Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pribadi</CardTitle>
                  <CardDescription>Update informasi pribadi Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        value={personalData.nama_lengkap}
                        onChange={(e) => setPersonalData({ ...personalData, nama_lengkap: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                      <Input
                        id="tempat_lahir"
                        value={personalData.tempat_lahir}
                        onChange={(e) => setPersonalData({ ...personalData, tempat_lahir: e.target.value })}
                        placeholder="Tempat lahir"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                      <Input
                        id="tanggal_lahir"
                        type="date"
                        value={personalData.tanggal_lahir}
                        onChange={(e) => setPersonalData({ ...personalData, tanggal_lahir: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                      <select
                        id="jenis_kelamin"
                        value={personalData.jenis_kelamin}
                        onChange={(e) =>
                          setPersonalData({ ...personalData, jenis_kelamin: e.target.value as any })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status_perkawinan">Status Perkawinan</Label>
                      <select
                        id="status_perkawinan"
                        value={personalData.status_perkawinan}
                        onChange={(e) =>
                          setPersonalData({
                            ...personalData,
                            status_perkawinan: e.target.value as any,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Belum Menikah">Belum Menikah</option>
                        <option value="Menikah">Menikah</option>
                        <option value="Cerai">Cerai</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalData.email}
                        onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                        placeholder="nama@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        value={personalData.nomor_telepon}
                        onChange={(e) => setPersonalData({ ...personalData, nomor_telepon: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nik">NIK</Label>
                      <Input
                        id="nik"
                        value={karyawan.nik}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800"
                        placeholder="NIK tidak dapat diubah"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea
                      id="alamat"
                      value={personalData.alamat}
                      onChange={(e) => setPersonalData({ ...personalData, alamat: e.target.value })}
                      rows={3}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="departemen">Departemen</Label>
                      <Input
                        id="departemen"
                        value={deptName}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800"
                        placeholder="Tidak ada departemen"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jabatan">Jabatan</Label>
                      <Input
                        id="jabatan"
                        value={jabatanName}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800"
                        placeholder="Tidak ada jabatan"
                      />
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      NIK, Departemen, dan Jabatan tidak dapat diubah. Hubungi HR untuk perubahan data
                      tersebut.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end">
                    <Button onClick={handleSavePersonal} disabled={savingProfile}>
                      {savingProfile ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Ubah Password</CardTitle>
                  <CardDescription>Pastikan password Anda kuat dan unik</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Password Lama *</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, current_password: e.target.value })
                      }
                      placeholder="Masukkan password lama"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password Baru *</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      placeholder="Masukkan password baru"
                    />
                    <p className="text-sm text-gray-500">
                      Minimal 8 karakter, disarankan kombinasi huruf, angka, dan karakter khusus
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Konfirmasi Password Baru *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirm_password: e.target.value })
                      }
                      placeholder="Ulangi password baru"
                    />
                    {passwordData.confirm_password &&
                      passwordData.new_password !== passwordData.confirm_password && (
                        <p className="text-sm text-red-500">Password tidak cocok</p>
                      )}
                    {passwordData.confirm_password &&
                      passwordData.new_password === passwordData.confirm_password &&
                      passwordData.new_password.length > 0 && (
                        <p className="text-sm text-green-500">Password cocok</p>
                      )}
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Password yang kuat membantu melindungi akun Anda dari akses yang tidak sah.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleChangePassword}
                      disabled={
                        changingPassword ||
                        !passwordData.current_password ||
                        !passwordData.new_password ||
                        !passwordData.confirm_password
                      }
                    >
                      {changingPassword ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Mengubah...</span>
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Ubah Password
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Informasi Keamanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Terakhir Login</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(new Date().toISOString(), 'dd MMM yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">PIN Fingerprint</p>
                        <p className="text-xs text-gray-500">
                          {karyawan.pin_fingerprint ? 'Terdaftar' : 'Belum terdaftar'}
                        </p>
                      </div>
                    </div>
                    {karyawan.pin_fingerprint && <Badge variant="secondary">PIN: {karyawan.pin_fingerprint}</Badge>}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Status Keamanan Akun</p>
                        <p className="text-xs text-gray-500">
                          Gunakan password unik dan jangan bagikan kredensial Anda kepada siapapun.
                        </p>
                      </div>
                    </div>
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
