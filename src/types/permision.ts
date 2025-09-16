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

export interface MenuConfig {
  label: string;
  href: string;
  icon: string;
  permission?: Permission;
  roles?: User['role'][];
  children?: MenuConfig[];
}

export interface RolePermissions {
  [key: string]: Permission[];
}