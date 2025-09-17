// src/app/(dashboard)/settings/profile/page.tsx
'use client';

import { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  // Form states
  const [personalData, setPersonalData] = useState({
    nama_lengkap: user?.nama_lengkap || '',
    email: user?.email || '',
    nomor_telepon: user?.nomor_telepon || '',
    alamat: user?.alamat || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleSavePersonal = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Berhasil',
        description: 'Profil berhasil diperbarui',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui profil',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validation
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast({
          title: 'Error',
          description: 'Konfirmasi password tidak cocok',
          variant: 'destructive',
        });
        return;
      }

      if (passwordData.new_password.length < 6) {
        toast({
          title: 'Error',
          description: 'Password minimal 6 karakter',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
        description: 'Gagal mengubah password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan' },
    { label: 'Profil' },
  ];

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
                    <AvatarImage src="" alt={user?.nama_lengkap} />
                    <AvatarFallback className="text-2xl tunas-gradient text-white">
                      {getInitials(user?.nama_lengkap || '')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <CardTitle>{user?.nama_lengkap}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">NIK</span>
                  <span className="text-sm font-medium">{user?.nik}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Role</span>
                  <Badge>{user?.role}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Departemen</span>
                  <span className="text-sm font-medium">
                    {user?.departemenSaatIni?.nama_departemen || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Jabatan</span>
                  <span className="text-sm font-medium">
                    {user?.jabatanSaatIni?.nama_jabatan || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    {user?.status || 'Aktif'}
                  </Badge>
                </div>
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
                      <Label htmlFor="nama">Nama Lengkap</Label>
                      <Input
                        id="nama"
                        value={personalData.nama_lengkap}
                        onChange={(e) => setPersonalData({
                          ...personalData,
                          nama_lengkap: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalData.email}
                        onChange={(e) => setPersonalData({
                          ...personalData,
                          email: e.target.value
                        })}
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
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nik">NIK</Label>
                      <Input
                        id="nik"
                        value={user?.nik}
                        disabled
                        className="bg-gray-100"
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
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="departemen">Departemen</Label>
                      <Input
                        id="departemen"
                        value={user?.departemenSaatIni?.nama_departemen || ''}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jabatan">Jabatan</Label>
                      <Input
                        id="jabatan"
                        value={user?.jabatanSaatIni?.nama_jabatan || ''}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Beberapa informasi tidak dapat diubah. Hubungi HR untuk perubahan data departemen atau jabatan.
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
                    <Label htmlFor="current-password">Password Lama</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        current_password: e.target.value
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Password Baru</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        new_password: e.target.value
                      })}
                    />
                    <p className="text-sm text-gray-500">
                      Minimal 6 karakter, kombinasi huruf dan angka
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value
                      })}
                    />
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
                      disabled={isLoading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
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
                      <Shield className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">Not enabled</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Password Terakhir Diubah</p>
                        <p className="text-xs text-gray-500">30 hari yang lalu</p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert variant="default">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Akun Anda aman. Tidak ada aktivitas mencurigakan yang terdeteksi.
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