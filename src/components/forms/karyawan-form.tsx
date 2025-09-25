// src/components/forms/karyawan-form.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';

interface Departemen {
  departemen_id: number;
  nama_departemen: string;
}
interface Jabatan {
  jabatan_id: number;
  nama_jabatan: string;
}

type JenisKelamin = 'Laki-laki' | 'Perempuan';
type StatusPerkawinan = 'Belum Menikah' | 'Menikah' | 'Cerai';
type KategoriGaji = 'Bulanan' | 'Harian' | 'Borongan';
type PeriodeGaji = 'harian' | 'mingguan' | 'bulanan';
type StatusKaryawan = 'Aktif' | 'Resign';
type RoleKaryawan = 'produksi' | 'staff';

export interface KaryawanFormData {
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string; // yyyy-mm-dd
  jenis_kelamin: JenisKelamin;
  alamat: string;
  status_perkawinan: StatusPerkawinan;
  nomor_telepon: string;
  email: string;
  tanggal_masuk: string; // yyyy-mm-dd
  jam_kerja_masuk: string; // HH:mm
  jam_kerja_pulang: string; // HH:mm
  kategori_gaji: KategoriGaji;
  periode_gaji: PeriodeGaji;
  tarif_harian?: string; // input number as string, convert on submit
  departemen_id_saat_ini: string; // select stores string
  jabatan_id_saat_ini: string; // select stores string
  status: StatusKaryawan;
  pin_fingerprint: string;
  role_karyawan: RoleKaryawan;
}

interface KaryawanFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<KaryawanFormData>;
  /** Wajib diisi saat mode='edit' */
  karyawanId?: number;
}

export function KaryawanForm({ mode, initialData, karyawanId }: KaryawanFormProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false); // loading master data
  const [saving, setSaving] = useState(false);       // saving form
  const [error, setError] = useState('');

  const [departemen, setDepartemen] = useState<Departemen[]>([]);
  const [jabatan, setJabatan] = useState<Jabatan[]>([]);

  const [formData, setFormData] = useState<KaryawanFormData>({
    nik: '',
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki',
    alamat: '',
    status_perkawinan: 'Belum Menikah',
    nomor_telepon: '',
    email: '',
    tanggal_masuk: '',
    jam_kerja_masuk: '',
    jam_kerja_pulang: '',
    kategori_gaji: 'Harian',
    periode_gaji: 'harian',
    tarif_harian: '',
    departemen_id_saat_ini: '',
    jabatan_id_saat_ini: '',
    status: 'Aktif',
    pin_fingerprint: '',
    role_karyawan: 'staff',
    ...initialData,
  });

  const loadMasterData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [deptRes, jabRes] = await Promise.all([
        apiClient.getDepartemen(),
        apiClient.getJabatan(),
      ]);

      // asumsi API mengembalikan array sesuai interface di atas
      setDepartemen(deptRes.data || []);
      setJabatan(jabRes.data || []);
    } catch (err) {
      console.error('Failed to load master data:', err);
      setError('Gagal memuat data master');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  const handleInputChange =
    (field: keyof KaryawanFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSelectChange =
    (field: keyof KaryawanFormData) =>
    (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value as any }));
    };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.nik.trim()) errors.push('NIK wajib diisi');
    if (!formData.nama_lengkap.trim()) errors.push('Nama lengkap wajib diisi');
    if (!formData.email.trim()) errors.push('Email wajib diisi');
    if (!formData.departemen_id_saat_ini) errors.push('Departemen wajib dipilih');
    if (!formData.jabatan_id_saat_ini) errors.push('Jabatan wajib dipilih');

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Format email tidak valid');
    }

    // Kategori Harian → tarif wajib & > 0
    if (
      formData.kategori_gaji === 'Harian' &&
      (!formData.tarif_harian || Number(formData.tarif_harian) <= 0)
    ) {
      errors.push('Tarif harian wajib diisi untuk kategori Harian');
    }

    // Jam kerja (opsional, tapi jika isi salah format sederhana)
    const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (formData.jam_kerja_masuk && !hhmm.test(formData.jam_kerja_masuk)) {
      errors.push('Format jam kerja masuk harus HH:mm');
    }
    if (formData.jam_kerja_pulang && !hhmm.test(formData.jam_kerja_pulang)) {
      errors.push('Format jam kerja pulang harus HH:mm');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: 'Validasi Gagal',
        description: validationErrors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        ...formData,
        departemen_id_saat_ini: Number(formData.departemen_id_saat_ini),
        jabatan_id_saat_ini: Number(formData.jabatan_id_saat_ini),
        tarif_harian:
          formData.kategori_gaji === 'Harian' && formData.tarif_harian
            ? Number(formData.tarif_harian)
            : undefined,
      };

      if (mode === 'create') {
        await apiClient.createKaryawan(payload as any);
        toast({ title: 'Berhasil', description: 'Karyawan berhasil ditambahkan' });
      } else {
        if (!karyawanId) {
          throw new Error('ID karyawan tidak ditemukan untuk mode edit');
        }
        await apiClient.updateKaryawan(karyawanId, payload as any);
        toast({ title: 'Berhasil', description: 'Karyawan berhasil diperbarui' });
      }

      router.push('/karyawan');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Tambah Karyawan Baru' : 'Edit Karyawan'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nik">NIK *</Label>
              <Input
                id="nik"
                type="text"
                placeholder="Masukkan NIK Anda"
                value={formData.nik}
                onChange={handleInputChange('nik')}
                required
                className="h-12"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
              <Input
                id="nama_lengkap"
                value={formData.nama_lengkap}
                onChange={handleInputChange('nama_lengkap')}
                placeholder="Masukkan nama lengkap"
                required
                className="h-12"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="nama@email.com"
                required
                className="h-12"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
              <Input
                id="nomor_telepon"
                value={formData.nomor_telepon}
                onChange={handleInputChange('nomor_telepon')}
                placeholder="08xxxxxxxxxx"
                className="h-12"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
              <Input
                id="tempat_lahir"
                value={formData.tempat_lahir}
                onChange={handleInputChange('tempat_lahir')}
                placeholder="Tempat lahir"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
              <Input
                id="tanggal_lahir"
                type="date"
                value={formData.tanggal_lahir}
                onChange={handleInputChange('tanggal_lahir')}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select
                value={formData.jenis_kelamin}
                onValueChange={handleSelectChange('jenis_kelamin')}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status Perkawinan</Label>
              <Select
                value={formData.status_perkawinan}
                onValueChange={handleSelectChange('status_perkawinan')}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                  <SelectItem value="Menikah">Menikah</SelectItem>
                  <SelectItem value="Cerai">Cerai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea
              id="alamat"
              value={formData.alamat}
              onChange={handleInputChange('alamat')}
              placeholder="Masukkan alamat lengkap"
              rows={3}
            />
          </div>

          {/* Work Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Departemen *</Label>
              <Select
                value={formData.departemen_id_saat_ini}
                onValueChange={handleSelectChange('departemen_id_saat_ini')}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih departemen" />
                </SelectTrigger>
                <SelectContent>
                  {departemen.map((dept) => (
                    <SelectItem key={dept.departemen_id} value={dept.departemen_id.toString()}>
                      {dept.nama_departemen}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jabatan *</Label>
              <Select
                value={formData.jabatan_id_saat_ini}
                onValueChange={handleSelectChange('jabatan_id_saat_ini')}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {jabatan.map((jab) => (
                    <SelectItem key={jab.jabatan_id} value={jab.jabatan_id.toString()}>
                      {jab.nama_jabatan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Masuk</Label>
              <Input
                id="tanggal_masuk"
                type="date"
                value={formData.tanggal_masuk}
                onChange={handleInputChange('tanggal_masuk')}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Jam Kerja Masuk (HH:mm)</Label>
              <Input
                id="jam_kerja_masuk"
                type="time"
                value={formData.jam_kerja_masuk}
                onChange={handleInputChange('jam_kerja_masuk')}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Jam Kerja Pulang (HH:mm)</Label>
              <Input
                id="jam_kerja_pulang"
                type="time"
                value={formData.jam_kerja_pulang}
                onChange={handleInputChange('jam_kerja_pulang')}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori Gaji</Label>
              <Select
                value={formData.kategori_gaji}
                onValueChange={handleSelectChange('kategori_gaji')}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bulanan">Bulanan</SelectItem>
                  <SelectItem value="Harian">Harian</SelectItem>
                  <SelectItem value="Borongan">Borongan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Periode Gaji</Label>
              <Select
                value={formData.periode_gaji}
                onValueChange={handleSelectChange('periode_gaji')}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harian">Harian</SelectItem>
                  <SelectItem value="mingguan">Mingguan</SelectItem>
                  <SelectItem value="bulanan">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.kategori_gaji === 'Harian' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tarif_harian">Tarif Harian (Rp)</Label>
                <Input
                  id="tarif_harian"
                  type="number"
                  value={formData.tarif_harian}
                  onChange={handleInputChange('tarif_harian')}
                  placeholder="150000"
                  min={0}
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={handleSelectChange('status')}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Resign">Resign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role Karyawan</Label>
              <Select
                value={formData.role_karyawan}
                onValueChange={handleSelectChange('role_karyawan')}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="produksi">Produksi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="pin_fingerprint">PIN Fingerprint</Label>
              <Input
                id="pin_fingerprint"
                value={formData.pin_fingerprint}
                onChange={handleInputChange('pin_fingerprint')}
                placeholder="Opsional"
                className="h-12"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Simpan' : 'Update'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
