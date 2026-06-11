"use client";

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { UserRole, UserPermissions } from '@/lib/permissions';

interface PermissionWrapperProps {
  permission: keyof UserPermissions;
  fallback?: ReactNode;
  children: ReactNode;
}

interface RoleWrapperProps {
  minRole: UserRole;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionWrapper({ permission, fallback, children }: PermissionWrapperProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function RoleWrapper({ minRole, fallback, children }: RoleWrapperProps) {
  const { hasRoleLevel } = usePermissions();

  if (!hasRoleLevel(minRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}