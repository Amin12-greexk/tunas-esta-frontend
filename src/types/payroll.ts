// src/types/payroll.ts
import { Karyawan } from './karyawan';

export interface RiwayatGaji {
  gaji_id: number;
  karyawan_id: number;
  periode: string;
  periode_label?: string;
  tipe_periode: 'harian' | 'mingguan' | 'bulanan';
  periode_mulai: string;
  periode_selesai: string;
  gaji_final?: number;
  tanggal_pembayaran?: string;
  status?: 'draft' | 'approved' | 'paid' | 'cancelled';
  karyawan?: Karyawan;
  detailGaji?: DetailGaji[];
  created_at: string;
  updated_at: string;
}

export interface DetailGaji {
  detail_gaji_id: number;
  gaji_id: number;
  jenis_komponen: 'Pendapatan' | 'Potongan';
  deskripsi: string;
  jumlah: number;
  created_at: string;
  updated_at: string;
}

export interface SettingGaji {
  setting_id: number;
  premi_produksi: number;
  premi_staff: number;
  uang_makan_produksi_weekday: number;
  uang_makan_produksi_weekend_5_10: number;
  uang_makan_produksi_weekend_10_20: number;
  uang_makan_staff_weekday: number;
  uang_makan_staff_weekend_5_10: number;
  uang_makan_staff_weekend_10_20: number;
  tarif_lembur_produksi_per_jam: number;
  tarif_lembur_staff_per_jam: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}