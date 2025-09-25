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
import { formatCurrency, formatDate } from '@/lib/utils';
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
  Info,
  History,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

// API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

interface SettingGajiHistory {
  setting_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export default function SettingGajiPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [settingHistory, setSettingHistory] = useState<SettingGajiHistory[]>([]);
  
  const [settingGaji, setSettingGaji] = useState<SettingGaji>({
    setting_id: 0,
    premi_produksi: 0,
    premi_staff: 0,
    uang_makan_produksi_weekday: 0,
    uang_makan_produksi_weekend_5_10: 0,
    uang_makan_produksi_weekend_10_20: 0,
    uang_makan_staff_weekday: 0,
    uang_makan_staff_weekend_5_10: 0,
    uang_makan_staff_weekend_10_20: 0,
    tarif_lembur_produksi_per_jam: 0,
    tarif_lembur_staff_per_jam: 0,
    is_active: false,
    created_at: '',
    updated_at: '',
  });

  const [originalSettings, setOriginalSettings] = useState<SettingGaji | null>(null);

  useEffect(() => {
    loadSettingGaji();
    loadSettingHistory();
  }, []);

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

  const loadSettingGaji = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Load active setting
      const response = await fetch(`${API_BASE_URL}/setting-gaji/active`, {
        headers: getApiHeaders(),
      });

      if (response.ok) {
        const data: SettingGaji = await response.json();
        setSettingGaji(data);
        setOriginalSettings(data);
      } else if (response.status === 404) {
        // No active setting found, create default
        setSettingGaji({
          setting_id: 0,
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
          is_active: false,
          created_at: '',
          updated_at: '',
        });
        setOriginalSettings(null);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading setting gaji:', error);
      setError('Gagal memuat pengaturan gaji');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettingHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/setting-gaji`, {
        headers: getApiHeaders(),
      });

      if (response.ok) {
        const data: SettingGajiHistory[] = await response.json();
        setSettingHistory(data);
      }
    } catch (error) {
      console.error('Error loading setting history:', error);
    }
  };

  const handleInputChange = (field: keyof SettingGaji, value: string) => {
    const numValue = parseFloat(value) || 0;
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

  const validateSettings = (): boolean => {
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
      return false;
    }

    if (values.some(v => v === 0)) {
      toast({
        title: 'Peringatan',
        description: 'Ada nilai yang masih 0, pastikan sudah benar',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateSettings()) return;

    try {
      setIsSaving(true);
      
      const payload = {
        premi_produksi: settingGaji.premi_produksi,
        premi_staff: settingGaji.premi_staff,
        uang_makan_produksi_weekday: settingGaji.uang_makan_produksi_weekday,
        uang_makan_produksi_weekend_5_10: settingGaji.uang_makan_produksi_weekend_5_10,
        uang_makan_produksi_weekend_10_20: settingGaji.uang_makan_produksi_weekend_10_20,
        uang_makan_staff_weekday: settingGaji.uang_makan_staff_weekday,
        uang_makan_staff_weekend_5_10: settingGaji.uang_makan_staff_weekend_5_10,
        uang_makan_staff_weekend_10_20: settingGaji.uang_makan_staff_weekend_10_20,
        tarif_lembur_produksi_per_jam: settingGaji.tarif_lembur_produksi_per_jam,
        tarif_lembur_staff_per_jam: settingGaji.tarif_lembur_staff_per_jam,
      };

      const response = await fetch(`${API_BASE_URL}/setting-gaji`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newSetting = await response.json();
      
      // Handle response structure from Laravel API
      const settingData = newSetting.data || newSetting;
      
      setSettingGaji(settingData);
      setOriginalSettings(settingData);
      setHasChanges(false);
      
      // Refresh history
      loadSettingHistory();
      
      toast({
        title: 'Berhasil',
        description: 'Pengaturan gaji baru berhasil dibuat dan diaktifkan',
      });
    } catch (error) {
      console.error('Error saving setting gaji:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menyimpan pengaturan gaji',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateSetting = async (settingId: number) => {
    try {
      setIsActivating(true);
      
      const response = await fetch(`${API_BASE_URL}/setting-gaji/${settingId}/activate`, {
        method: 'POST',
        headers: getApiHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const activatedSetting = await response.json();
      
      // Handle response structure from Laravel API
      const settingData = activatedSetting.data || activatedSetting;
      
      setSettingGaji(settingData);
      setOriginalSettings(settingData);
      setHasChanges(false);
      
      // Refresh history
      loadSettingHistory();
      
      toast({
        title: 'Berhasil',
        description: 'Setting berhasil diaktifkan',
      });
    } catch (error) {
      console.error('Error activating setting:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengaktifkan setting',
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
    }
  };

  const calculateTotalEstimate = () => {
    // Calculate estimated monthly cost for 100 employees
    const avgEmployees = 100;
    const workingDays = 22;
    
    const monthlyPremi = (settingGaji.premi_produksi + settingGaji.premi_staff) * avgEmployees;
    const monthlyUangMakan = 
      ((settingGaji.uang_makan_produksi_weekday + settingGaji.uang_makan_staff_weekday) / 2) * 
      avgEmployees * workingDays;
    const monthlyLembur = 
      ((settingGaji.tarif_lembur_produksi_per_jam + settingGaji.tarif_lembur_staff_per_jam) / 2) * 
      avgEmployees * 2; // Assume 2 hours overtime average
    
    return monthlyPremi + monthlyUangMakan + monthlyLembur;
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
                    Simpan & Aktifkan
                  </>
                )}
              </Button>
            </div>
          }
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={loadSettingGaji}
              >
                Coba Lagi
              </Button>
            </AlertDescription>
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
                  <Badge className={`mt-1 ${
                    settingGaji.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {settingGaji.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CheckCircle className={`h-8 w-8 ${
                  settingGaji.is_active ? 'text-green-400' : 'text-gray-400'
                }`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estimated Monthly Cost */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Estimasi Biaya per Bulan (100 karyawan)</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(calculateTotalEstimate())}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Termasuk premi, uang makan, dan estimasi lembur 2 jam/hari
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="premi" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Riwayat
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
                    Premi akan otomatis dihitung berdasarkan kehadiran karyawan dalam sistem absensi.
                    Karyawan harus hadir minimal 6 hari dalam periode untuk mendapat premi.
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
                        step="1000"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Per hari untuk karyawan produksi yang memenuhi syarat
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
                        step="1000"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Per hari untuk karyawan staff yang memenuhi syarat
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
                  Pengaturan uang makan berdasarkan hari kerja dan durasi lembur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Weekday: Jam pulang ≥ 19:00 | Weekend: Berdasarkan jam lembur (5-10 jam atau 10-20 jam)
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Weekday (Senin-Jumat)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="number"
                        value={settingGaji.uang_makan_produksi_weekday}
                        onChange={(e) => handleInputChange('uang_makan_produksi_weekday', e.target.value)}
                        className="pl-9"
                        min="0"
                        step="1000"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Pulang ≥ 19:00</p>
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
                        step="1000"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Sabtu-Minggu</p>
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
                        step="1000"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Lembur panjang</p>
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
                    <Label>Weekday (Senin-Jumat)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="number"
                        value={settingGaji.uang_makan_staff_weekday}
                        onChange={(e) => handleInputChange('uang_makan_staff_weekday', e.target.value)}
                        className="pl-9"
                        min="0"
                        step="1000"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Pulang ≥ 19:00</p>
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
                        step="1000"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Sabtu-Minggu</p>
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
                        step="1000"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Lembur panjang</p>
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
                    Lembur dihitung otomatis jika karyawan bekerja melebihi jam kerja normal (8 jam + 1 jam istirahat = 9 jam).
                    Weekend/tanggal merah: tarif x2
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
                        step="5000"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Per jam untuk karyawan produksi (weekday normal)
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
                        step="5000"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Per jam untuk karyawan staff (weekday normal)
                    </p>
                  </motion.div>
                </div>

                {/* Calculation Example */}
                <Card className="bg-gray-50 dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Contoh Perhitungan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Weekday (Normal)</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lembur 2 jam (Produksi)</span>
                            <span className="font-medium">
                              {formatCurrency(2 * settingGaji.tarif_lembur_produksi_per_jam)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lembur 3 jam (Staff)</span>
                            <span className="font-medium">
                              {formatCurrency(3 * settingGaji.tarif_lembur_staff_per_jam)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Weekend (x2)</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lembur 2 jam (Produksi)</span>
                            <span className="font-medium">
                              {formatCurrency(2 * settingGaji.tarif_lembur_produksi_per_jam * 2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lembur 3 jam (Staff)</span>
                            <span className="font-medium">
                              {formatCurrency(3 * settingGaji.tarif_lembur_staff_per_jam * 2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Setting Gaji</CardTitle>
                <CardDescription>
                  Daftar semua setting gaji yang pernah dibuat
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settingHistory.length > 0 ? (
                  <div className="space-y-3">
                    {settingHistory.map((setting, index) => (
                      <motion.div
                        key={setting.setting_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            setting.is_active 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Settings className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Setting ID #{setting.setting_id}</p>
                            <p className="text-sm text-gray-500">
                              Dibuat: {formatDate(setting.created_at, 'dd MMM yyyy HH:mm')}
                            </p>
                            {setting.updated_at !== setting.created_at && (
                              <p className="text-xs text-gray-400">
                                Diupdate: {formatDate(setting.updated_at, 'dd MMM yyyy HH:mm')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                            {setting.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {!setting.is_active && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleActivateSetting(setting.setting_id)}
                              disabled={isActivating}
                            >
                              {isActivating ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aktifkan
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada riwayat setting gaji</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Setting akan muncul di sini setelah Anda menyimpan pengaturan pertama
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Active Setting Info */}
        {settingGaji.is_active && (
          <Card className="mt-6 bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Setting Aktif: #{settingGaji.setting_id}
                  </p>
                  <p className="text-xs text-green-600">
                    Terakhir diupdate: {formatDate(settingGaji.updated_at, 'dd MMM yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}