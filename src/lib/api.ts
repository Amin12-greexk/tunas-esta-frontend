// src/lib/api.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  // Auth
  login: (credentials: { nik: string; password: string }) => 
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
  
  createKaryawan: (data: any) => 
    api.post('/karyawan', data),
  
  updateKaryawan: (id: number, data: any) => 
    api.put(`/karyawan/${id}`, data),
  
  deleteKaryawan: (id: number) => 
    api.delete(`/karyawan/${id}`),

  // Master Data
  getDepartemen: () => 
    api.get('/departemen'),
  
  createDepartemen: (data: any) => 
    api.post('/departemen', data),
  
  updateDepartemen: (id: number, data: any) => 
    api.put(`/departemen/${id}`, data),
  
  deleteDepartemen: (id: number) => 
    api.delete(`/departemen/${id}`),

  getJabatan: () => 
    api.get('/jabatan'),
  
  createJabatan: (data: any) => 
    api.post('/jabatan', data),
  
  updateJabatan: (id: number, data: any) => 
    api.put(`/jabatan/${id}`, data),
  
  deleteJabatan: (id: number) => 
    api.delete(`/jabatan/${id}`),

  getShift: () => 
    api.get('/shift'),
  
  createShift: (data: any) => 
    api.post('/shift', data),
  
  updateShift: (id: number, data: any) => 
    api.put(`/shift/${id}`, data),
  
  deleteShift: (id: number) => 
    api.delete(`/shift/${id}`),

  // Absensi
  getAbsensi: (params?: any) => 
    api.get('/absensi', { params }),
  
  getAbsensiByKaryawan: (karyawanId: number, params?: any) => 
    api.get(`/absensi/karyawan/${karyawanId}`, { params }),

  // Fingerprint
  processLogs: () => 
    api.post('/fingerprint/process-logs'),
  
  getAttendanceLogs: (params?: any) => 
    api.get('/fingerprint/logs', { params }),
  
  setPinFingerprint: (data: { karyawan_id: number; pin: string }) => 
    api.post('/fingerprint/set-pin', data),

  // Payroll
  generatePayroll: (data: { karyawan_id: number; periode: string }) => 
    api.post('/payroll/generate', data),
  
  getPayrollHistory: (karyawanId: number) => 
    api.get(`/payroll/history/${karyawanId}`),
  
  getSlipGaji: (gajiId: number) => 
    api.get(`/payroll/slip/${gajiId}`),

  // Setting Gaji
  getSettingGaji: () => 
    api.get('/setting-gaji'),
  
  getActiveSettingGaji: () => 
    api.get('/setting-gaji/active'),
  
  createSettingGaji: (data: any) => 
    api.post('/setting-gaji', data),
  
  updateSettingGaji: (id: number, data: any) => 
    api.put(`/setting-gaji/${id}`, data),
  
  activateSettingGaji: (id: number) => 
    api.post(`/setting-gaji/${id}/activate`),

  // Gaji Tambahan
  calculateGajiTambahan: (data: any) => 
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
  createSampleAttendance: (data: any) => 
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