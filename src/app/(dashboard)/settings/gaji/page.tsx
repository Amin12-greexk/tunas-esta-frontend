// src/app/(dashboard)/settings/gaji/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { SettingGaji } from '@/types/payroll';
import { 
  Settings, 
  Save, 
  DollarSign,
  Clock,
  Utensils,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingGajiPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  const [settingGaji, setSettingGaji] = useState<SettingGaji>({
    setting_id: 1,
    premi_produksi: 20000,
    premi_staff: 15000,
    uang_makan_produksi_weekday: 15000,
    uang_makan_produksi_weekend_5_10: 20000,
    uang_makan_produksi_weekend_10_20: 25000,
    uang_makan_staff_weekday: 15000,
    uang_makan_staff_weekend_5_10: 20000,
    uang_makan_staff_weekend_10_20: 25000,
    tarif_lembur_produksi_per_jam: 30000,
    tarif_lembur_staff_per_jam: 40000,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  });

  const [originalSettings, setOriginalSettings] = useState<SettingGaji | null>(null);

  useEffect(() => {
    loadSettingGaji();
  }, []);

  const loadSettingGaji = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Mock data is already set in state
      // In real app: const response = await apiClient.getActiveSettingGaji();
      // setSettingGaji(response.data);
      setOriginalSettings(settingGaji);
    } catch (error) {
      console.error('Error loading setting gaji:', error);
      setError('Gagal memuat pengaturan gaji');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SettingGaji, value: string) => {
    const numValue = parseInt(value) || 0;
    setSettingGaji(prev => ({
      ...prev,
      [field]: numValue,
    }));
    setHasChanges(true);
  };

  const handleReset = () => {
    if (originalSettings) {
      setSettingGaji(originalSettings);
      setHasChanges(false);
      toast({
        title: 'Reset',
        description: 'Pengaturan dikembalikan ke nilai awal',
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate all values are positive
      const values = [
        settingGaji.premi_produksi,
        settingGaji.premi_staff,
        settingGaji.uang_makan_produksi_weekday,
        settingGaji.uang_makan_produksi_weekend_5_10,
        settingGaji.uang_makan_produksi_weekend_10_20,
        settingGaji.uang_makan_staff_weekday,
        settingGaji.uang_makan_staff_weekend_5_10,
        settingGaji.uang_makan_staff_weekend_10_20,
        settingGaji.tarif_lembur_produksi_per_jam,
        settingGaji.tarif_lembur_staff_per_jam,
      ];

      if (values.some(v => v < 0)) {
        toast({
          title: 'Error',
          description: 'Semua nilai harus positif',
          variant: 'destructive',
        });
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // await apiClient.updateSettingGaji(settingGaji.setting_id, settingGaji);
      
      setOriginalSettings(settingGaji);
      setHasChanges(false);
      
      toast({
        title: 'Berhasil',
        description: 'Pengaturan gaji berhasil disimpan',
      });
    } catch (error) {
      console.error('Error saving setting gaji:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan gaji',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengaturan' },
    { label: 'Setting Gaji' },
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

  return (
    <ProtectedRoute roles={['it_dev', 'hr']}>
      <DashboardLayout>
        <PageHeader
          title="Pengaturan Gaji"
          description="Kelola komponen gaji tambahan untuk karyawan"
          breadcrumbs={breadcrumbs}
          action={
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
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
          }
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasChanges && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Anda memiliki perubahan yang belum disimpan
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Premi/Hari</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(settingGaji.premi_produksi + settingGaji.premi_staff)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Uang Makan</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(
                      Math.round((settingGaji.uang_makan_produksi_weekday + 
                                  settingGaji.uang_makan_staff_weekday) / 2)
                    )}
                  </p>
                </div>
                <Utensils className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Max Lembur/Jam</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(Math.max(
                      settingGaji.tarif_lembur_produksi_per_jam,
                      settingGaji.tarif_lembur_staff_per_jam
                    ))}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className="mt-1 bg-green-100 text-green-800">
                    {settingGaji.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="premi" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="premi">
              <TrendingUp className="h-4 w-4 mr-2" />
              Premi
            </TabsTrigger>
            <TabsTrigger value="uang-makan">
              <Utensils className="h-4 w-4 mr-2" />
              Uang Makan
            </TabsTrigger>
            <TabsTrigger value="lembur">
              <Clock className="h-4 w-4 mr-2" />
              Lembur
            </TabsTrigger>
          </TabsList>

          {/* Premi Tab */}
          <TabsContent value="premi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Premi</CardTitle>
                <CardDescription>
                  Premi diberikan untuk karyawan yang hadir 6 hari berturut-turut dalam periode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Premi akan otomatis dihitung berdasarkan kehadiran karyawan dalam sistem absensi
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6 md:grid-cols-2">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="premi-produksi">Premi Karyawan Produksi</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="premi-produksi"
                        type="number"
                        value={settingGaji.premi_produksi}
                        onChange={(e) => handleInputChange('premi_produksi', e.target.value)}
                        className="pl-9"
                        min="0"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Per hari untuk karyawan produksi
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="premi-staff">Premi Karyawan Staff</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="premi-staff"
                        type="number"
                        value={settingGaji.premi_staff}
                        onChange={(e) => handleInputChange('premi_staff', e.target.value)}
                        className="pl-9"
                        min="0"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Per hari untuk karyawan staff
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Uang Makan Tab */}
          <TabsContent value="uang-makan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Uang Makan Karyawan Produksi</CardTitle>
                <CardDescription>
                  Pengaturan uang makan berdasarkan hari kerja dan durasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Weekday</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="number"
                        value={settingGaji.uang_makan_produksi_weekday}
                        onChange={(e) => handleInputChange('uang_makan_produksi_weekday', e.target.value)}
                        className="pl-9"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Senin - Jumat</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Weekend (5-10 jam)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="number"
                        value={settingGaji.uang_makan_produksi_weekend_5_10}
                        onChange={(e) => handleInputChange('uang_makan_produksi_weekend_5_10', e.target.value)}
                        className="pl-9"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Sabtu - Minggu</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Weekend (10-20 jam)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="number"
                        value={settingGaji.uang_makan_produksi_weekend_10_20}
                        onChange={(e) => handleInputChange('uang_makan_produksi_weekend_10_20', e.target.value)}
                        className="pl-9"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Kerja lembur panjang</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uang Makan Karyawan Staff</CardTitle>
                <CardDescription>
                  Pengaturan uang makan untuk karyawan staff/administrasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Weekday</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="number"
                        value={settingGaji.uang_makan_staff_weekday}
                        onChange={(e) => handleInputChange('uang_makan_staff_weekday', e.target.value)}
                        className="pl-9"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Senin - Jumat</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Weekend (5-10 jam)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="number"
                        value={settingGaji.uang_makan_staff_weekend_5_10}
                        onChange={(e) => handleInputChange('uang_makan_staff_weekend_5_10', e.target.value)}
                        className="pl-9"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Sabtu - Minggu</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Weekend (10-20 jam)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="number"
                        value={settingGaji.uang_makan_staff_weekend_10_20}
                        onChange={(e) => handleInputChange('uang_makan_staff_weekend_10_20', e.target.value)}
                        className="pl-9"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Kerja lembur panjang</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lembur Tab */}
          <TabsContent value="lembur" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tarif Lembur Per Jam</CardTitle>
                <CardDescription>
                  Pengaturan upah lembur untuk setiap kategori karyawan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Lembur dihitung otomatis jika karyawan bekerja melebihi jam kerja normal (8 jam)
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6 md:grid-cols-2">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="lembur-produksi">Tarif Lembur Karyawan Produksi</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="lembur-produksi"
                        type="number"
                        value={settingGaji.tarif_lembur_produksi_per_jam}
                        onChange={(e) => handleInputChange('tarif_lembur_produksi_per_jam', e.target.value)}
                        className="pl-9"
                        min="0"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Per jam untuk karyawan produksi
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="lembur-staff">Tarif Lembur Karyawan Staff</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        id="lembur-staff"
                        type="number"
                        value={settingGaji.tarif_lembur_staff_per_jam}
                        onChange={(e) => handleInputChange('tarif_lembur_staff_per_jam', e.target.value)}
                        className="pl-9"
                        min="0"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Per jam untuk karyawan staff
                    </p>
                  </motion.div>
                </div>

                {/* Calculation Example */}
                <Card className="bg-gray-50 dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Contoh Perhitungan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lembur 2 jam (Produksi)</span>
                      <span className="font-medium">
                        2 × {formatCurrency(settingGaji.tarif_lembur_produksi_per_jam)} = 
                        {formatCurrency(2 * settingGaji.tarif_lembur_produksi_per_jam)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lembur 3 jam (Staff)</span>
                      <span className="font-medium">
                        3 × {formatCurrency(settingGaji.tarif_lembur_staff_per_jam)} = 
                        {formatCurrency(3 * settingGaji.tarif_lembur_staff_per_jam)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </ProtectedRoute>
  );
}