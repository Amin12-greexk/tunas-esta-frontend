// src/lib/constants.ts
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Tunas Esta Indonesia',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api',
};

export const ROLES = {
  IT_DEV: 'it_dev' as const,
  HR: 'hr' as const,
  DIREKTUR: 'direktur' as const,
  KARYAWAN: 'karyawan' as const,
};

export const ATTENDANCE_STATUS = {
  HADIR: 'Hadir' as const,
  TERLAMBAT: 'Terlambat' as const,
  IZIN: 'Izin' as const,
  CUTI: 'Cuti' as const,
  ALPHA: 'Alpha' as const,
  LIBUR: 'Libur' as const,
};

export const JENIS_HARI = {
  WEEKDAY: 'weekday' as const,
  WEEKEND: 'weekend' as const,
  TANGGAL_MERAH: 'tanggal_merah' as const,
};

export const KATEGORI_GAJI = {
  BULANAN: 'Bulanan' as const,
  HARIAN: 'Harian' as const,
  BORONGAN: 'Borongan' as const,
};

export const STATUS_KARYAWAN = {
  AKTIF: 'Aktif' as const,
  RESIGN: 'Resign' as const,
};