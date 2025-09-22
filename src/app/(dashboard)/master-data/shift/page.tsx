// src/app/(dashboard)/master-data/shift/page.tsx
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Shift } from '@/types/master-data';
import { formatTime } from '@/lib/utils';
import { apiClient, handleApiError } from '@/lib/api';
import {
  Plus,
  Edit,
  Trash,
  Clock,
  Moon,
  Sun,
  Sunrise,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

type ShiftForm = {
  kode_shift: string;
  jam_masuk: string;   // "HH:mm"
  jam_pulang: string;  // "HH:mm"
  hari_berikutnya: boolean;
};

export default function ShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Form state
  const [formData, setFormData] = useState<ShiftForm>({
    kode_shift: '',
    jam_masuk: '',
    jam_pulang: '',
    hari_berikutnya: false,
  });

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await apiClient.getShift();
      const data = Array.isArray(res.data) ? res.data : [];
      setShifts(
        data.map((s: any) => ({
          ...s,
          jam_masuk: s.jam_masuk ?? null,
          jam_pulang: s.jam_pulang ?? null,
          hari_berikutnya: !!s.hari_berikutnya,
        }))
      );
    } catch (e: any) {
      setError(handleApiError(e) || 'Gagal memuat data shift');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.kode_shift.trim()) {
      toast({ title: 'Validasi', description: 'Kode shift wajib diisi', variant: 'destructive' });
      return false;
    }
    if (formData.jam_masuk && !/^\d{2}:\d{2}$/.test(formData.jam_masuk)) {
      toast({ title: 'Validasi', description: 'Format jam masuk tidak valid', variant: 'destructive' });
      return false;
    }
    if (formData.jam_pulang && !/^\d{2}:\d{2}$/.test(formData.jam_pulang)) {
      toast({ title: 'Validasi', description: 'Format jam pulang tidak valid', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const toHHmmss = (val: string) => (val ? (val.length === 5 ? `${val}:00` : val) : null);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        kode_shift: formData.kode_shift.trim().toUpperCase(),
        jam_masuk: toHHmmss(formData.jam_masuk),
        jam_pulang: toHHmmss(formData.jam_pulang),
        hari_berikutnya: formData.hari_berikutnya,
      };

      if (editMode && selectedShift) {
        await apiClient.updateShift(selectedShift.shift_id, payload);
        toast({ title: 'Berhasil', description: 'Shift berhasil diperbarui' });
      } else {
        await apiClient.createShift(payload);
        toast({ title: 'Berhasil', description: 'Shift berhasil ditambahkan' });
      }

      setDialogOpen(false);
      resetForm();
      await loadShifts();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: handleApiError(e) || 'Gagal menyimpan shift',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setFormData({
      kode_shift: shift.kode_shift,
      jam_masuk: shift.jam_masuk ? shift.jam_masuk.substring(0, 5) : '',
      jam_pulang: shift.jam_pulang ? shift.jam_pulang.substring(0, 5) : '',
      hari_berikutnya: !!shift.hari_berikutnya,
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = confirm('Apakah Anda yakin ingin menghapus shift ini?');
    if (!ok) return;

    try {
      setDeletingId(id);
      await apiClient.deleteShift(id);
      setShifts((prev) => prev.filter((s) => s.shift_id !== id));
      toast({ title: 'Berhasil', description: 'Shift berhasil dihapus' });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: handleApiError(e) || 'Gagal menghapus shift',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      kode_shift: '',
      jam_masuk: '',
      jam_pulang: '',
      hari_berikutnya: false,
    });
    setSelectedShift(null);
    setEditMode(false);
  };

  const getShiftIcon = (kode: string) => {
    switch ((kode || '').toUpperCase()) {
      case 'PAGI':
        return <Sunrise className="h-5 w-5" />;
      case 'SIANG':
        return <Sun className="h-5 w-5" />;
      case 'MALAM':
        return <Moon className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getShiftColor = (kode: string) => {
    switch ((kode || '').toUpperCase()) {
      case 'PAGI':
        return 'bg-yellow-100 text-yellow-800';
      case 'SIANG':
        return 'bg-orange-100 text-orange-800';
      case 'MALAM':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Master Data' },
    { label: 'Shift' },
  ];

  return (
    <ProtectedRoute permission="manage-master-data">
      <DashboardLayout>
        <PageHeader
          title="Master Data Shift"
          description="Kelola jadwal shift kerja karyawan"
          breadcrumbs={breadcrumbs}
          action={
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editMode ? 'Edit Shift' : 'Tambah Shift Baru'}</DialogTitle>
                  <DialogDescription>
                    Lengkapi formulir untuk {editMode ? 'mengubah' : 'menambah'} shift
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="kode">Kode Shift</Label>
                    <Input
                      id="kode"
                      value={formData.kode_shift}
                      onChange={(e) =>
                        setFormData({ ...formData, kode_shift: e.target.value.toUpperCase() })
                      }
                      placeholder="Contoh: PAGI, SIANG, MALAM"
                      maxLength={10}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="jam_masuk">Jam Masuk</Label>
                      <Input
                        id="jam_masuk"
                        type="time"
                        value={formData.jam_masuk}
                        onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jam_pulang">Jam Pulang</Label>
                      <Input
                        id="jam_pulang"
                        type="time"
                        value={formData.jam_pulang}
                        onChange={(e) => setFormData({ ...formData, jam_pulang: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="hari_berikutnya">Hari Berikutnya</Label>
                      <p className="text-sm text-gray-500">
                        Aktifkan jika jam pulang di hari berikutnya
                      </p>
                    </div>
                    <Switch
                      id="hari_berikutnya"
                      checked={formData.hari_berikutnya}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hari_berikutnya: checked })
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Menyimpan...' : (editMode ? 'Simpan Perubahan' : 'Tambah Shift')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Shift Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {shifts.map((shift, index) => (
            <motion.div
              key={shift.shift_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${getShiftColor(shift.kode_shift)}`}>
                      {getShiftIcon(shift.kode_shift)}
                    </div>
                    <Badge variant="outline">{shift.kode_shift}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">
                      {shift.jam_masuk ? formatTime(shift.jam_masuk) : 'Flexible'}
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">
                      {shift.jam_pulang ? formatTime(shift.jam_pulang) : 'Flexible'}
                    </span>
                    {shift.hari_berikutnya && (
                      <Badge className="ml-1 text-xs" variant="secondary">
                        +1
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(shift)}
                      className="flex-1"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(shift.shift_id)}
                      className="flex-1 text-red-600 hover:text-red-700"
                      disabled={deletingId === shift.shift_id}
                      title="Hapus"
                    >
                      {deletingId === shift.shift_id ? <LoadingSpinner size="sm" /> : <Trash className="h-3 w-3" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Shift Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Shift</CardTitle>
            <CardDescription>Informasi lengkap jadwal shift yang tersedia</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada shift</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Shift</TableHead>
                    <TableHead>Jam Masuk</TableHead>
                    <TableHead>Jam Pulang</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((shift, index) => {
                    let duration = '-';
                    if (shift.jam_masuk && shift.jam_pulang) {
                      const masuk = new Date(`2024-01-01T${shift.jam_masuk}`);
                      let pulang = new Date(`2024-01-01T${shift.jam_pulang}`);
                      if (shift.hari_berikutnya || pulang < masuk) {
                        pulang = new Date(pulang.getTime() + 24 * 60 * 60 * 1000);
                      }
                      const diff = pulang.getTime() - masuk.getTime();
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      duration = `${hours} jam${minutes > 0 ? ` ${minutes} menit` : ''}`;
                    }

                    return (
                      <motion.tr
                        key={shift.shift_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${getShiftColor(shift.kode_shift)}`}>
                              {getShiftIcon(shift.kode_shift)}
                            </div>
                            {shift.kode_shift}
                          </div>
                        </TableCell>
                        <TableCell>
                          {shift.jam_masuk ? (
                            <Badge variant="outline">{formatTime(shift.jam_masuk)}</Badge>
                          ) : (
                            <span className="text-gray-500">Flexible</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {shift.jam_pulang ? (
                              <Badge variant="outline">{formatTime(shift.jam_pulang)}</Badge>
                            ) : (
                              <span className="text-gray-500">Flexible</span>
                            )}
                            {shift.hari_berikutnya && (
                              <Badge className="text-xs" variant="secondary">
                                Hari Berikutnya
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{duration}</span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600">
                            {shift.kode_shift === 'PAGI' && 'Shift pagi untuk produksi'}
                            {shift.kode_shift === 'SIANG' && 'Shift siang untuk produksi'}
                            {shift.kode_shift === 'MALAM' && 'Shift malam untuk produksi'}
                            {shift.kode_shift === 'NORMAL' && 'Jam kerja normal kantor'}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(shift)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(shift.shift_id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deletingId === shift.shift_id}
                              title="Hapus"
                            >
                              {deletingId === shift.shift_id ? <LoadingSpinner size="sm" /> : <Trash className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
