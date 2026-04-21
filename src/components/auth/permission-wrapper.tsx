"use client";

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionWrapperProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

interface RoleWrapperProps {
  minRole: string;
  fallback?: ReactNode;
  children: ReactNode;
}

interface RoleWrapperProps {
  minRole: string;
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

  if (!hasRoleLevel(minRole as any)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}