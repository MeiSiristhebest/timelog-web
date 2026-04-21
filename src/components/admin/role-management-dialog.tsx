"use client";

import { useState } from "react";
import { Crown, User, Shield } from "lucide-react";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserRole {
  id: string;
  email: string;
  displayName: string;
  currentRole: string;
}

interface RoleManagementDialogProps {
  user: UserRole;
  onRoleUpdate: (userId: string, newRole: string) => Promise<void>;
}

export function RoleManagementDialog({ user, onRoleUpdate }: RoleManagementDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.currentRole);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleUpdate = async () => {
    if (selectedRole === user.currentRole) return;

    setIsLoading(true);
    try {
      await onRoleUpdate(user.id, selectedRole);
      toast.success(`用户角色已更新为${selectedRole === 'family_owner' ? '管理员' : '成员'}`);
      setOpen(false);
    } catch (error) {
      toast.error("更新角色失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'family_owner':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'family_member':
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'family_owner':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            管理员
          </Badge>
        );
      case 'family_member':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            成员
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {role}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          {getRoleIcon(user.currentRole)}
          管理角色
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            管理用户角色
          </DialogTitle>
          <DialogDescription>
            修改用户 <strong>{user.displayName}</strong> ({user.email}) 的角色权限。
            此操作将立即生效。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="role" className="text-right">
              当前角色
            </label>
            <div className="col-span-3">
              {getRoleBadge(user.currentRole)}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="new-role" className="text-right">
              新角色
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择新角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family_member">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    家庭成员
                  </div>
                </SelectItem>
                <SelectItem value="family_owner">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    家庭所有者
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <div className="font-medium mb-2">角色权限说明：</div>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Crown className="h-3 w-3 text-amber-500" />
                <span><strong>家庭所有者：</strong> 完全管理权限，可以邀请成员、管理角色</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-blue-500" />
                <span><strong>家庭成员：</strong> 基础查看和互动权限</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleRoleUpdate}
            disabled={isLoading || selectedRole === user.currentRole}
          >
            {isLoading ? "更新中..." : "确认更新"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}