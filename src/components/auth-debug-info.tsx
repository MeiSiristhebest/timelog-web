"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";

export function AuthDebugInfo() {
  const { userRole, isLoading, user, isAuthenticated } = useAuth();
  const permissions = usePermissions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>调试信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p><strong>用户角色:</strong> {userRole}</p>
          <p><strong>加载中:</strong> {isLoading ? '是' : '否'}</p>
          <p><strong>已认证:</strong> {isAuthenticated ? '是' : '否'}</p>
          <p><strong>用户ID:</strong> {user?.id || '无'}</p>
          <p><strong>用户邮箱:</strong> {user?.email || '无'}</p>
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p><strong>权限检查:</strong></p>
            <p>是家庭所有者: {permissions.isRole('family_owner') ? '是' : '否'}</p>
            <p>可以查看故事: {permissions.hasPermission('canViewStories') ? '是' : '否'}</p>
            <p>可以查看审计: {permissions.hasPermission('canViewAudit') ? '是' : '否'}</p>
            <p>可以管理设备: {permissions.hasPermission('canManageDevices') ? '是' : '否'}</p>
          </div>
          <div className="mt-4 p-2 bg-blue-50 rounded">
            <p className="text-xs text-blue-700">
              <strong>调试测试:</strong> 在浏览器控制台运行 <code>testSupabaseConnection()</code> 来测试数据库连接和RLS策略
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}