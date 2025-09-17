// src/types/auth.ts
export interface User {
  karyawan_id: number;
  nik: string;
  nama_lengkap: string;
  email: string;
  role: 'it_dev' | 'hr' | 'direktur' | 'karyawan';
  departemen_id_saat_ini: number;
  jabatan_id_saat_ini: number;
  departemenSaatIni?: Departemen;
  jabatanSaatIni?: Jabatan;
  pin_fingerprint?: string;
  role_karyawan: 'produksi' | 'staff';
  status: 'Aktif' | 'Resign';
  // Tambahan
  nomor_telepon?: string;
  alamat?: string;

}

export interface LoginCredentials {
  nik: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}