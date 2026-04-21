"use client";

import { useMemo } from 'react';
import { UserRole, hasPermission, hasRoleLevel } from '@/lib/permissions';
import { useAuth } from '@/contexts/auth-context';

export function usePermissions() {
  const { userRole } = useAuth();

  return useMemo(() => ({
    userRole,
    hasPermission: (permission: string) => {
      try {
        return hasPermission(userRole, permission as any);
      } catch (error) {
        console.error('Permission check error:', permission, error);
        return false;
      }
    },
    hasRoleLevel: (minRole: UserRole) => hasRoleLevel(userRole, minRole),
    isRole: (targetRole: UserRole) => userRole === targetRole,
  }), [userRole]);
}