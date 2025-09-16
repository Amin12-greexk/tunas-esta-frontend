// src/lib/permissions.ts
import { Permission, User } from '@/types/auth';

export const PERMISSIONS: Record<string, Permission> = {
  VIEW_ANY_KARYAWAN: 'view-any-karyawan',
  VIEW_KARYAWAN: 'view-karyawan',
  CREATE_KARYAWAN: 'create-karyawan',
  UPDATE_KARYAWAN: 'update-karyawan',
  DELETE_KARYAWAN: 'delete-karyawan',
  MANAGE_MASTER_DATA: 'manage-master-data',
  VIEW_MASTER_DATA: 'view-master-data',
  PROCESS_PAYROLL: 'process-payroll',
  APPROVE_PAYROLL: 'approve-payroll',
  VIEW_ANY_SLIP: 'view-any-slip',
  VIEW_OWN_SLIP: 'view-own-slip',
};

export const ROLE_PERMISSIONS: Record<User['role'], Permission[]> = {
  it_dev: Object.values(PERMISSIONS), // All permissions
  hr: [
    PERMISSIONS.VIEW_ANY_KARYAWAN,
    PERMISSIONS.CREATE_KARYAWAN,
    PERMISSIONS.UPDATE_KARYAWAN,
    PERMISSIONS.DELETE_KARYAWAN,
    PERMISSIONS.MANAGE_MASTER_DATA,
    PERMISSIONS.VIEW_MASTER_DATA,
    PERMISSIONS.PROCESS_PAYROLL,
    PERMISSIONS.VIEW_ANY_SLIP,
  ],
  direktur: [
    PERMISSIONS.VIEW_ANY_KARYAWAN,
    PERMISSIONS.VIEW_MASTER_DATA,
    PERMISSIONS.APPROVE_PAYROLL,
    PERMISSIONS.VIEW_ANY_SLIP,
  ],
  karyawan: [
    PERMISSIONS.VIEW_OWN_SLIP,
  ],
};

export const hasPermission = (userRole: User['role'], permission: Permission): boolean => {
  if (userRole === 'it_dev') return true;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const hasAnyRole = (userRole: User['role'], roles: User['role'][]): boolean => {
  return roles.includes(userRole);
};