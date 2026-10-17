'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { AdminUserDto } from '@doctor-tracker/shared';

interface RolePermissionDto {
  role: string;
  canViewDashboard: boolean;
  canManageDoctors: boolean;
  canManagePatients: boolean;
  canManageUsers: boolean;
  canDeleteRecords: boolean;
}

export function usePermissions() {
  const { data: user, isLoading: loadingUser } = useQuery<AdminUserDto>({
    queryKey: ['auth-me'],
    queryFn: () => apiFetch<AdminUserDto>('/auth/me'),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const { data: permissionsMatrix = [], isLoading: loadingPerms } = useQuery<RolePermissionDto[]>({
    queryKey: ['permissions'],
    queryFn: () => apiFetch<RolePermissionDto[]>('/permissions'),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const role = user?.role || 'viewer';
  const isAdmin = role === 'admin';

  const rolePerms = permissionsMatrix.find(p => p.role === role) || {
    role,
    canViewDashboard: true,
    canManageDoctors: isAdmin || role === 'manager' || role === 'staff',
    canManagePatients: isAdmin || role === 'manager' || role === 'staff',
    canManageUsers: isAdmin,
    canDeleteRecords: isAdmin || role === 'manager',
  };

  const can = (action: string): boolean => {
    // Fail closed while loading
    if (loadingUser || loadingPerms) return false;
    if (isAdmin) return true;

    switch (action) {
      case 'doctors.read':
      case 'patients.read':
      case 'dashboard.read':
        return rolePerms.canViewDashboard;
      case 'doctors.create':
      case 'doctors.update':
        return rolePerms.canManageDoctors;
      case 'doctors.delete':
        return rolePerms.canManageDoctors && rolePerms.canDeleteRecords;
      case 'patients.create':
      case 'patients.update':
        return rolePerms.canManagePatients;
      case 'patients.delete':
        return rolePerms.canManagePatients && rolePerms.canDeleteRecords;
      case 'users.manage':
      case 'permissions.manage':
        return rolePerms.canManageUsers;
      default:
        return false;
    }
  };

  return {
    user,
    role,
    isAdmin,
    can,
    isLoading: loadingUser || loadingPerms,
  };
}
