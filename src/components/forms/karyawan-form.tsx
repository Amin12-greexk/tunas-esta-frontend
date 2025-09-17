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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building2,
  Briefcase,
  CreditCard,
  Clock,
  Save,
  X
} from 'lucide-react';
import { Departemen, Jabatan } from '@/types/master-data';
import { Karyawan } from '@/types/karyawan';

interface KaryawanFormProps {
  karyawan?: Karyawan;
  mode: 'create' | 'edit';
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
      jenis_kelamin: karyawan?.jenis_kelamin || 'Laki-laki',
      alamat: karyawan?.alamat || '',
      status_perkawinan: karyawan?.status_perkawinan || 'Belum Menikah',
      nomor_telepon: karyawan?.nomor_telepon || '',
      email: karyawan?.email || '',
      tanggal_masuk: karyawan?.tanggal_masuk || '',
      kategori_gaji: karyawan?.kategori_gaji || 'Bulanan',
      departemen_id_saat_ini: karyawan?.departemen_id_saat_ini || 0,
      jabatan_id_saat_ini: karyawan?.jabatan_id_saat_ini || 0,
      role_karyawan: karyawan?.role_karyawan || 'produksi',
      jam_kerja_masuk: karyawan?.jam_kerja_masuk || '08:00',
      jam_kerja_pulang: karyawan?.jam_kerja_pulang || '17:00',
    },
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      // Load departemen and jabatan
      // const [depResponse, jabResponse] = await Promise.all([
      //   apiClient.getDepartemen(),
      //   apiClient.getJabatan(),
      // ]);
      // setDepartemenList(depResponse.data);
      // setJabatanList(jabResponse.data);

      // Mock data for now
      setDepartemenList([
        { departemen_id: 1, nama_departemen: 'Produksi', menggunakan_shift: true, created_at: '', updated_at: '' },
        { departemen_id: 2, nama_departemen: 'Human Resources', menggunakan_shift: false, created_at: '', updated_at: '' },
        { departemen_id: 3, nama_departemen: 'Finance', menggunakan_shift: false, created_at: '', updated_at: '' },
      ]);
      setJabatanList([
        { jabatan_id: 1, nama_jabatan: 'Operator', created_at: '', updated_at: '' },
        { jabatan_id: 2, nama_jabatan: 'Manager', created_at: '', updated_at: '' },
        { jabatan_id: 3, nama_jabatan: 'Staff', created_at: '', updated_at: '' },
      ]);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const onSubmit = async (data: KaryawanFormData) => {
    try {
      setIsLoading(true);
      
      if (mode === 'create') {
        // await apiClient.createKaryawan(data);
        toast({
          title: 'Berhasil',
          description: 'Karyawan berhasil ditambahkan',
        });
      } else {
        // await apiClient.updateKaryawan(karyawan!.karyawan_id, data);
        toast({
          title: 'Berhasil',
          description: 'Data karyawan berhasil diperbarui',
        });
      }
      
      router.push('/karyawan');
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast({
        title: 'Error',
        description: errorMessage,
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

          {/* Personal Data Tab */}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          {/* Employment Tab */}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih departemen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departemenList.map((dept) => (
                              <SelectItem key={dept.departemen_id} value={dept.departemen_id.toString()}>
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
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jabatan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {jabatanList.map((jab) => (
                              <SelectItem key={jab.jabatan_id} value={jab.jabatan_id.toString()}>
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

          {/* Payroll Tab */}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        {/* Action Buttons */}
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