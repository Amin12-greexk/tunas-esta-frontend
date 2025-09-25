// src/app/(dashboard)/karyawan/[id]/edit/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/common/page-header';
import { ProtectedRoute } from '@/components/common/protected-route';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { toast } from '@/hooks/use-toast';

import { Save, ArrowLeft, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

type Departemen = { departemen_id: number; nama_departemen: string };
type Jabatan = { jabatan_id: number; nama_jabatan: string };

type FormState = {
  nik: string;
  nama_lengkap: string;
  email: string;
  nomor_telepon: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan' | '';
  alamat: string;
  status_perkawinan: 'Belum Menikah' | 'Menikah' | 'Cerai' | '';
  tanggal_masuk: string;
  jam_kerja_masuk: string;
  jam_kerja_pulang: string;

  kategori_gaji: 'Bulanan' | 'Harian' | 'Borongan' | '';
  periode_gaji: 'bulanan' | 'mingguan' | 'harian' | '';
  tarif_harian?: string;

  departemen_id_saat_ini: string;
  jabatan_id_saat_ini: string;

  status: 'Aktif' | 'Resign' | '';
  pin_fingerprint: string;
  role_karyawan: 'produksi' | 'staff' | '';
};

export default function EditKaryawanPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [departemen, setDepartemen] = useState<Departemen[]>([]);
  const [jabatan, setJabatan] = useState<Jabatan[]>([]);
  const [form, setForm] = useState<FormState>({
    nik: '',
    nama_lengkap: '',
    email: '',
    nomor_telepon: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    status_perkawinan: '',
    tanggal_masuk: '',
    jam_kerja_masuk: '',
    jam_kerja_pulang: '',

    kategori_gaji: '',
    periode_gaji: 'bulanan',
    tarif_harian: '',

    departemen_id_saat_ini: '',
    jabatan_id_saat_ini: '',

    status: 'Aktif',
    pin_fingerprint: '',
    role_karyawan: 'staff',
  });

  const tokenHeaders = useMemo(() => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    const token = Cookies.get('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, []);

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [deptRes, jabRes] = await Promise.all([
          fetch(`${API_BASE_URL}/departemen`, { headers: tokenHeaders }),
          fetch(`${API_BASE_URL}/jabatan`, { headers: tokenHeaders })
        ]);
        if (deptRes.ok) {
          const d: Departemen[] = await deptRes.json();
          setDepartemen(d || []);
        }
        if (jabRes.ok) {
          const j: Jabatan[] = await jabRes.json();
          setJabatan(j || []);
        }
      } catch {}
    };

    const loadEmployee = async () => {
      try {
        setIsLoading(true);
        setServerError(null);
        const res = await fetch(`${API_BASE_URL}/karyawan/${id}`, { headers: tokenHeaders });
        if (!res.ok) {
          throw new Error(`Gagal memuat data karyawan (status ${res.status})`);
        }
        const data = await res.json();

        setForm({
          nik: data.nik ?? '',
          nama_lengkap: data.nama_lengkap ?? '',
          email: data.email ?? '',
          nomor_telepon: data.nomor_telepon ?? '',
          tempat_lahir: data.tempat_lahir ?? '',
          tanggal_lahir: data.tanggal_lahir ?? '',
          jenis_kelamin: data.jenis_kelamin ?? '',
          alamat: data.alamat ?? '',
          status_perkawinan: data.status_perkawinan ?? '',
          tanggal_masuk: data.tanggal_masuk ?? '',
          jam_kerja_masuk: data.jam_kerja_masuk ?? '',
          jam_kerja_pulang: data.jam_kerja_pulang ?? '',

          kategori_gaji: data.kategori_gaji ?? '',
          periode_gaji: data.periode_gaji ?? 'bulanan',
          tarif_harian: data.tarif_harian ? String(data.tarif_harian) : '',

          departemen_id_saat_ini: data.departemen_id_saat_ini ? String(data.departemen_id_saat_ini) : '',
          jabatan_id_saat_ini: data.jabatan_id_saat_ini ? String(data.jabatan_id_saat_ini) : '',

          status: data.status ?? 'Aktif',
          pin_fingerprint: data.pin_fingerprint ?? '',
          role_karyawan: data.role_karyawan ?? 'staff',
        });
      } catch (e: any) {
        setServerError(e?.message || 'Gagal memuat data karyawan');
      } finally {
        setIsLoading(false);
      }
    };

    loadMaster().finally(loadEmployee);
  }, [API_BASE_URL, id, tokenHeaders]);

  const handleChange =
    (name: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [name]: e.target.value }));
    };

  const handleSelect =
    (name: keyof FormState) =>
    (value: string) => {
      setForm((prev) => ({ ...prev, [name]: value }));
    };

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!form.nik.trim()) errors.push('NIK wajib diisi');
    if (!form.nama_lengkap.trim()) errors.push('Nama lengkap wajib diisi');
    if (!form.email.trim()) errors.push('Email wajib diisi');
    if (!form.departemen_id_saat_ini) errors.push('Departemen wajib dipilih');
    if (!form.jabatan_id_saat_ini) errors.push('Jabatan wajib dipilih');
    if (!form.kategori_gaji) errors.push('Kategori gaji wajib dipilih');
    if (form.kategori_gaji === 'Harian' && (!form.tarif_harian || Number(form.tarif_harian) <= 0)) {
      errors.push('Tarif harian wajib diisi dan > 0 untuk kategori Harian');
    }
    if (form.tanggal_lahir && isNaN(Date.parse(form.tanggal_lahir))) errors.push('Tanggal lahir tidak valid');
    if (form.tanggal_masuk && isNaN(Date.parse(form.tanggal_masuk))) errors.push('Tanggal masuk tidak valid');
    return errors;
    // kolom2 disesuaikan dengan struktur tabel Anda【turn9file0†absen (3).sql†L10-L22】
  };

  const saveEmployee = async () => {
    const errs = validate();
    if (errs.length) {
      toast({ title: 'Validasi gagal', description: errs.join(' • '), variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      setServerError(null);

      // siapkan payload sesuai backend
      const payload: any = {
        nik: form.nik,
        nama_lengkap: form.nama_lengkap,
        email: form.email,
        nomor_telepon: form.nomor_telepon || null,
        tempat_lahir: form.tempat_lahir || null,
        tanggal_lahir: form.tanggal_lahir || null,
        jenis_kelamin: form.jenis_kelamin || null,
        alamat: form.alamat || null,
        status_perkawinan: form.status_perkawinan || null,
        tanggal_masuk: form.tanggal_masuk || null,
        jam_kerja_masuk: form.jam_kerja_masuk || null,
        jam_kerja_pulang: form.jam_kerja_pulang || null,

        kategori_gaji: form.kategori_gaji,
        periode_gaji: form.periode_gaji,
        tarif_harian: form.kategori_gaji === 'Harian' ? Number(form.tarif_harian) : null,

        departemen_id_saat_ini: Number(form.departemen_id_saat_ini),
        jabatan_id_saat_ini: Number(form.jabatan_id_saat_ini),

        status: form.status,
        pin_fingerprint: form.pin_fingerprint || null,
        role_karyawan: form.role_karyawan,
      };

      const res = await fetch(`${API_BASE_URL}/karyawan/${id}`, {
        method: 'PUT', // ganti ke PATCH/POST jika API Anda berbeda
        headers: tokenHeaders,
        body: JSON.stringify(payload),
      });

      if (res.status === 422) {
        const err = await res.json();
        const msg =
          typeof err?.message === 'string'
            ? err.message
            : Object.values(err?.errors || {}).flat().join(' • ');
        throw new Error(msg || 'Validasi server gagal (422)');
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Gagal menyimpan (${res.status}). ${txt}`);
      }

      toast({ title: 'Tersimpan', description: 'Data karyawan berhasil diperbarui' });
      router.push('/karyawan');
    } catch (e: any) {
      setServerError(e?.message || 'Gagal menyimpan perubahan');
      toast({ title: 'Error', description: e?.message || 'Gagal menyimpan', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Karyawan', href: '/karyawan' },
    { label: 'Edit' },
  ];

  return (
    <ProtectedRoute permission="manage-employee">
      <DashboardLayout>
        <PageHeader
          title="Edit Karyawan"
          description="Perbarui data karyawan"
          breadcrumbs={breadcrumbs}
          showBackButton
        />

        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Form Karyawan</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Identitas */}
                <section className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nik">NIK</Label>
                    <Input id="nik" value={form.nik} onChange={handleChange('nik')} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input id="nama" value={form.nama_lengkap} onChange={handleChange('nama_lengkap')} />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={handleChange('email')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomor Telepon</Label>
                    <Input value={form.nomor_telepon} onChange={handleChange('nomor_telepon')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={handleSelect('status')}>
                      <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Resign">Resign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section>

                {/* Demografis */}
                <section className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tempat Lahir</Label>
                    <Input value={form.tempat_lahir} onChange={handleChange('tempat_lahir')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Lahir</Label>
                    <Input type="date" value={form.tanggal_lahir} onChange={handleChange('tanggal_lahir')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jenis Kelamin</Label>
                    <Select value={form.jenis_kelamin} onValueChange={handleSelect('jenis_kelamin')}>
                      <SelectTrigger><SelectValue placeholder="Pilih gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Alamat</Label>
                    <Textarea rows={3} value={form.alamat} onChange={handleChange('alamat')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status Perkawinan</Label>
                    <Select value={form.status_perkawinan} onValueChange={handleSelect('status_perkawinan')}>
                      <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                        <SelectItem value="Menikah">Menikah</SelectItem>
                        <SelectItem value="Cerai">Cerai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section>

                {/* Pekerjaan */}
                <section className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Masuk</Label>
                    <Input type="date" value={form.tanggal_masuk} onChange={handleChange('tanggal_masuk')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jam Kerja Masuk</Label>
                    <Input type="time" value={form.jam_kerja_masuk} onChange={handleChange('jam_kerja_masuk')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jam Kerja Pulang</Label>
                    <Input type="time" value={form.jam_kerja_pulang} onChange={handleChange('jam_kerja_pulang')} />
                  </div>

                  <div className="space-y-2">
                    <Label>Departemen</Label>
                    <Select value={form.departemen_id_saat_ini} onValueChange={handleSelect('departemen_id_saat_ini')}>
                      <SelectTrigger><SelectValue placeholder="Pilih departemen" /></SelectTrigger>
                      <SelectContent>
                        {departemen.map((d) => (
                          <SelectItem key={d.departemen_id} value={String(d.departemen_id)}>
                            {d.nama_departemen}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Jabatan</Label>
                    <Select value={form.jabatan_id_saat_ini} onValueChange={handleSelect('jabatan_id_saat_ini')}>
                      <SelectTrigger><SelectValue placeholder="Pilih jabatan" /></SelectTrigger>
                      <SelectContent>
                        {jabatan.map((j) => (
                          <SelectItem key={j.jabatan_id} value={String(j.jabatan_id)}>
                            {j.nama_jabatan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Role Karyawan</Label>
                    <Select value={form.role_karyawan} onValueChange={handleSelect('role_karyawan')}>
                      <SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="produksi">Produksi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section>

                {/* Penggajian */}
                <section className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Kategori Gaji</Label>
                    <Select value={form.kategori_gaji} onValueChange={handleSelect('kategori_gaji')}>
                      <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bulanan">Bulanan</SelectItem>
                        <SelectItem value="Harian">Harian</SelectItem>
                        <SelectItem value="Borongan">Borongan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Periode Gaji</Label>
                    <Select value={form.periode_gaji} onValueChange={handleSelect('periode_gaji')}>
                      <SelectTrigger><SelectValue placeholder="Pilih periode" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bulanan">Bulanan</SelectItem>
                        <SelectItem value="mingguan">Mingguan</SelectItem>
                        <SelectItem value="harian">Harian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.kategori_gaji === 'Harian' && (
                    <div className="space-y-2">
                      <Label>Tarif Harian (Rp)</Label>
                      <Input
                        inputMode="numeric"
                        value={form.tarif_harian}
                        onChange={handleChange('tarif_harian')}
                        placeholder="cth: 150000"
                      />
                    </div>
                  )}
                </section>

                {/* Lainnya */}
                <section className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>PIN Fingerprint</Label>
                    <Input value={form.pin_fingerprint} onChange={handleChange('pin_fingerprint')} />
                  </div>
                </section>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                  <Button onClick={saveEmployee} disabled={saving}>
                    {saving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
}