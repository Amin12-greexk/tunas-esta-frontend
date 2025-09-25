// src/app/(dashboard)/settings/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building2,
  Briefcase,
  Key,
  Shield,
  Save,
  Camera,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Clock,
  Settings,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

// Types based on Laravel backend structure
interface Karyawan {
  karyawan_id: number;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  alamat: string;
  status_perkawinan: 'Belum Menikah' | 'Menikah' | 'Cerai';
  nomor_telepon: string;
  email: string;
  role: 'it_dev' | 'hr' | 'direktur' | 'karyawan';
  tanggal_masuk: string;
  kategori_gaji: 'Bulanan' | 'Harian' | 'Borongan';
  periode_gaji: 'mingguan' | 'bulanan' | 'harian';
  jam_kerja_masuk?: string;
  jam_kerja_pulang?: string;
  status: 'Aktif' | 'Resign';
  departemen_id_saat_ini: number;
  jabatan_id_saat_ini: number;
  pin_fingerprint?: string;
  role_karyawan: 'produksi' | 'staff';
  tarif_harian?: number;
  departemenSaatIni?: {
    departemen_id: number;
    nama_departemen: string;
    menggunakan_shift: boolean;
  };
  jabatanSaatIni?: {
    jabatan_id: number;
    nama_jabatan: string;
  };
  created_at: string;
  updated_at: string;
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
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Cast user to Karyawan type for better type safety
  const karyawan = (user as unknown) as Karyawan | null;
  
  // Form states
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

  // Effect to populate form when user data is available
  useEffect(() => {
    if (karyawan && !authLoading) {
      setPersonalData({
        nama_lengkap: karyawan.nama_lengkap || '',
        tempat_lahir: karyawan.tempat_lahir || '',
        tanggal_lahir: karyawan.tanggal_lahir || '',
        jenis_kelamin: karyawan.jenis_kelamin || 'Laki-laki',
        alamat: karyawan.alamat || '',
        status_perkawinan: karyawan.status_perkawinan || 'Belum Menikah',
        nomor_telepon: karyawan.nomor_telepon || '',
        email: karyawan.email || '',
      });
    }
  }, [karyawan, authLoading]);

  const handleSavePersonal = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!personalData.nama_lengkap.trim()) {
        toast({
          title: 'Error',
          description: 'Nama lengkap wajib diisi',
          variant: 'destructive',
        });
        return;
      }

      if (!personalData.email.trim()) {
        toast({
          title: 'Error',
          description: 'Email wajib diisi',
          variant: 'destructive',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalData.email)) {
        toast({
          title: 'Error',
          description: 'Format email tidak valid',
          variant: 'destructive',
        });
        return;
      }

      // API call to update profile
      const response = await fetch(`/api/karyawan/${karyawan?.karyawan_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(personalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui profil');
      }
      
      toast({
        title: 'Berhasil',
        description: 'Profil berhasil diperbarui',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memperbarui profil',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validation
      if (!passwordData.current_password.trim()) {
        toast({
          title: 'Error',
          description: 'Password lama wajib diisi',
          variant: 'destructive',
        });
        return;
      }

      if (!passwordData.new_password.trim()) {
        toast({
          title: 'Error',
          description: 'Password baru wajib diisi',
          variant: 'destructive',
        });
        return;
      }

      if (passwordData.new_password !== passwordData.confirm_password) {
        toast({
          title: 'Error',
          description: 'Konfirmasi password tidak cocok',
          variant: 'destructive',
        });
        return;
      }

      if (passwordData.new_password.length < 8) {
        toast({
          title: 'Error',
          description: 'Password minimal 8 karakter',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      
      // API call to change password
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          password: passwordData.new_password,
          password_confirmation: passwordData.confirm_password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengubah password');
      }
      
      toast({
        title: 'Berhasil',
        description: 'Password berhasil diubah',
      });
      
      // Reset form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal mengubah password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Format file harus JPG, PNG, atau WebP',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Ukuran file maksimal 2MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('profile_image', file);

      const response = await fetch(`/api/karyawan/${karyawan?.karyawan_id}/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengupload foto');
      }

      const data = await response.json();
      setProfileImage(data.profile_image_url);
      
      toast({
        title: 'Berhasil',
        description: 'Foto profil berhasil diperbarui',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal mengupload foto',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Sangat Lemah', color: 'text-red-500' },
      { strength: 2, text: 'Lemah', color: 'text-orange-500' },
      { strength: 3, text: 'Sedang', color: 'text-yellow-500' },
      { strength: 4, text: 'Kuat', color: 'text-blue-500' },
      { strength: 5, text: 'Sangat Kuat', color: 'text-green-500' },
    ];

    return levels[strength];
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

  const getStatusBadgeColor = (status: string) => {
    return status === 'Aktif' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan' },
    { label: 'Profil' },
  ];

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  // Show message if user is not found
  if (!karyawan) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Data karyawan tidak ditemukan. Silakan login ulang.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  const passwordStrength = getPasswordStrength(passwordData.new_password);

  return (
    <DashboardLayout>
      <PageHeader
        title="Pengaturan Profil"
        description="Kelola informasi pribadi dan keamanan akun Anda"
        breadcrumbs={breadcrumbs}
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
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImage || ""} alt={karyawan.nama_lengkap} />
                    <AvatarFallback className="text-2xl tunas-gradient text-white">
                      {getInitials(karyawan.nama_lengkap || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                      id="profile-image-input"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      title="Ubah foto profil"
                      onClick={() => document.getElementById('profile-image-input')?.click()}
                      disabled={isLoading}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
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
                  <span className="text-sm font-medium">
                    {karyawan.departemenSaatIni?.nama_departemen || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Jabatan</span>
                  <span className="text-sm font-medium">
                    {karyawan.jabatanSaatIni?.nama_jabatan || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge className={getStatusBadgeColor(karyawan.status)}>
                    {karyawan.status}
                  </Badge>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  <CardDescription>
                    Update informasi pribadi Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap *</Label>
                      <Input
                        id="nama"
                        value={personalData.nama_lengkap}
                        onChange={(e) => setPersonalData({
                          ...personalData,
                          nama_lengkap: e.target.value
                        })}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                      <Input
                        id="tempat_lahir"
                        value={personalData.tempat_lahir}
                        onChange={(e) => setPersonalData({
                          ...personalData,
                          tempat_lahir: e.target.value
                        })}
                        placeholder="Tempat lahir"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                      <Input
                        id="tanggal_lahir"
                        type="date"
                        value={personalData.tanggal_lahir}
                        onChange={(e) => setPersonalData({
                          ...personalData,
                          tanggal_lahir: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                      <select
                        id="jenis_kelamin"
                        value={personalData.jenis_kelamin}
                        onChange={(e) => setPersonalData({
                          ...personalData,
                          jenis_kelamin: e.target.value as 'Laki-laki' | 'Perempuan'
                        })}
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
                        onChange={(e) => setPersonalData({
                          ...personalData,
                          status_perkawinan: e.target.value as 'Belum Menikah' | 'Menikah' | 'Cerai'
                        })}
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
                        onChange={(e) => setPersonalData({
                          ...personalData,
                          email: e.target.value
                        })}
                        placeholder="nama@email.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        value={personalData.nomor_telepon}
                        onChange={(e) => setPersonalData({
                          ...personalData,
                          nomor_telepon: e.target.value
                        })}
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
                      onChange={(e) => setPersonalData({
                        ...personalData,
                        alamat: e.target.value
                      })}
                      rows={3}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="departemen">Departemen</Label>
                      <Input
                        id="departemen"
                        value={karyawan.departemenSaatIni?.nama_departemen || ''}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800"
                        placeholder="Tidak ada departemen"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jabatan">Jabatan</Label>
                      <Input
                        id="jabatan"
                        value={karyawan.jabatanSaatIni?.nama_jabatan || ''}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800"
                        placeholder="Tidak ada jabatan"
                      />
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      NIK, Departemen, dan Jabatan tidak dapat diubah. Hubungi HR untuk perubahan data tersebut.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSavePersonal}
                      disabled={isLoading}
                    >
                      {isLoading ? (
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
                  <CardDescription>
                    Pastikan password Anda kuat dan unik
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Password Lama *</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        current_password: e.target.value
                      })}
                      placeholder="Masukkan password lama"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password Baru *</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        new_password: e.target.value
                      })}
                      placeholder="Masukkan password baru"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Minimal 8 karakter, disarankan kombinasi huruf, angka, dan karakter khusus
                      </span>
                      {passwordStrength.strength > 0 && (
                        <span className={passwordStrength.color}>
                          {passwordStrength.text}
                        </span>
                      )}
                    </div>
                    {passwordData.new_password && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.strength === 1 ? 'bg-red-500 w-1/5' :
                            passwordStrength.strength === 2 ? 'bg-orange-500 w-2/5' :
                            passwordStrength.strength === 3 ? 'bg-yellow-500 w-3/5' :
                            passwordStrength.strength === 4 ? 'bg-blue-500 w-4/5' :
                            passwordStrength.strength === 5 ? 'bg-green-500 w-full' : 'w-0'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Konfirmasi Password Baru *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value
                      })}
                      placeholder="Ulangi password baru"
                    />
                    {passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                      <p className="text-sm text-red-500 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Password tidak cocok
                      </p>
                    )}
                    {passwordData.confirm_password && passwordData.new_password === passwordData.confirm_password && passwordData.new_password.length > 0 && (
                      <p className="text-sm text-green-500 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Password cocok
                      </p>
                    )}
                  </div>
                  
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Password yang kuat membantu melindungi akun Anda dari akses yang tidak sah.
                      Gunakan kombinasi huruf besar, huruf kecil, angka, dan karakter khusus.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handleChangePassword}
                      disabled={isLoading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password || passwordData.new_password !== passwordData.confirm_password}
                    >
                      {isLoading ? (
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
                  <CardDescription>
                    Informasi terkait keamanan akun Anda
                  </CardDescription>
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
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Aktif
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">PIN Fingerprint</p>
                        <p className="text-xs text-gray-500">
                          {karyawan.pin_fingerprint ? 'Terdaftar untuk absensi' : 'Belum terdaftar'}
                        </p>
                      </div>
                    </div>
                    {karyawan.pin_fingerprint && (
                      <Badge variant="secondary">
                        PIN: {karyawan.pin_fingerprint}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Level Akses</p>
                        <p className="text-xs text-gray-500">
                          Role system dan karyawan menentukan akses fitur
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getRoleBadgeColor(karyawan.role)}>
                        {karyawan.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Status Akun</p>
                        <p className="text-xs text-gray-500">
                          Akun dalam kondisi {karyawan.status.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(karyawan.status)}>
                      {karyawan.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Akun Dibuat</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(karyawan.created_at, 'dd MMM yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Terakhir Diperbarui</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(karyawan.updated_at, 'dd MMM yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Jika Anda menemukan aktivitas mencurigakan pada akun, segera hubungi IT atau ubah password Anda.
                      Jangan bagikan kredensial login kepada siapa pun.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}