'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Karyawan } from '@/types/karyawan';
import { getStatusColor, formatDate, getInitials } from '@/lib/utils';
import { apiClient, handleApiError } from '@/lib/api';
import {
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Download,
  UserPlus,
  AlertCircle,
  Users,
  Building2,
  Filter,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DepartemenOption {
  departemen_id: number;
  nama_departemen: string;
}

interface JabatanOption {
  jabatan_id: number;
  nama_jabatan: string;
}

interface EnrichedKaryawan extends Omit<Karyawan, 'departemenSaatIni' | 'jabatanSaatIni'> {
  departemenSaatIni?: DepartemenOption;
  jabatanSaatIni?: JabatanOption;
}

export default function KaryawanPage() {
  const { hasPermission } = useAuth();
  
  // Data states
  const [karyawan, setKaryawan] = useState<EnrichedKaryawan[]>([]);
  const [departemenOptions, setDepartemenOptions] = useState<DepartemenOption[]>([]);
  const [jabatanOptions, setJabatanOptions] = useState<JabatanOption[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartemen, setFilterDepartemen] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load all master data in parallel
      const [karyawanRes, departemenRes, jabatanRes] = await Promise.allSettled([
        apiClient.getKaryawan(),
        apiClient.getDepartemen(),
        apiClient.getJabatan()
      ]);

      let departemenData: DepartemenOption[] = [];
      let jabatanData: JabatanOption[] = [];
      let karyawanData: any[] = [];

      // Process departemen
      if (departemenRes.status === 'fulfilled') {
        const data = departemenRes.value.data;
        if (Array.isArray(data)) {
          departemenData = data;
          setDepartemenOptions(data);
        }
      }

      // Process jabatan
      if (jabatanRes.status === 'fulfilled') {
        const data = jabatanRes.value.data;
        if (Array.isArray(data)) {
          jabatanData = data;
          setJabatanOptions(data);
        }
      }

      // Process karyawan with enrichment
      if (karyawanRes.status === 'fulfilled') {
        const rawData = karyawanRes.value.data;
        const karyawanArray = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.data) ? rawData.data : [];
        
        // Enrich karyawan data with department and position info
        const enrichedKaryawan: EnrichedKaryawan[] = karyawanArray.map((k: any) => {
          // Find department
          const departemen = departemenData.find(d => d.departemen_id === k.departemen_id_saat_ini);
          
          // Find jabatan
          const jabatan = jabatanData.find(j => j.jabatan_id === k.jabatan_id_saat_ini);

          return {
            ...k,
            departemenSaatIni: departemen,
            jabatanSaatIni: jabatan,
          };
        });

        setKaryawan(enrichedKaryawan);
        karyawanData = enrichedKaryawan;
      }

      // Show success message if we have data
      if (karyawanData.length > 0 || departemenData.length > 0) {
        console.log(`Loaded ${karyawanData.length} employees, ${departemenData.length} departments, ${jabatanData.length} positions`);
      } else {
        throw new Error('Tidak ada data yang berhasil dimuat');
      }

    } catch (e: any) {
      console.error('Error loading initial data:', e);
      setError(handleApiError(e) || 'Gagal memuat data karyawan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
  };

  const handleDelete = async (id: number) => {
    const employee = karyawan.find(k => k.karyawan_id === id);
    const confirmMessage = `Apakah Anda yakin ingin menghapus karyawan "${employee?.nama_lengkap}"?\n\nTindakan ini tidak dapat dibatalkan.`;
    
    if (!confirm(confirmMessage)) return;

    try {
      setDeletingId(id);
      await apiClient.deleteKaryawan(id);
      setKaryawan(prev => prev.filter(k => k.karyawan_id !== id));
    } catch (e: any) {
      setError(handleApiError(e) || 'Gagal menghapus karyawan');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredKaryawan = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return karyawan.filter((k) => {
      // Search filter
      const matchesSearch = !term || 
        k.nama_lengkap.toLowerCase().includes(term) ||
        k.nik.toLowerCase().includes(term) ||
        (k.email || '').toLowerCase().includes(term) ||
        k.departemenSaatIni?.nama_departemen.toLowerCase().includes(term) ||
        k.jabatanSaatIni?.nama_jabatan.toLowerCase().includes(term);

      // Department filter
      const matchesDepartemen = filterDepartemen === 'all' || 
        (k.departemen_id_saat_ini && k.departemen_id_saat_ini.toString() === filterDepartemen);

      // Status filter
      const matchesStatus = filterStatus === 'all' || k.status === filterStatus;

      // Role filter
      const matchesRole = filterRole === 'all' || k.role_karyawan === filterRole;

      return matchesSearch && matchesDepartemen && matchesStatus && matchesRole;
    });
  }, [karyawan, searchTerm, filterDepartemen, filterStatus, filterRole]);

  const stats = useMemo(() => {
    const total = filteredKaryawan.length;
    const aktif = filteredKaryawan.filter(k => k.status === 'Aktif').length;
    const resign = filteredKaryawan.filter(k => k.status === 'Resign').length;
    const produksi = filteredKaryawan.filter(k => k.role_karyawan === 'produksi').length;
    const staff = filteredKaryawan.filter(k => k.role_karyawan === 'staff').length;

    return { total, aktif, resign, produksi, staff };
  }, [filteredKaryawan]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Memuat data karyawan...</p>
        </div>
      </DashboardLayout>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Karyawan' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Daftar Karyawan"
        description={`Kelola data karyawan - Total: ${stats.total} karyawan`}
        breadcrumbs={breadcrumbs}
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Memuat...' : 'Refresh'}
            </Button>
            {hasPermission('create-karyawan') && (
              <Button asChild>
                <Link href="/karyawan/create">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Tambah Karyawan
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="Aktif" value={stats.aktif} color="green" />
        <StatCard label="Resign" value={stats.resign} color="red" />
        <StatCard label="Produksi" value={stats.produksi} color="purple" />
        <StatCard label="Staff" value={stats.staff} color="yellow" />
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              Filter & Pencarian
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari nama, NIK, email, departemen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={filterDepartemen} onValueChange={setFilterDepartemen}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Semua Departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Departemen</SelectItem>
                    {departemenOptions.map((dept) => (
                      <SelectItem key={dept.departemen_id} value={dept.departemen_id.toString()}>
                        {dept.nama_departemen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Resign">Resign</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Role</SelectItem>
                    <SelectItem value="produksi">Produksi</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDepartemen('all');
                    setFilterStatus('all');
                    setFilterRole('all');
                  }}
                >
                  Reset
                </Button>

                <Button variant="outline" size="icon" title="Export (coming soon)">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredKaryawan.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {karyawan.length === 0 ? 'Belum ada data karyawan' : 'Tidak ada karyawan yang sesuai filter'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {karyawan.length === 0 
                  ? 'Mulai dengan menambahkan karyawan pertama Anda.'
                  : 'Coba ubah filter atau kata kunci pencarian Anda.'
                }
              </p>
              <div className="flex gap-2 justify-center">
                {hasPermission('create-karyawan') && (
                  <Button asChild>
                    <Link href="/karyawan/create">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Tambah Karyawan
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Karyawan</TableHead>
                    <TableHead className="font-semibold">Departemen</TableHead>
                    <TableHead className="font-semibold">Jabatan</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Tanggal Masuk</TableHead>
                    <TableHead className="text-right font-semibold">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKaryawan.map((k, index) => (
                    <motion.tr
                      key={k.karyawan_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.5) }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {getInitials(k.nama_lengkap)}
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {k.nama_lengkap}
                            </p>
                            <div className="flex flex-col gap-0.5">
                              <p className="text-sm text-muted-foreground font-mono">
                                NIK: {k.nik}
                              </p>
                              {k.email && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {k.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {k.departemenSaatIni?.nama_departemen || (
                              <span className="text-muted-foreground italic">Belum diset</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {k.jabatanSaatIni?.nama_jabatan || (
                          <span className="text-muted-foreground italic">Belum diset</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {k.role_karyawan || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(k.status)} variant="outline">
                          {k.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {k.tanggal_masuk ? formatDate(k.tanggal_masuk, 'dd MMM yyyy') : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/karyawan/${k.karyawan_id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            {hasPermission('update-karyawan') && (
                              <DropdownMenuItem asChild>
                                <Link href={`/karyawan/${k.karyawan_id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {hasPermission('delete-karyawan') && k.status !== 'Aktif' && (
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDelete(k.karyawan_id)}
                                disabled={deletingId === k.karyawan_id}
                              >
                                {deletingId === k.karyawan_id ? (
                                  <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Menghapus...
                                  </>
                                ) : (
                                  <>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Hapus
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Table Footer */}
          {filteredKaryawan.length > 0 && (
            <div className="border-t p-4 text-sm text-muted-foreground">
              Menampilkan {filteredKaryawan.length} dari {karyawan.length} karyawan
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function StatCard({ 
  label, 
  value, 
  color = 'blue' 
}: { 
  label: string; 
  value: number; 
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red'; 
}) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/10 dark:text-blue-400',
    green: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/10 dark:text-green-400',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/10 dark:text-yellow-400',
    purple: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900/10 dark:text-purple-400',
    red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/10 dark:text-red-400',
  };

  return (
    <Card className={`border-2 ${colorClasses[color]} transition-all hover:shadow-sm`}>
      <CardContent className="p-4 text-center">
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs font-medium opacity-75">{label}</div>
      </CardContent>
    </Card>
  );
}                                                                                                       