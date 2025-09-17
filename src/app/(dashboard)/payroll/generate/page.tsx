// src/app/(dashboard)/payroll/generate/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Calculator,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  Info,
  CreditCard,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface GenerateConfig {
  periode: string;
  tipePeriode: 'bulanan' | 'mingguan' | 'harian';
  departemen: string[];
  includeOvertime: boolean;
  includeAllowance: boolean;
  includeDeduction: boolean;
  autoSendSlip: boolean;
}

export default function PayrollGeneratePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);
  const [previewData, setPreviewData] = useState<any>(null);
  
  const [config, setConfig] = useState<GenerateConfig>({
    periode: '2024-01',
    tipePeriode: 'bulanan',
    departemen: [],
    includeOvertime: true,
    includeAllowance: true,
    includeDeduction: true,
    autoSendSlip: false,
  });

  const departments = [
    { id: '1', nama: 'Produksi' },
    { id: '2', nama: 'Human Resources' },
    { id: '3', nama: 'Finance' },
    { id: '4', nama: 'Quality Control' },
  ];

  const handleDepartmentToggle = (deptId: string) => {
    setConfig(prev => ({
      ...prev,
      departemen: prev.departemen.includes(deptId)
        ? prev.departemen.filter(id => id !== deptId)
        : [...prev.departemen, deptId]
    }));
  };

  const handlePreview = async () => {
    try {
      setIsGenerating(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock preview data
      setPreviewData({
        periode: config.periode,
        totalKaryawan: 142,
        totalGajiPokok: 650000000,
        totalLembur: 45000000,
        totalTunjangan: 85000000,
        totalPotongan: 12000000,
        totalBersih: 768000000,
        details: [
          { komponen: 'Gaji Pokok', jumlah: 650000000, karyawan: 142 },
          { komponen: 'Lembur', jumlah: 45000000, karyawan: 89 },
          { komponen: 'Premi', jumlah: 28000000, karyawan: 120 },
          { komponen: 'Uang Makan', jumlah: 57000000, karyawan: 142 },
          { komponen: 'Potongan', jumlah: -12000000, karyawan: 15 },
        ]
      });
      
      setStep(2);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat preview data',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: 'Berhasil',
        description: `Gaji untuk ${previewData.totalKaryawan} karyawan berhasil digenerate`,
      });
      
      router.push('/payroll');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal generate gaji',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Penggajian', href: '/payroll' },
    { label: 'Generate Gaji' },
  ];

  return (
    <ProtectedRoute permission="process-payroll">
      <DashboardLayout>
        <PageHeader
          title="Generate Gaji"
          description="Proses penggajian karyawan secara otomatis"
          breadcrumbs={breadcrumbs}
          showBackButton
        />

        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Configuration Form */}
            <Card>
              <CardHeader>
                <CardTitle>Konfigurasi Generate Gaji</CardTitle>
                <CardDescription>
                  Atur parameter untuk proses penggajian
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Period Selection */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="periode">Periode Gaji</Label>
                    <Select 
                      value={config.periode} 
                      onValueChange={(value) => setConfig({ ...config, periode: value })}
                    >
                      <SelectTrigger id="periode">
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-01">Januari 2024</SelectItem>
                        <SelectItem value="2023-12">Desember 2023</SelectItem>
                        <SelectItem value="2023-11">November 2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipe">Tipe Periode</Label>
                    <Select 
                      value={config.tipePeriode} 
                      onValueChange={(value: any) => setConfig({ ...config, tipePeriode: value })}
                    >
                      <SelectTrigger id="tipe">
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bulanan">Bulanan</SelectItem>
                        <SelectItem value="mingguan">Mingguan</SelectItem>
                        <SelectItem value="harian">Harian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Department Selection */}
                <div className="space-y-2">
                  <Label>Pilih Departemen</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {departments.map(dept => (
                      <div key={dept.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={dept.id}
                          checked={config.departemen.includes(dept.id)}
                          onCheckedChange={() => handleDepartmentToggle(dept.id)}
                        />
                        <label
                          htmlFor={dept.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {dept.nama}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {config.departemen.length === 0 
                      ? 'Pilih semua departemen jika kosong'
                      : `${config.departemen.length} departemen dipilih`}
                  </p>
                </div>

                {/* Components Configuration */}
                <div className="space-y-2">
                  <Label>Komponen Gaji</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Hitung Lembur</p>
                          <p className="text-xs text-gray-500">Include upah lembur dalam perhitungan</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={config.includeOvertime}
                        onCheckedChange={(checked: boolean) => 
                          setConfig({ ...config, includeOvertime: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Tunjangan & Premi</p>
                          <p className="text-xs text-gray-500">Include premi dan uang makan</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={config.includeAllowance}
                        onCheckedChange={(checked: boolean) => 
                          setConfig({ ...config, includeAllowance: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">Potongan</p>
                          <p className="text-xs text-gray-500">Apply potongan gaji jika ada</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={config.includeDeduction}
                        onCheckedChange={(checked: boolean) => 
                          setConfig({ ...config, includeDeduction: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Auto Send Configuration */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Kirim Slip Otomatis</AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="flex items-center justify-between">
                      <span>Kirim slip gaji ke email karyawan setelah generate?</span>
                      <Checkbox
                        checked={config.autoSendSlip}
                        onCheckedChange={(checked: boolean) => 
                          setConfig({ ...config, autoSendSlip: checked })
                        }
                      />
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>
              <Button
                onClick={handlePreview}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Loading...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Preview Kalkulasi
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Preview Summary */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Preview Kalkulasi Gaji</AlertTitle>
              <AlertDescription>
                Periode: {formatDate(config.periode + '-01', 'MMMM yyyy')}
              </AlertDescription>
            </Alert>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Karyawan</p>
                      <p className="text-2xl font-bold">{previewData?.totalKaryawan}</p>
                    </div>
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Gaji Kotor</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          (previewData?.totalGajiPokok || 0) + 
                          (previewData?.totalLembur || 0) + 
                          (previewData?.totalTunjangan || 0)
                        )}
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
                      <p className="text-sm text-gray-600">Total Gaji Bersih</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(previewData?.totalBersih || 0)}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detail Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Komponen Gaji</CardTitle>
                <CardDescription>
                  Breakdown perhitungan gaji untuk periode ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {previewData?.details.map((item: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          item.jumlah < 0 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {item.jumlah < 0 ? (
                            <TrendingUp className="h-5 w-5 rotate-180" />
                          ) : (
                            <TrendingUp className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.komponen}</p>
                          <p className="text-sm text-gray-500">
                            {item.karyawan} karyawan
                          </p>
                        </div>
                      </div>
                      <span className={`text-lg font-semibold ${
                        item.jumlah < 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {formatCurrency(Math.abs(item.jumlah))}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total Gaji Bersih</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(previewData?.totalBersih || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
              >
                Kembali
              </Button>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {}}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download Preview
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Generating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Generate Gaji
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}