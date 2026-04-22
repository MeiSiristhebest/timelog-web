"use client";

import { useMemo } from 'react';
import { UserRole, hasPermission, hasRoleLevel } from '@/lib/permissions';
import { useAuth } from '@/contexts/auth-context';

export function usePermissions() {
  const { userRole, isLoading, isAuthenticated } = useAuth();

  return useMemo(() => ({
    userRole,
    isLoading,
    isAuthenticated,
    hasPermission: (permission: string) => {
      // 如果正在加载，返回true以显示所有项目，避免闪烁
      if (isLoading) return true;

      try {
        return hasPermission(userRole, permission as any);
      } catch (error) {
        console.error('Permission check error:', permission, error);
        return false;
      }
    },
    hasRoleLevel: (minRole: UserRole) => hasRoleLevel(userRole, minRole),
    isRole: (targetRole: UserRole) => userRole === targetRole,
  }), [userRole, isLoading, isAuthenticated]);
}