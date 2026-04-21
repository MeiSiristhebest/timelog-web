"use client";

import { useMemo } from 'react';
import { UserRole, hasPermission, hasRoleLevel } from '@/lib/permissions';
import { useAuth } from '@/contexts/auth-context';

export function usePermissions() {
  const { userRole } = useAuth();

  return useMemo(() => ({
    userRole,
    hasPermission: (permission: string) =>
      hasPermission(userRole, permission as any) ?? false,
    hasRoleLevel: (minRole: UserRole) => hasRoleLevel(userRole, minRole),
    isRole: (targetRole: UserRole) => userRole === targetRole,
  }), [userRole]);
}