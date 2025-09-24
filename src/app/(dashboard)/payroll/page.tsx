'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { 
  CreditCard,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Calculator,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  CalendarDays,
  Users,
  Wallet,
  ChevronDown,
  UserCheck,
  Info,
  Save,
  X
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, addDays, isWeekend, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface AbsensiData {
  tanggal_absensi: string;
  status: 'Hadir' | 'Terlambat' | 'Alpha' | 'Izin' | 'Sakit' | 'Libur';
  jam_lembur?: number;
  jam_scan_masuk?: string;
  jam_scan_pulang?: string;
}

interface KaryawanPayrollDetail {
  karyawan_id: number;
  nik: string;
  nama_lengkap: string;
  departemen: string;
  kategori_gaji: 'Harian' | 'Bulanan' | 'Borongan';
  tarif_harian: number;
  // Attendance summary
  total_hari_kerja: number;
  total_hadir: number;
  total_terlambat: number;
  total_alpha: number;
  total_izin: number;
  total_sakit: number;
  total_libur: number;
  // Overtime
  jam_lembur_pertama: number; // 1.5x rate
  jam_lembur_kedua: number; // 2x rate
  jam_lembur_sabtu: number; // 2x rate
  jam_lembur_minggu: number; // 3x rate
  jam_lembur_libur: number; // 3x rate
  total_jam_lembur: number;
  // Salary components
  gaji_pokok: number;
  upah_lembur: number;
  upah_lembur_weekday: number;
  upah_lembur_weekend: number;
  premi_kehadiran: number;
  uang_makan: number;
  potongan_bpjs: number;
  total_gaji: number;
  // Attendance details
  absensi_details: AbsensiData[];
}

interface Karyawan {
  karyawan_id: number;
  nik: string;
  nama_lengkap: string;
  email: string;
  departemen_id_saat_ini: number;
  departemen?: string;
  kategori_gaji: 'Bulanan' | 'Harian' | 'Borongan';
  periode_gaji?: 'harian' | 'mingguan' | 'bulanan';
  tarif_harian?: number;
  gaji_pokok?: number;
  status: string;
}

interface Departemen {
  departemen_id: number;
  nama_departemen: string;
}

// === Payroll Settings from BE ===
interface PayrollSettings {
  tarif_harian_default: number;
  jam_kerja_per_hari: number;
  lembur_weekday_first_multiplier: number;
  lembur_weekday_next_multiplier: number;
  lembur_sabtu_multiplier: number;
  lembur_minggu_multiplier: number;
  lembur_libur_multiplier: number;
  premi_kehadiran_min_hadir: number;
  premi_kehadiran_nominal: number;
  uang_makan_per_hadir: number;
  potongan_bpjs_flat: number;
}

// Helper aman number
const toNum = (v: any) => (typeof v === 'number' ? v : parseFloat(String(v))) || 0;

// Predefined date ranges
const dateRanges = [
  {
    label: 'Hari Ini',
    getValue: () => ({
      from: new Date(),
      to: new Date()
    })
  },
  {
    label: 'Kemarin',
    getValue: () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return { from: date, to: date };
    }
  },
  {
    label: '7 Hari Terakhir',
    getValue: () => ({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  },
  {
    label: 'Minggu Ini',
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 })
    })
  },
  {
    label: 'Minggu Lalu',
    getValue: () => ({
      from: startOfWeek(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 })
    })
  },
  {
    label: 'Bulan Ini',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: 'Bulan Lalu',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1))
    })
  },
];

export default function PayrollPage() {
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  const [departemenList, setDepartemenList] = useState<Departemen[]>([]);
  const [payrollDetails, setPayrollDetails] = useState<KaryawanPayrollDetail[]>([]);
  const [settings, setSettings] = useState<PayrollSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedDepartemen, setSelectedDepartemen] = useState('all');
  const [selectedTipePeriode, setSelectedTipePeriode] = useState<'harian'>('harian');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKaryawan, setSelectedKaryawan] = useState<number[]>([]);
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Summary statistics
  const [summary, setSummary] = useState({
    totalKaryawan: 0,
    totalHariKerja: 0,
    totalGajiPokok: 0,
    totalUpahLembur: 0,
    totalUangMakan: 0,
    totalPotongan: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    loadDepartemen();
    loadKaryawan();
    // load active payroll settings from BE
    (async () => {
      try {
        const { data } = await apiClient.getActiveSettingGaji();
        setSettings(data);
      } catch (e) {
        // fallback defaults to keep UI usable if API fails
        setSettings({
          tarif_harian_default: 150000,
          jam_kerja_per_hari: 7,
          lembur_weekday_first_multiplier: 1.5,
          lembur_weekday_next_multiplier: 2,
          lembur_sabtu_multiplier: 2,
          lembur_minggu_multiplier: 3,
          lembur_libur_multiplier: 3,
          premi_kehadiran_min_hadir: 6,
          premi_kehadiran_nominal: 100000,
          uang_makan_per_hadir: 15000,
          potongan_bpjs_flat: 50000,
        });
      }
    })();
  }, []);

  // Auto-calculate when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      calculatePayrollDetails();
    }
  }, [dateRange, selectedDepartemen, karyawanList]);

  const loadDepartemen = async () => {
    try {
      const response = await apiClient.getDepartemen();
      setDepartemenList(response.data);
    } catch (error) {
      console.error('Error loading departemen:', error);
    }
  };

  const loadKaryawan = async () => {
    try {
      const response = await apiClient.getKaryawan();
      setKaryawanList(response.data || []);
    } catch (error) {
      console.error('Error loading karyawan:', error);
    }
  };

  const calculatePayrollDetails = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    if (!settings) return;

    try {
      setIsCalculating(true);
      setError('');

      // Filter karyawan harian
      const karyawanHarian = karyawanList.filter(k => 
        k.kategori_gaji === 'Harian' && 
        k.status === 'Aktif' &&
        (selectedDepartemen === 'all' || k.departemen_id_saat_ini.toString() === selectedDepartemen)
      );

      if (karyawanHarian.length === 0) {
        setPayrollDetails([]);
        setSummary({
          totalKaryawan: 0,
          totalHariKerja: 0,
          totalGajiPokok: 0,
          totalUpahLembur: 0,
          totalUangMakan: 0,
          totalPotongan: 0,
          grandTotal: 0,
        });
        return;
      }

      // Fetch attendance data for date range
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      
      // Get all attendance data for the period
      const absensiResponse = await apiClient.getAbsensi({
        start_date: startDate,
        end_date: endDate
      });

      const absensiData = absensiResponse.data || [];
      
      // Calculate payroll for each karyawan
      const details: KaryawanPayrollDetail[] = [];
      let totalGajiPokok = 0;
      let totalUpahLembur = 0;
      let totalUangMakan = 0;
      let totalPotongan = 0;

      // Calculate working days in period
      const allDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      const workingDays = allDays.filter(day => !isWeekend(day)).length;

      for (const karyawan of karyawanHarian) {
        // Filter attendance for this employee
        const karyawanAbsensi = absensiData.filter((a: any) => 
          a.karyawan?.nik === karyawan.nik
        );

        // Calculate attendance summary
        const totalHadir = karyawanAbsensi.filter((a: any) => 
          a.status === 'Hadir' || a.status === 'Terlambat'
        ).length;
        const totalTerlambat = karyawanAbsensi.filter((a: any) => a.status === 'Terlambat').length;
        const totalAlpha = karyawanAbsensi.filter((a: any) => a.status === 'Alpha').length;
        const totalIzin = karyawanAbsensi.filter((a: any) => a.status === 'Izin').length;
        const totalSakit = karyawanAbsensi.filter((a: any) => a.status === 'Sakit').length;
        const totalLibur = karyawanAbsensi.filter((a: any) => a.status === 'Libur').length;

        // Calculate overtime hours by category
        let jamLemburPertama = 0;
        let jamLemburKedua = 0;
        let jamLemburSabtu = 0;
        let jamLemburMinggu = 0;
        let jamLemburLibur = 0;

        karyawanAbsensi.forEach((absen: any) => {
          const jam = toNum(absen.jam_lembur); // NORMALISASI
          if (jam > 0) {
            const date = new Date(absen.tanggal_absensi);
            const dayOfWeek = date.getDay();
            
            if (absen.status === 'Libur') {
              jamLemburLibur += jam;
            } else if (dayOfWeek === 0) { // Sunday
              jamLemburMinggu += jam;
            } else if (dayOfWeek === 6) { // Saturday
              jamLemburSabtu += jam;
            } else {
              // Weekday overtime
              if (jam <= 1) {
                jamLemburPertama += jam;
              } else {
                jamLemburPertama += 1;
                jamLemburKedua += (jam - 1);
              }
            }
          }
        });

        const totalJamLembur = jamLemburPertama + jamLemburKedua + jamLemburSabtu + jamLemburMinggu + jamLemburLibur;

        // Calculate salary components
        const tarifHarian = toNum(karyawan.tarif_harian) || toNum(settings?.tarif_harian_default);
        const tarifLemburPerJam = tarifHarian / toNum(settings?.jam_kerja_per_hari || 7); // Daily rate / 7 hours
        
        const gajiPokok = tarifHarian * totalHadir;
        const upahLemburWeekday = (jamLemburPertama * tarifLemburPerJam * toNum(settings?.lembur_weekday_first_multiplier)) + 
                                  (jamLemburKedua   * tarifLemburPerJam * toNum(settings?.lembur_weekday_next_multiplier));
        const upahLemburWeekend = (jamLemburSabtu   * tarifLemburPerJam * toNum(settings?.lembur_sabtu_multiplier)) + 
                                  (jamLemburMinggu  * tarifLemburPerJam * toNum(settings?.lembur_minggu_multiplier)) + 
                                  (jamLemburLibur   * tarifLemburPerJam * toNum(settings?.lembur_libur_multiplier));
        const upahLembur = upahLemburWeekday + upahLemburWeekend;
        
        // Premi kehadiran (jika hadir minimal 6 hari dalam periode)
        const premiKehadiran = totalHadir >= toNum(settings?.premi_kehadiran_min_hadir)
          ? toNum(settings?.premi_kehadiran_nominal)
          : 0;
        
        // Uang makan per hari hadir
        const uangMakan = totalHadir * toNum(settings?.uang_makan_per_hadir);
        
        // BPJS deduction (if applicable)
        const potonganBpjs = totalHadir > 0 ? toNum(settings?.potongan_bpjs_flat) : 0;
        
        const totalGaji = gajiPokok + upahLembur + premiKehadiran + uangMakan - potonganBpjs;

        // Add to totals
        totalGajiPokok += gajiPokok;
        totalUpahLembur += upahLembur;
        totalUangMakan += uangMakan;
        totalPotongan += potonganBpjs;

        details.push({
          karyawan_id: karyawan.karyawan_id,
          nik: karyawan.nik,
          nama_lengkap: karyawan.nama_lengkap,
          departemen: departemenList.find(d => d.departemen_id === karyawan.departemen_id_saat_ini)?.nama_departemen || '-',
          kategori_gaji: karyawan.kategori_gaji,
          tarif_harian: tarifHarian,
          total_hari_kerja: workingDays,
          total_hadir: totalHadir,
          total_terlambat: totalTerlambat,
          total_alpha: totalAlpha,
          total_izin: totalIzin,
          total_sakit: totalSakit,
          total_libur: totalLibur,
          jam_lembur_pertama: jamLemburPertama,
          jam_lembur_kedua: jamLemburKedua,
          jam_lembur_sabtu: jamLemburSabtu,
          jam_lembur_minggu: jamLemburMinggu,
          jam_lembur_libur: jamLemburLibur,
          total_jam_lembur: totalJamLembur,
          gaji_pokok: gajiPokok,
          upah_lembur: upahLembur,
          upah_lembur_weekday: upahLemburWeekday,
          upah_lembur_weekend: upahLemburWeekend,
          premi_kehadiran: premiKehadiran,
          uang_makan: uangMakan,
          potongan_bpjs: potonganBpjs,
          total_gaji: totalGaji,
          absensi_details: karyawanAbsensi.map((a: any) => ({
            tanggal_absensi: a.tanggal_absensi,
            status: a.status,
            jam_lembur: toNum(a.jam_lembur), // NORMALISASI
            jam_scan_masuk: a.jam_scan_masuk,
            jam_scan_pulang: a.jam_scan_pulang,
          }))
        });
      }

      setPayrollDetails(details);
      setSummary({
        totalKaryawan: details.length,
        totalHariKerja: workingDays,
        totalGajiPokok,
        totalUpahLembur,
        totalUangMakan,
        totalPotongan,
        grandTotal: totalGajiPokok + totalUpahLembur + totalUangMakan - totalPotongan + (details.reduce((sum, d) => sum + d.premi_kehadiran, 0)),
      });

    } catch (error: any) {
      console.error('Error calculating payroll:', error);
      setError('Gagal menghitung payroll. Silakan coba lagi.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSavePayroll = async () => {
    try {
      setIsSaving(true);
      
      // Save each payroll detail
      const selectedDetails = selectedKaryawan.length > 0 
        ? payrollDetails.filter(d => selectedKaryawan.includes(d.karyawan_id))
        : payrollDetails;

      if (selectedDetails.length === 0) {
        toast({
          title: "Peringatan",
          description: "Tidak ada data untuk disimpan",
          variant: "destructive",
        });
        return;
      }

      // Generate payroll for each selected employee
      const results = [] as any[];
      for (const detail of selectedDetails) {
        try {
          const response = await apiClient.generatePayroll({
            karyawan_id: detail.karyawan_id,
            tanggal_mulai: format(dateRange!.from!, 'yyyy-MM-dd'),
            tanggal_selesai: format(dateRange!.to!, 'yyyy-MM-dd'),
            tipe_periode: 'harian'
          });
          results.push(response);
        } catch (error) {
          console.error(`Failed to save payroll for ${detail.nama_lengkap}`, error);
        }
      }

      toast({
        title: "Berhasil",
        description: `${results.length} slip gaji berhasil disimpan`,
      });

      // Reset selection
      setSelectedKaryawan([]);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menyimpan slip gaji",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickDateRange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    setIsCalendarOpen(false);
  };

  const handleExportExcel = () => {
    // Implementation for Excel export
    toast({
      title: "Export Excel",
      description: "Fitur export Excel akan segera tersedia",
    });
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Penggajian Harian' },
  ];

  const filteredDetails = payrollDetails.filter(item => {
    const matchSearch = item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.nik?.includes(searchTerm);
    return matchSearch;
  });

  return (
    <ProtectedRoute permission="process-payroll">
      <DashboardLayout>
        <PageHeader
          title="Penggajian Harian"
          description="Perhitungan otomatis gaji harian berdasarkan kehadiran"
          breadcrumbs={breadcrumbs}
          action={
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportExcel}
                disabled={payrollDetails.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button 
                onClick={handleSavePayroll}
                disabled={isSaving || payrollDetails.length === 0}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Slip Gaji
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

        {/* Date Range and Filter Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>Pilih Periode & Filter</CardTitle>
              
              <div className="flex flex-wrap gap-2">
                {/* Date Range Picker */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-[300px]",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd MMM yyyy", { locale: id })} -{" "}
                            {format(dateRange.to, "dd MMM yyyy", { locale: id })}
                          </>
                        ) : (
                          format(dateRange.from, "dd MMM yyyy", { locale: id })
                        )
                      ) : (
                        <span>Pilih rentang tanggal</span>
                      )}
                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                      <div className="border-r p-3 space-y-1 w-44">
                        {dateRanges.map((range) => (
                          <Button
                            key={range.label}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left text-sm"
                            onClick={() => handleQuickDateRange(range.getValue())}
                          >
                            {range.label}
                          </Button>
                        ))}
                      </div>
                      <div className="p-3">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          locale={id}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Department Filter */}
                <Select value={selectedDepartemen} onValueChange={setSelectedDepartemen}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Departemen</SelectItem>
                    {departemenList.map(dept => (
                      <SelectItem key={dept.departemen_id} value={dept.departemen_id.toString()}>
                        {dept.nama_departemen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari nama atau NIK..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-[250px]"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Karyawan</p>
                  <p className="text-xl font-bold">{summary.totalKaryawan}</p>
                </div>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Hari Kerja</p>
                  <p className="text-xl font-bold">{summary.totalHariKerja}</p>
                </div>
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Gaji Pokok</p>
                  <p className="text-lg font-bold">{formatCurrency(summary.totalGajiPokok)}</p>
                </div>
                <Wallet className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Upah Lembur</p>
                  <p className="text-lg font-bold">{formatCurrency(summary.totalUpahLembur)}</p>
                </div>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Uang Makan</p>
                  <p className="text-lg font-bold">{formatCurrency(summary.totalUangMakan)}</p>
                </div>
                <UserCheck className="h-5 w-5 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Grand Total</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(summary.grandTotal)}</p>
                </div>
                <Calculator className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card>
          <CardContent className="p-0">
            {isCalculating ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
                <span className="ml-2">Menghitung payroll...</span>
              </div>
            ) : filteredDetails.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Tidak ada data payroll</p>
                <p className="text-sm text-gray-400 mt-1">
                  {dateRange?.from && dateRange?.to
                    ? "Tidak ada karyawan harian atau data absensi untuk periode ini"
                    : "Silakan pilih rentang tanggal"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[50px] sticky left-0 bg-gray-50">
                        <Checkbox
                          checked={selectedKaryawan.length === filteredDetails.length && filteredDetails.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedKaryawan(filteredDetails.map(d => d.karyawan_id));
                            } else {
                              setSelectedKaryawan([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="sticky left-[50px] bg-gray-50 z-10">No</TableHead>
                      <TableHead className="sticky left-[100px] bg-gray-50 z-10 min-w-[100px]">NIK</TableHead>
                      <TableHead className="sticky left-[200px] bg-gray-50 z-10 min-w-[200px]">Nama</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead className="text-center">Hari Kerja</TableHead>
                      <TableHead className="text-center">Hadir</TableHead>
                      <TableHead className="text-center">Gaji Pokok</TableHead>
                      <TableHead className="text-center">Week</TableHead>
                      <TableHead className="text-center">Jam Pertama Lembur</TableHead>
                      <TableHead className="text-center">Jam Kedua Lembur</TableHead>
                      <TableHead className="text-center">Jam Lembur Sabtu</TableHead>
                      <TableHead className="text-center">Jam Lembur Minggu</TableHead>
                      <TableHead className="text-center">Jam Lembur Libur</TableHead>
                      <TableHead className="text-center bg-blue-50">Upah</TableHead>
                      <TableHead className="text-center bg-green-50">Upah Lembur Weekday</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDetails.map((item, index) => (
                      <TableRow key={item.karyawan_id} className="hover:bg-gray-50">
                        <TableCell className="sticky left-0 bg-white">
                          <Checkbox
                            checked={selectedKaryawan.includes(item.karyawan_id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedKaryawan([...selectedKaryawan, item.karyawan_id]);
                              } else {
                                setSelectedKaryawan(selectedKaryawan.filter(id => id !== item.karyawan_id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="sticky left-[50px] bg-white z-10">{index + 1}</TableCell>
                        <TableCell className="sticky left-[100px] bg-white z-10 font-medium">{item.nik}</TableCell>
                        <TableCell className="sticky left-[200px] bg-white z-10">
                          <div>
                            <p className="font-medium">{item.nama_lengkap}</p>
                            <p className="text-xs text-gray-500">{item.kategori_gaji}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.departemen}</TableCell>
                        <TableCell className="text-center">{item.total_hari_kerja}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col">
                            <span className="font-medium">{item.total_hadir}/{item.total_hari_kerja}</span>
                            {item.total_terlambat > 0 && (
                              <span className="text-xs text-yellow-600">T: {item.total_terlambat}</span>
                            )}
                            {item.total_alpha > 0 && (
                              <span className="text-xs text-red-600">A: {item.total_alpha}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.gaji_pokok)}</TableCell>
                        <TableCell className="text-center">{item.total_hadir}</TableCell>
                        <TableCell className="text-center">{toNum(item.jam_lembur_pertama).toFixed(1)}</TableCell>
                        <TableCell className="text-center">{toNum(item.jam_lembur_kedua).toFixed(1)}</TableCell>
                        <TableCell className="text-center">{toNum(item.jam_lembur_sabtu).toFixed(1)}</TableCell>
                        <TableCell className="text-center">{toNum(item.jam_lembur_minggu).toFixed(1)}</TableCell>
                        <TableCell className="text-center">{toNum(item.jam_lembur_libur).toFixed(1)}</TableCell>
                        <TableCell className="text-right font-medium bg-blue-50">{formatCurrency(item.uang_makan)}</TableCell>
                        <TableCell className="text-right font-medium bg-green-50">{formatCurrency(item.upah_lembur_weekday)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Total Row */}
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell colSpan={7} className="text-right">TOTAL</TableCell>
                      <TableCell className="text-right">{formatCurrency(summary.totalGajiPokok)}</TableCell>
                      <TableCell className="text-center">
                        {filteredDetails.reduce((sum, d) => sum + toNum(d.total_hadir), 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        {filteredDetails.reduce((sum, d) => sum + toNum(d.jam_lembur_pertama), 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        {filteredDetails.reduce((sum, d) => sum + toNum(d.jam_lembur_kedua), 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        {filteredDetails.reduce((sum, d) => sum + toNum(d.jam_lembur_sabtu), 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        {filteredDetails.reduce((sum, d) => sum + toNum(d.jam_lembur_minggu), 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        {filteredDetails.reduce((sum, d) => sum + toNum(d.jam_lembur_libur), 0).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right bg-blue-100">
                        {formatCurrency(summary.totalUangMakan)}
                      </TableCell>
                      <TableCell className="text-right bg-green-100">
                        {formatCurrency(filteredDetails.reduce((sum, d) => sum + toNum(d.upah_lembur_weekday), 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Info Bar */}
        {selectedKaryawan.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-lg">
                  {selectedKaryawan.length} Karyawan Dipilih
                </Badge>
                <div className="text-sm text-gray-600">
                  Total Gaji: <span className="font-bold text-lg">
                    {formatCurrency(
                      payrollDetails
                        .filter(d => selectedKaryawan.includes(d.karyawan_id))
                        .reduce((sum, d) => sum + toNum(d.total_gaji), 0)
                    )}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedKaryawan([])}
                >
                  <X className="h-4 w-4 mr-1" />
                  Batalkan
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSavePayroll}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan {selectedKaryawan.length} Slip Gaji
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info Alert */}
        {dateRange?.from && dateRange?.to && payrollDetails.length > 0 && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Periode:</strong> {format(dateRange.from, 'dd MMMM yyyy', { locale: id })} - {format(dateRange.to, 'dd MMMM yyyy', { locale: id })}
              <br />
              <strong>Perhitungan:</strong> Gaji Pokok (Tarif Harian × Hari Hadir) + Upah Lembur + Premi + Uang Makan - Potongan
              <br />
              {settings ? (
                <> 
                  <strong>Setting Aktif:</strong> Tarif default {formatCurrency(settings.tarif_harian_default)}, Jam kerja/hari {settings.jam_kerja_per_hari}.<br />
                  Lembur: 1st {settings.lembur_weekday_first_multiplier}x | next {settings.lembur_weekday_next_multiplier}x | Sabtu {settings.lembur_sabtu_multiplier}x | Minggu {settings.lembur_minggu_multiplier}x | Libur {settings.lembur_libur_multiplier}x.<br />
                  Premi (≥{settings.premi_kehadiran_min_hadir} hadir): {formatCurrency(settings.premi_kehadiran_nominal)} | Uang makan/hadir: {formatCurrency(settings.uang_makan_per_hadir)} | BPJS: {formatCurrency(settings.potongan_bpjs_flat)}
                </>
              ) : (
                <>
                  <strong>Tarif Lembur:</strong> Jam Pertama 1.5x | Jam Kedua 2x | Sabtu 2x | Minggu 3x | Libur 3x
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
