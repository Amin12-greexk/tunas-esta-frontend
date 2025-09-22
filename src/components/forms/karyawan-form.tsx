// src/components/forms/karyawan-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { karyawanSchema, type KaryawanFormData } from '@/lib/validation';
import { apiClient, handleApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { toast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';
import { Departemen, Jabatan } from '@/types/master-data';
import { Karyawan } from '@/types/karyawan';

interface KaryawanFormProps {
  karyawan?: Karyawan;       // untuk mode edit, kirim data awal dari page
  mode: 'create' | 'edit';
}

function toHHmmss(v?: string) {
  if (!v) return null;
  // input time HTML → "HH:mm", backend (umumnya) "HH:mm:ss"
  return v.length === 5 ? `${v}:00` : v;
}

export function KaryawanForm({ karyawan, mode }: KaryawanFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [departemenList, setDepartemenList] = useState<Departemen[]>([]);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);

  const form = useForm<KaryawanFormData>({
    resolver: zodResolver(karyawanSchema),
    defaultValues: {
      nik: karyawan?.nik || '',
      nama_lengkap: karyawan?.nama_lengkap || '',
      tempat_lahir: karyawan?.tempat_lahir || '',
      tanggal_lahir: karyawan?.tanggal_lahir || '',
      jenis_kelamin: (karyawan?.jenis_kelamin as any) || 'Laki-laki',
      alamat: karyawan?.alamat || '',
      status_perkawinan: (karyawan?.status_perkawinan as any) || 'Belum Menikah',
      nomor_telepon: karyawan?.nomor_telepon || '',
      email: karyawan?.email || '',
      tanggal_masuk: karyawan?.tanggal_masuk || '',
      // Removed status field
      kategori_gaji: (karyawan?.kategori_gaji as any) || 'Bulanan',
      departemen_id_saat_ini: karyawan?.departemen_id_saat_ini || 0,
      jabatan_id_saat_ini: karyawan?.jabatan_id_saat_ini || 0,
      role_karyawan: (karyawan?.role_karyawan as any) || 'produksi',
      jam_kerja_masuk: (karyawan?.jam_kerja_masuk || '08:00').slice(0, 5),
      jam_kerja_pulang: (karyawan?.jam_kerja_pulang || '17:00').slice(0, 5),
    },
  });

  // Jika prop karyawan berubah (mis. setelah fetch di page edit), sync ke form
  useEffect(() => {
    if (!karyawan) return;
    form.reset({
      nik: karyawan.nik || '',
      nama_lengkap: karyawan.nama_lengkap || '',
      tempat_lahir: karyawan.tempat_lahir || '',
      tanggal_lahir: karyawan.tanggal_lahir || '',
      jenis_kelamin: (karyawan.jenis_kelamin as any) || 'Laki-laki',
      alamat: karyawan.alamat || '',
      status_perkawinan: (karyawan.status_perkawinan as any) || 'Belum Menikah',
      nomor_telepon: karyawan.nomor_telepon || '',
      email: karyawan.email || '',
      tanggal_masuk: karyawan.tanggal_masuk || '',
      // Removed status field
      kategori_gaji: (karyawan.kategori_gaji as any) || 'Bulanan',
      departemen_id_saat_ini: karyawan.departemen_id_saat_ini || 0,
      jabatan_id_saat_ini: karyawan.jabatan_id_saat_ini || 0,
      role_karyawan: (karyawan.role_karyawan as any) || 'produksi',
      jam_kerja_masuk: (karyawan.jam_kerja_masuk || '08:00').slice(0, 5),
      jam_kerja_pulang: (karyawan.jam_kerja_pulang || '17:00').slice(0, 5),
    });
  }, [karyawan]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [depResponse, jabResponse] = await Promise.all([
        apiClient.getDepartemen(),
        apiClient.getJabatan(),
      ]);
      setDepartemenList(Array.isArray(depResponse.data) ? depResponse.data : []);
      setJabatanList(Array.isArray(jabResponse.data) ? jabResponse.data : []);
    } catch (error) {
      toast({
        title: 'Gagal memuat master data',
        description: handleApiError(error) || 'Periksa koneksi dan izin akses Anda.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: KaryawanFormData) => {
    try {
      setIsLoading(true);

      // Siapkan payload sesuai backend (jam ke HH:mm:ss, string kosong jadi null)
      const payload = {
        ...data,
        email: data.email?.trim() || null,
        nomor_telepon: data.nomor_telepon?.trim() || null,
        tanggal_lahir: data.tanggal_lahir || null,
        tanggal_masuk: data.tanggal_masuk || null,
        departemen_id_saat_ini: data.departemen_id_saat_ini || null,
        jabatan_id_saat_ini: data.jabatan_id_saat_ini || null,
        jam_kerja_masuk: toHHmmss(data.jam_kerja_masuk),
        jam_kerja_pulang: toHHmmss(data.jam_kerja_pulang),
        // Add status field in payload if needed by backend
        status: 'Aktif', // or get from karyawan?.status if editing
      };

      if (mode === 'create') {
        await apiClient.createKaryawan(payload);
        toast({ title: 'Berhasil', description: 'Karyawan berhasil ditambahkan' });
      } else if (mode === 'edit' && karyawan?.karyawan_id) {
        await apiClient.updateKaryawan(karyawan.karyawan_id, payload);
        toast({ title: 'Berhasil', description: 'Data karyawan berhasil diperbarui' });
      } else {
        throw new Error('Mode edit membutuhkan karyawan_id');
      }

      router.push('/karyawan');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: handleApiError(error) || 'Gagal menyimpan karyawan',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Data Pribadi</TabsTrigger>
            <TabsTrigger value="employment">Kepegawaian</TabsTrigger>
            <TabsTrigger value="payroll">Penggajian</TabsTrigger>
          </TabsList>

          {/* Personal Data */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pribadi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Masukkan NIK" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nama_lengkap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Masukkan nama lengkap" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tempat_lahir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempat Lahir</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Masukkan tempat lahir" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tanggal_lahir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Lahir</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jenis_kelamin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Kelamin</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis kelamin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status_perkawinan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status Perkawinan</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                            <SelectItem value="Menikah">Menikah</SelectItem>
                            <SelectItem value="Cerai">Cerai</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nomor_telepon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="08123456789" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="alamat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Masukkan alamat lengkap" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employment */}
          <TabsContent value="employment">
            <Card>
              <CardHeader>
                <CardTitle>Data Kepegawaian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="tanggal_masuk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Masuk</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role_karyawan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Karyawan</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="produksi">Produksi</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="departemen_id_saat_ini"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departemen</FormLabel>
                        <Select
                          value={String(field.value || '')}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih departemen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departemenList.map((dept) => (
                              <SelectItem key={dept.departemen_id} value={String(dept.departemen_id)}>
                                {dept.nama_departemen}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jabatan_id_saat_ini"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jabatan</FormLabel>
                        <Select
                          value={String(field.value || '')}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jabatan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {jabatanList.map((jab) => (
                              <SelectItem key={jab.jabatan_id} value={String(jab.jabatan_id)}>
                                {jab.nama_jabatan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jam_kerja_masuk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jam Kerja Masuk</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jam_kerja_pulang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jam Kerja Pulang</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll */}
          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Penggajian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="kategori_gaji"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori Gaji</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori gaji" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bulanan">Bulanan</SelectItem>
                          <SelectItem value="Harian">Harian</SelectItem>
                          <SelectItem value="Borongan">Borongan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Kategori ini akan menentukan perhitungan gaji karyawan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/karyawan')}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Tambah Karyawan' : 'Simpan Perubahan'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}