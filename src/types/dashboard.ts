export interface DashboardStats {
  total_karyawan: number;
  karyawan_aktif: number;
  hadir_hari_ini: number;
  total_departemen: number;
  recent_activities: Activity[];
}

export interface Activity {
  id: string;
  type: 'attendance' | 'payroll' | 'employee' | 'system';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  icon?: string;
}