export interface Karyawan {
  karyawan_id: number;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  alamat: string;
  status_perkawinan: 'Belum Menikah' | 'Menikah' | 'Cerai';
  nomor_telepon: string;
  email: string;
  role: 'it_dev' | 'hr' | 'direktur' | 'karyawan';
  tanggal_masuk: string;
  kategori_gaji: 'Bulanan' | 'Harian' | 'Borongan';
  periode_gaji: 'mingguan' | 'bulanan' | 'harian';
  jam_kerja_masuk?: string;
  jam_kerja_pulang?: string;
  status: 'Aktif' | 'Resign';
  departemen_id_saat_ini: number;
  jabatan_id_saat_ini: number;
  pin_fingerprint?: string;
  role_karyawan: 'produksi' | 'staff';
  departemenSaatIni?: Departemen;
  jabatanSaatIni?: Jabatan;
  created_at: string;
  updated_at: string;
}

export interface CreateKaryawanData {
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  alamat: string;
  status_perkawinan: 'Belum Menikah' | 'Menikah' | 'Cerai';
  nomor_telepon: string;
  email: string;
  tanggal_masuk: string;
  kategori_gaji: 'Bulanan' | 'Harian' | 'Borongan';
  departemen_id_saat_ini: number;
  jabatan_id_saat_ini: number;
  role_karyawan: 'produksi' | 'staff';
}