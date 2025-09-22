// src/types/auth.ts
import { Departemen, Jabatan } from './master-data';

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

export type Permission = 
  | 'view-any-karyawan'
  | 'view-karyawan'
  | 'create-karyawan'
  | 'update-karyawan'
  | 'delete-karyawan'
  | 'manage-master-data'
  | 'view-master-data'
  | 'process-payroll'
  | 'approve-payroll'
  | 'view-any-slip'
  | 'view-own-slip';