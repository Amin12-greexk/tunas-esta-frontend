// src/lib/api.ts - Fixed version with proper typing
import axios, { AxiosError, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


interface LoginCredentials {
  nik: string;
  password: string;
}

interface KaryawanData {
  nik: string;
  nama_lengkap: string;
  email: string;
 
}

interface DepartemenData {
  nama_departemen: string;
  menggunakan_shift: boolean;
}

interface JabatanData {
  nama_jabatan: string;
}

interface ShiftData {
  kode_shift: string;
  jam_masuk: string | null;
  jam_pulang: string | null;
  hari_berikutnya: boolean;
}

interface AbsensiParams {
  karyawan_id?: string | number;
  start_date?: string;
  end_date?: string;
  status?: string;
  departemen?: string;
  q?: string;
  limit?: number;                               // jika backend pakai 'limit'
  page?: number;                                // halaman
  per_page?: number;                            // kalau backend pakai paginate 'per_page'
  sort?: 'created_at' | 'updated_at' | string;  // kunci sort
  order?: 'asc' | 'desc';                       // arah sort
}

interface PayrollData {
  karyawan_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  tipe_periode: string;
}

interface SettingGajiData {
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
}


export const apiClient = {
  // Auth
  login: (credentials: LoginCredentials) => 
    api.post('/login', credentials),
  
  logout: () => 
    api.post('/logout'),
  
  getCurrentUser: () => 
    api.get('/user'),

  // Karyawan
  getKaryawan: () => 
    api.get('/karyawan'),
  
  getKaryawanById: (id: number) => 
    api.get(`/karyawan/${id}`),
  
  createKaryawan: (data: KaryawanData) => 
    api.post('/karyawan', data),
  
  updateKaryawan: (id: number, data: Partial<KaryawanData>) => 
    api.put(`/karyawan/${id}`, data),
  
  deleteKaryawan: (id: number) => 
    api.delete(`/karyawan/${id}`),

  // Master Data
  getDepartemen: () => 
    api.get('/departemen'),
  
  createDepartemen: (data: DepartemenData) => 
    api.post('/departemen', data),
  
  updateDepartemen: (id: number, data: DepartemenData) => 
    api.put(`/departemen/${id}`, data),
  
  deleteDepartemen: (id: number) => 
    api.delete(`/departemen/${id}`),

  getJabatan: () => 
    api.get('/jabatan'),
  
  createJabatan: (data: JabatanData) => 
    api.post('/jabatan', data),
  
  updateJabatan: (id: number, data: JabatanData) => 
    api.put(`/jabatan/${id}`, data),
  
  deleteJabatan: (id: number) => 
    api.delete(`/jabatan/${id}`),

  getShift: () => 
    api.get('/shift'),
  
  createShift: (data: ShiftData) => 
    api.post('/shift', data),
  
  updateShift: (id: number, data: ShiftData) => 
    api.put(`/shift/${id}`, data),
  
  deleteShift: (id: number) => 
    api.delete(`/shift/${id}`),

  // Absensi
  getAbsensi: (params?: AbsensiParams) => 
    api.get('/absensi', { params }),
  
  getAbsensiByKaryawan: (karyawanId: number, params?: AbsensiParams) => 
    api.get(`/absensi/karyawan/${karyawanId}`, { params }),

  updateAbsensi: (id: number, data: Record<string, unknown>) => 
    api.put(`/absensi/${id}`, data),

  getAbsensiSummary: (periode: string) => 
    api.get(`/absensi/summary/${periode}`),

  // Fingerprint
  processLogs: () => 
    api.post('/fingerprint/process-logs'),
  
  getAttendanceLogs: (params?: Record<string, string | number>) => 
    api.get('/fingerprint/logs', { params }),
  
  setPinFingerprint: (data: { karyawan_id: number; pin: string }) => 
    api.post('/fingerprint/set-pin', data),

  // Payroll
  generatePayroll: (data: PayrollData) => 
    api.post('/payroll/generate', data),
  
  bulkGeneratePayroll: (data: { periode: string; karyawan_ids: number[] }) => 
    api.post('/payroll/bulk-generate', data),
  
  getAllPayrolls: (params?: Record<string, string | number>) => 
    api.get('/payroll/all', { params }),
  
  getPayrollHistory: (karyawanId: number) => 
    api.get(`/payroll/history/${karyawanId}`),
  
  getSlipGaji: (gaji_id: number) => 
    api.get(`/payroll/slip/${gaji_id}`),

  // Setting Gaji
  getSettingGaji: () => 
    api.get('/setting-gaji'),
  
  getActiveSettingGaji: () => 
    api.get('/setting-gaji/active'),
  
  createSettingGaji: (data: SettingGajiData) => 
    api.post('/setting-gaji', data),
  
  updateSettingGaji: (id: number, data: SettingGajiData) => 
    api.put(`/setting-gaji/${id}`, data),
  
  activateSettingGaji: (id: number) => 
    api.post(`/setting-gaji/${id}/activate`),

  // Gaji Tambahan
  calculateGajiTambahan: (data: Record<string, unknown>) => 
    api.post('/gaji-tambahan/calculate', data),
  
  getGajiTambahanPeriode: (karyawanId: number, periode: string) => 
    api.get(`/gaji-tambahan/periode/${karyawanId}/${periode}`),
  
  recalculateGajiTambahan: (data: { periode: string }) => 
    api.post('/gaji-tambahan/recalculate-all', data),

  // Fingerspot Integration
  syncAllUsers: () => 
    api.post('/fingerspot/sync-all-users'),
  
  importAttendance: (data: { start_date: string; end_date: string }) => 
    api.post('/fingerspot/import-attendance', data),
  
  getDeviceStatus: () => 
    api.get('/fingerspot/status'),

  // Testing
  createSampleAttendance: (data: Record<string, unknown>) => 
    api.post('/testing/create-sample-attendance', data),
  
  generateMonthData: (karyawanId: number, periode: string) => 
    api.post(`/testing/generate-month-data/${karyawanId}/${periode}`),
  
  clearTestData: () => 
    api.delete('/testing/clear-test-data'),
};

// Error handler helper
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const data = error.response.data as ApiResponse;
    return data.message || 'Terjadi kesalahan';
  }
  return error.message || 'Terjadi kesalahan jaringan';
};

// src/lib/utils.ts - Fixed version
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse, parseISO, isValid } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Define a union type for date input
type DateInput = string | Date | null | undefined;

function parseDateLike(input: DateInput): Date | null {
  if (input instanceof Date) return isValid(input) ? input : null;
  if (!input) return null;

  const s = String(input).trim();
  // ISO format
  if (s.includes("T")) {
    const dIso = parseISO(s.replace(" ", "T"));
    if (isValid(dIso)) return dIso;
  }

  // "YYYY-MM-DD HH:mm[:ss]"
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const withT = s.replace(" ", "T");
    const normalized = withT.length === 16 ? withT + ":00" : withT;
    const d = parseISO(normalized);
    if (isValid(d)) return d;

    const d2 = parse(s, "yyyy-MM-dd HH:mm:ss", new Date());
    if (isValid(d2)) return d2;
  }

  // Time only "HH:mm" / "HH:mm:ss"
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    const fmt = s.length <= 5 ? "HH:mm" : "HH:mm:ss";
    const d = parse(s, fmt, new Date());
    if (isValid(d)) return d;
  }

  // Date only "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = parse(s, "yyyy-MM-dd", new Date());
    if (isValid(d)) return d;
  }

  try {
    const d = parseISO(s);
    if (isValid(d)) return d;
  } catch {
    // Ignore parsing errors
  }

  return null;
}

export function formatDate(
  date: DateInput,
  formatStr: string = "dd MMMM yyyy"
): string {
  const d = parseDateLike(date);
  if (!d) return "-";
  return format(d, formatStr, { locale: localeId });
}

export function formatTime(
  time?: DateInput,
  withSeconds = false
): string {
  if (!time) return "-";
  const d = parseDateLike(time);
  if (!d) return "-";
  return format(d, withSeconds ? "HH:mm:ss" : "HH:mm");
}

export function formatDateTime(datetime: DateInput): string {
  const d = parseDateLike(datetime);
  if (!d) return "-";
  return format(d, "dd MMM yyyy, HH:mm", { locale: localeId });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Hadir:
      "bg-tunas-green-100 text-tunas-green-800 dark:bg-tunas-green-900 dark:text-tunas-green-200",
    Terlambat:
      "bg-tunas-yellow-100 text-tunas-yellow-800 dark:bg-tunas-yellow-900 dark:text-tunas-yellow-200",
    Izin:
      "bg-tunas-blue-100 text-tunas-blue-800 dark:bg-tunas-blue-900 dark:text-tunas-blue-200",
    Cuti:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Alpha: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Libur: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    Aktif:
      "bg-tunas-green-100 text-tunas-green-800 dark:bg-tunas-green-900 dark:text-tunas-green-200",
    Resign: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    colors[status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  );
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}