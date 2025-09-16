export interface Departemen {
  departemen_id: number;
  nama_departemen: string;
  menggunakan_shift: boolean;
  karyawan_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Jabatan {
  jabatan_id: number;
  nama_jabatan: string;
  karyawan_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  shift_id: number;
  kode_shift: string;
  jam_masuk?: string;
  jam_pulang?: string;
  hari_berikutnya: boolean;
  created_at: string;
  updated_at: string;
}