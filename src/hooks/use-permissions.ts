import { useMemo } from 'react';
import { UserRole, hasPermission, hasRoleLevel } from '@/lib/permissions';

// 假设我们有一个获取当前用户角色的函数
// 在实际应用中，这可能来自context或API
const getCurrentUserRole = (): UserRole => {
  // 这里应该是从认证系统获取的真实用户角色
  // 暂时返回默认值
  return 'family_owner';
};

export function usePermissions() {
  const userRole = getCurrentUserRole();

  return useMemo(() => ({
    userRole,
    hasPermission: (permission: string) =>
      hasPermission(userRole, permission as keyof typeof PERMISSIONS[UserRole]),
    hasRoleLevel: (minRole: UserRole) => hasRoleLevel(userRole, minRole),
    isRole: (targetRole: UserRole) => userRole === targetRole,
  }), [userRole]);
}