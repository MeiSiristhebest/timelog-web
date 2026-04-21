// 用户权限定义
export type UserRole = 'super_admin' | 'family_owner' | 'family_member' | 'guest';

export interface UserPermissions {
  // 时光长廊模块权限
  canViewStories: boolean;
  canPlayStories: boolean;
  canEditStories: boolean;
  canDeleteStories: boolean;
  canExportStories: boolean;

  // 代际互动模块权限
  canViewFamily: boolean;
  canInviteMembers: boolean;
  canManageMembers: boolean;
  canViewInteractions: boolean;
  canCreateInteractions: boolean;

  // 管理功能权限
  canViewAudit: boolean;
  canManageDevices: boolean;
  canAccessSettings: boolean;
  canExportData: boolean;
}

export const PERMISSIONS: Record<UserRole, UserPermissions> = {
  super_admin: {
    // 完全控制权限
    canViewStories: true,
    canPlayStories: true,
    canEditStories: true,
    canDeleteStories: true,
    canExportStories: true,
    canViewFamily: true,
    canInviteMembers: true,
    canManageMembers: true,
    canViewInteractions: true,
    canCreateInteractions: true,
    canViewAudit: true,
    canManageDevices: true,
    canAccessSettings: true,
    canExportData: true,
  },
  family_owner: {
    // 家庭所有者权限
    canViewStories: true,
    canPlayStories: true,
    canEditStories: true,
    canDeleteStories: false,
    canExportStories: true,
    canViewFamily: true,
    canInviteMembers: true,
    canManageMembers: true,
    canViewInteractions: true,
    canCreateInteractions: true,
    canViewAudit: true,
    canManageDevices: true,
    canAccessSettings: true,
    canExportData: false,
  },
  family_member: {
    // 普通家庭成员权限
    canViewStories: true,
    canPlayStories: true,
    canEditStories: false,
    canDeleteStories: false,
    canExportStories: false,
    canViewFamily: true,
    canInviteMembers: false,
    canManageMembers: false,
    canViewInteractions: true,
    canCreateInteractions: true,
    canViewAudit: false,
    canManageDevices: false,
    canAccessSettings: false,
    canExportData: false,
  },
  guest: {
    // 访客权限（最低）
    canViewStories: false,
    canPlayStories: false,
    canEditStories: false,
    canDeleteStories: false,
    canExportStories: false,
    canViewFamily: false,
    canInviteMembers: false,
    canManageMembers: false,
    canViewInteractions: false,
    canCreateInteractions: false,
    canViewAudit: false,
    canManageDevices: false,
    canAccessSettings: false,
    canExportData: false,
  },
};

// 权限检查函数
export function hasPermission(userRole: UserRole, permission: keyof UserPermissions): boolean {
  return PERMISSIONS[userRole][permission];
}

// 角色检查函数
export function isRole(userRole: UserRole, targetRole: UserRole): boolean {
  return userRole === targetRole;
}

// 角色层次检查（是否具有等于或高于指定角色的权限）
export function hasRoleLevel(userRole: UserRole, minRole: UserRole): boolean {
  const roleHierarchy = {
    guest: 0,
    family_member: 1,
    family_owner: 2,
    super_admin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[minRole];
}