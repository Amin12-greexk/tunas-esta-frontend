// src/types/permission.ts (remove duplicate file permission.ts)
import { User } from './auth';

export interface MenuConfig {
  label: string;
  href: string;
  icon: string;
  permission?: Permissions;
  roles?: User['role'][];
  children?: MenuConfig[];
}

export interface RolePermissions {
  [key: string]: Permissions[];
}