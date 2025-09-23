// src/app/(dashboard)/payroll/generate/page.tsx
'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
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
  Clock,
  Building2,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';

// API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface GenerateConfig {
  periode: string;
  tipePeriode: 'bulanan' | 'mingguan' | 'harian';
  tanggalMulai?: string;
  tanggalSelesai?: string;
  departemen: string[];
  karyawanIds: string[];
  includeOvertime: boolean;
  includeAllowance: boolean;
  includeDeduction: boolean;
  autoSendSlip: boolean;
}

interface Departemen {
  departemen_id: number;
  nama_departemen: string;
  karyawan_count?: number;
}

interface Karyawan {
  karyawan_id: number;
  nik: string;
  nama_lengkap: string;
  email: string;
  status: string;
  departemenSaatIni?: {
    nama_departemen: string;
  };
}

interface GenerateResult {
  success_count: number;
  error_count: number;
  results: any[];
  errors: any[];
}

interface PreviewData {
  periode: string;
  totalKaryawan: number;
  estimatedTotal: number;
  karyawanList: Karyawan[];
  departemenStats: { [key: string]: number };
}

export default function PayrollGeneratePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [departemenList, setDepartemenList] = useState<Departemen[]>([]);
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  
  const [config, setConfig] = useState<GenerateConfig>({
    periode: new Date().toISOString().slice(0, 7), // Current month YYYY-MM
    tipePeriode: 'bulanan',
    departemen: [],
    karyawanIds: [],
    includeOvertime: true,
    includeAllowance: true,
    includeDeduction: true,
    autoSendSlip: false,
  });

  useEffect(() => {
    loadDepartemen();
    loadKaryawan();
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

  const loadDepartemen = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departemen`, {
        headers: getApiHeaders(),
      });

      if (response.ok) {
        const data: Departemen[] = await response.json();
        setDepartemenList(data);
      }
    } catch (error) {
      console.error('Error loading departemen:', error);
    }
  };

  const loadKaryawan = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/karyawan`, {
        headers: getApiHeaders(),
      });

      if (response.ok) {
        const data: Karyawan[] = await response.json();
        // Filter only active employees
        const activeKaryawan = data.filter(k => k.status === 'Aktif');
        setKaryawanList(activeKaryawan);
      }
    } catch (error) {
      console.error('Error loading karyawan:', error);
    }
  };

  const handleDepartmentToggle = (deptId: string) => {
    setConfig(prev => {
      const newDepartemen = prev.departemen.includes(deptId)
        ? prev.departemen.filter(id => id !== deptId)
        : [...prev.departemen, deptId];

      // Auto select/deselect karyawan from this department
      const deptKaryawan = karyawanList
        .filter(k => k.departemenSaatIni && k.departemenSaatIni.nama_departemen === 
          departemenList.find(d => d.departemen_id.toString() === deptId)?.nama_departemen)
        .map(k => k.karyawan_id.toString());

      let newKaryawanIds = [...prev.karyawanIds];
      
      if (newDepartemen.includes(deptId)) {
        // Add all karyawan from this department
        newKaryawanIds = [...new Set([...newKaryawanIds, ...deptKaryawan])];
      } else {
        // Remove all karyawan from this department
        newKaryawanIds = newKaryawanIds.filter(id => !deptKaryawan.includes(id));
      }

      return {
        ...prev,
        departemen: newDepartemen,
        karyawanIds: newKaryawanIds
      };
    });
  };

  const handleKaryawanToggle = (karyawanId: string) => {
    setConfig(prev => ({
      ...prev,
      karyawanIds: prev.karyawanIds.includes(karyawanId)
        ? prev.karyawanIds.filter(id => id !== karyawanId)
        : [...prev.karyawanIds, karyawanId]
    }));
  };

  const handleSelectAllKaryawan = () => {
    const allKaryawanIds = karyawanList.map(k => k.karyawan_id.toString());
    const allDepartemenIds = departemenList.map(d => d.departemen_id.toString());
    
    setConfig(prev => ({
      ...prev,
      karyawanIds: allKaryawanIds,
      departemen: allDepartemenIds
    }));
  };

  const handleDeselectAllKaryawan = () => {
    setConfig(prev => ({
      ...prev,
      karyawanIds: [],
      departemen: []
    }));
  };

  const generateDateRange = () => {
    if (config.tipePeriode === 'bulanan') {
      const [year, month] = config.periode.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      
      return {
        tanggal_mulai: startDate.toISOString().split('T')[0],
        tanggal_selesai: endDate.toISOString().split('T')[0]
      };
    } else {
      // For weekly/daily, use custom date range
      return {
        tanggal_mulai: config.tanggalMulai || config.periode + '-01',
        tanggal_selesai: config.tanggalSelesai || config.periode + '-31'
      };
    }
  };

  const handlePreview = async () => {
    if (config.karyawanIds.length === 0) {
      toast({
        title: 'Peringatan',
        description: 'Pilih minimal satu karyawan untuk diproses',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Get selected karyawan details
      const selectedKaryawan = karyawanList.filter(k => 
        config.karyawanIds.includes(k.karyawan_id.toString())
      );

      // Calculate department statistics
      const deptStats: { [key: string]: number } = {};
      selectedKaryawan.forEach(k => {
        const deptName = k.departemenSaatIni?.nama_departemen || 'Unknown';
        deptStats[deptName] = (deptStats[deptName] || 0) + 1;
      });

      // Estimate total (basic calculation - could be enhanced with actual salary data)
      const estimatedSalaryPerEmployee = 3500000; // Average estimate
      const estimatedTotal = selectedKaryawan.length * estimatedSalaryPerEmployee;

      setPreviewData({
        periode: config.periode,
        totalKaryawan: selectedKaryawan.length,
        estimatedTotal,
        karyawanList: selectedKaryawan,
        departemenStats: deptStats
      });
      
      setStep(2);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat preview data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!previewData) return;

    try {
      setIsGenerating(true);
      
      const dateRange = generateDateRange();
      
      // Choose the appropriate endpoint based on periode type
      let endpoint = '';
      let payload = {};

      if (config.tipePeriode === 'bulanan') {
        // Use bulk generate for monthly
        endpoint = `${API_BASE_URL}/payroll/bulk-generate`;
        payload = {
          periode: config.periode,
          karyawan_ids: config.karyawanIds.map(id => parseInt(id))
        };
      } else {
        // Use generate-batch for weekly/daily
        endpoint = `${API_BASE_URL}/payroll/generate-batch`;
        payload = {
          tipe_periode: config.tipePeriode,
          tanggal: dateRange.tanggal_mulai
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GenerateResult = await response.json();
      
      toast({
        title: 'Berhasil',
        description: `Gaji untuk ${result.success_count} karyawan berhasil digenerate. ${result.error_count > 0 ? `${result.error_count} error.` : ''}`,
        variant: result.error_count > 0 ? 'destructive' : 'default',
      });

      // Show detailed results if there are errors
      if (result.error_count > 0) {
        console.log('Generation errors:', result.errors);
      }
      
      router.push('/payroll');
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal generate gaji',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSelectedKaryawanByDepartment = () => {
    const selectedKaryawan = karyawanList.filter(k => 
      config.karyawanIds.includes(k.karyawan_id.toString())
    );

    const grouped: { [key: string]: Karyawan[] } = {};
    selectedKaryawan.forEach(k => {
      const deptName = k.departemenSaatIni?.nama_departemen || 'Unknown';
      if (!grouped[deptName]) grouped[deptName] = [];
      grouped[deptName].push(k);
    });

    return grouped;
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
                    {config.tipePeriode === 'bulanan' ? (
                      <Input
                        id="periode"
                        type="month"
                        value={config.periode}
                        onChange={(e) => setConfig({ ...config, periode: e.target.value })}
                      />
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <Label className="text-xs">Tanggal Mulai</Label>
                          <Input
                            type="date"
                            value={config.tanggalMulai || ''}
                            onChange={(e) => setConfig({ ...config, tanggalMulai: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Tanggal Selesai</Label>
                          <Input
                            type="date"
                            value={config.tanggalSelesai || ''}
                            onChange={(e) => setConfig({ ...config, tanggalSelesai: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Pilih Departemen</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllKaryawan}
                      >
                        Pilih Semua
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDeselectAllKaryawan}
                      >
                        Hapus Semua
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-3 md:grid-cols-2">
                    {departemenList.map(dept => {
                      const deptKaryawanCount = karyawanList.filter(k => 
                        k.departemenSaatIni?.nama_departemen === dept.nama_departemen
                      ).length;
                      
                      return (
                        <div key={dept.departemen_id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={dept.departemen_id.toString()}
                              checked={config.departemen.includes(dept.departemen_id.toString())}
                              onCheckedChange={() => handleDepartmentToggle(dept.departemen_id.toString())}
                            />
                            <div>
                              <label
                                htmlFor={dept.departemen_id.toString()}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {dept.nama_departemen}
                              </label>
                              <p className="text-xs text-gray-500">
                                {deptKaryawanCount} karyawan aktif
                              </p>
                            </div>
                          </div>
                          <Building2 className="h-4 w-4 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Employees Summary */}
                <div className="space-y-2">
                  <Label>Karyawan Terpilih ({config.karyawanIds.length})</Label>
                  {config.karyawanIds.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg">
                      {Object.entries(getSelectedKaryawanByDepartment()).map(([deptName, karyawans]) => (
                        <div key={deptName}>
                          <p className="text-sm font-medium text-gray-700">{deptName} ({karyawans.length})</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {karyawans.map(k => (
                              <Badge key={k.karyawan_id} variant="secondary" className="text-xs">
                                {k.nik} - {k.nama_lengkap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Belum ada karyawan yang dipilih</p>
                  )}
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
                disabled={isLoading || config.karyawanIds.length === 0}
              >
                {isLoading ? (
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
                Periode: {config.tipePeriode === 'bulanan' 
                  ? formatDate(config.periode + '-01', 'MMMM yyyy')
                  : `${config.tanggalMulai} s/d ${config.tanggalSelesai}`
                }
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
                      <p className="text-sm text-gray-600">Departemen Terlibat</p>
                      <p className="text-2xl font-bold">{Object.keys(previewData?.departemenStats || {}).length}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Estimasi Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(previewData?.estimatedTotal || 0)}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Breakdown per Departemen</CardTitle>
                <CardDescription>
                  Distribusi karyawan yang akan diproses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(previewData?.departemenStats || {}).map(([deptName, count], index) => (
                    <motion.div
                      key={deptName}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{deptName}</p>
                          <p className="text-sm text-gray-500">
                            {count} karyawan
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold">
                        {formatCurrency(count * 3500000)} {/* Estimated per dept */}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Estimasi Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(previewData?.estimatedTotal || 0)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    * Estimasi berdasarkan rata-rata gaji. Nilai aktual akan dihitung berdasarkan data absensi dan komponen gaji.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Selected Employees List */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Karyawan ({previewData?.karyawanList.length})</CardTitle>
                <CardDescription>
                  Karyawan yang akan diproses penggajiannya
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {previewData?.karyawanList.map((karyawan) => (
                    <div
                      key={karyawan.karyawan_id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium">{karyawan.nama_lengkap}</p>
                          <p className="text-sm text-gray-500">
                            {karyawan.nik} • {karyawan.departemenSaatIni?.nama_departemen}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{karyawan.email}</Badge>
                    </div>
                  ))}
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
                  onClick={() => window.print()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print Preview
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