// src/app/(dashboard)/absensi/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Absensi } from '@/types/absensi';
import { getStatusColor, formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { 
  Search, 
  Download,
  Calendar as CalendarIcon,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Fingerprint,
  RefreshCw,
  FileText,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AbsensiPage() {
  const { user } = useAuth();
  const [absensi, setAbsensi] = useState<Absensi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartemen, setFilterDepartemen] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('today');

  // Statistics
  const [stats, setStats] = useState({
    totalKaryawan: 150,
    hadir: 138,
    terlambat: 4,
    izin: 3,
    cuti: 2,
    alpha: 3,
  });

  useEffect(() => {
    loadAbsensi();
  }, [selectedDate, activeTab]);

  const loadAbsensi = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Mock data
      const mockData: Absensi[] = [
        {
          absensi_id: 1,
          karyawan_id: 1,
          tanggal_absensi: selectedDate.toISOString().split('T')[0],
          jam_scan_masuk: '08:00:00',
          jam_scan_pulang: '17:00:00',
          durasi_lembur_menit: 0,
          status: 'Hadir',
          jam_lembur: 0,
          jenis_hari: 'weekday',
          hadir_6_hari_periode: true,
          upah_lembur: 0,
          premi: 20000,
          uang_makan: 15000,
          total_gaji_tambahan: 35000,
          karyawan: {
            karyawan_id: 1,
            nik: 'NK001',
            nama_lengkap: 'John Doe',
            tempat_lahir: 'Jakarta',
            tanggal_lahir: '1990-01-01',
            jenis_kelamin: 'Laki-laki',
            alamat: 'Jl. Contoh No. 1',
            status_perkawinan: 'Menikah',
            nomor_telepon: '081234567890',
            email: 'john.doe@tunasesta.com',
            role: 'karyawan',
            tanggal_masuk: '2020-01-01',
            kategori_gaji: 'Bulanan',
            periode_gaji: 'bulanan',
            status: 'Aktif',
            departemen_id_saat_ini: 1,
            jabatan_id_saat_ini: 1,
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
            created_at: '',
            updated_at: '',
          },
          created_at: '',
          updated_at: '',
        },
      ];
      
      setAbsensi(mockData);
      
      // Hitung statistik
      setStats({
        totalKaryawan: 150,
        hadir: 138,
        terlambat: 4,
        izin: 3,
        cuti: 2,
        alpha: 3,
      });
    } catch (error) {
      console.error('Error loading absensi:', error);
      setError('Gagal memuat data absensi');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAbsensi = absensi.filter(item => {
    const matchesSearch =
      item.karyawan?.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.karyawan?.nik.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartemen =
      filterDepartemen === 'all' || item.karyawan?.departemenSaatIni?.nama_departemen === filterDepartemen;
    const matchesStatus =
      filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesDepartemen && matchesStatus;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Data Absensi"
        description="Monitor kehadiran karyawan harian"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Absensi' }]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAbsensi}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/fingerprint/device">
                <Fingerprint className="h-4 w-4 mr-2" />
                Sync Device
              </Link>
            </Button>
          </div>
        }
      />

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Cari nama atau NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-64"
          />
        </div>

        <Select value={filterDepartemen} onValueChange={setFilterDepartemen}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Departemen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Departemen</SelectItem>
            <SelectItem value="Produksi">Produksi</SelectItem>
            <SelectItem value="Human Resources">Human Resources</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Hadir">Hadir</SelectItem>
            <SelectItem value="Terlambat">Terlambat</SelectItem>
            <SelectItem value="Izin">Izin</SelectItem>
            <SelectItem value="Cuti">Cuti</SelectItem>
            <SelectItem value="Alpha">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabel */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAbsensi.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data absensi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIK</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Jam Masuk</TableHead>
                    <TableHead>Jam Pulang</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAbsensi.map((item, index) => (
                    <motion.tr
                      key={item.absensi_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>{item.karyawan?.nik}</TableCell>
                      <TableCell>{item.karyawan?.nama_lengkap}</TableCell>
                      <TableCell>{item.karyawan?.departemenSaatIni?.nama_departemen}</TableCell>
                   <TableCell>{item.jam_scan_masuk ? formatTime(item.jam_scan_masuk) : '-'}</TableCell>
                    <TableCell>{item.jam_scan_pulang ? formatTime(item.jam_scan_pulang) : '-'}</TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
