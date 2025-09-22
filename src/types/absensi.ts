// src/types/absensi.ts
import { Karyawan } from './karyawan';

export interface Absensi {
  absensi_id: number;
  karyawan_id: number;
  tanggal_absensi: string;
  jam_scan_masuk?: string;
  jam_scan_pulang?: string;
  durasi_lembur_menit: number;
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Cuti' | 'Alpha' | 'Libur';
  jam_lembur: number;
  jenis_hari: 'weekday' | 'weekend' | 'tanggal_merah';
  hadir_6_hari_periode: boolean;
  upah_lembur: number;
  premi: number;
  uang_makan: number;
  total_gaji_tambahan: number;
  karyawan?: Karyawan;
  created_at: string;
  updated_at: string;
}

export interface AttendanceLog {
  log_id: number;
  device_sn: string;
  pin: string;
  scan_time: string;
  verify_mode: number;
  inout_mode: number;
  device_ip: string;
  is_processed: boolean;
  processed_at?: string;
  karyawan?: Karyawan;
  created_at: string;
  updated_at: string;
}