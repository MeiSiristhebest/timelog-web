"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Shield,
  Mail,
  Clock,
  ChevronDown,
  UserMinus,
  AlertTriangle,
  Users,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { removeFamilyMemberAction, updateMemberRoleAction } from "@/features/family/actions";
import type { FamilyMemberView as FamilyMember } from "@/features/family/queries";
import { usePermissions } from "@/hooks/use-permissions";
import { RoleManagementDialog } from "@/components/admin/role-management-dialog";

interface FamilyDataTableProps {
  members: FamilyMember[];
}

export function FamilyDataTable({ members }: FamilyDataTableProps) {
  const t = useTranslations("Family");
  const commonT = useTranslations("Common");
  const { hasPermission } = usePermissions();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);

  const handleRemove = async (memberId: string) => {
    setIsDeleting(memberId);
    const result = await removeFamilyMemberAction(memberId);

    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setIsDeleting(null);
  };

  const handleUpdateRole = async (memberId: string, newRole: string, currentRole: string) => {
    if (newRole === currentRole) return;
    
    setIsUpdatingRole(memberId);
    const result = await updateMemberRoleAction(memberId, newRole);
    setIsUpdatingRole(null);

    if (result.status === "success") {
      toast.success(t("roleUpdated"));
    } else {
      toast.error(result.message);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="bg-canvas-elevated border border-line rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-line bg-canvas-depth/30">
              <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("tableMember")}</TableHead>
              <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("tableContact")}</TableHead>
              <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("tableRole")}</TableHead>
              <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("tableJoined")}</TableHead>
              <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("tableStatus")}</TableHead>
              <TableHead className="w-16 px-6 h-14"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const isAdmin = member.role === "admin" || member.role === "family_owner";
              const isProcessing = isDeleting === member.id || isUpdatingRole === member.id;
              const initials = member.label.charAt(0).toUpperCase();

              return (
                <TableRow key={member.id} className="group border-b border-line hover:bg-accent/[0.02] transition-colors">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-9 w-9 border border-line-strong">
                        <AvatarFallback className="bg-accent/10 text-accent font-black text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-ink truncate flex items-center gap-2">
                          {member.label}
                          {isAdmin && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="p-1 rounded-full bg-accent/10 border border-accent/20">
                                  <Shield size={10} className="text-accent" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-canvas-elevated text-ink font-bold text-[10px] uppercase tracking-widest">
                                 {t("masterAdmin")}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-muted font-bold">
                      <Mail size={12} className="text-muted/50" />
                      {member.email}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
{hasPermission('canManageMembers') && (
                      <RoleManagementDialog
                        user={{
                          id: member.id,
                          email: member.email,
                          displayName: member.label,
                          currentRole: member.role === 'admin' ? 'family_owner' : 'family_member'
                        }}
                        onRoleUpdate={async (userId, newRole) => {
                          const supabaseRole = newRole === 'family_owner' ? 'admin' : 'member';
                          await handleUpdateRole(userId, supabaseRole, member.role);
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-muted font-bold">
                      <Clock size={12} className="text-muted/50" />
                      {member.joinedAt}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] font-black px-2 py-0.5 uppercase tracking-widest",
                        member.status === "accepted" 
                          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" 
                          : "border-line-strong bg-canvas-depth text-muted"
                      )}
                    >
                      <span className={cn(
                        "h-1 w-1 rounded-full mr-1.5",
                        member.status === "accepted" ? "bg-emerald-600" : "bg-muted animate-pulse"
                      )} />
                      {member.status === "accepted" 
                        ? (isAdmin ? t("statusAdmin") : t("statusMember")) 
                        : t("statusPending")}
                    </Badge>
                  </TableCell>
                   <TableCell className="px-6 py-5 text-right">
                    {hasPermission('canManageMembers') && !isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all outline-none">
                            <UserMinus size={16} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem] border-line shadow-2xl">
                          <AlertDialogHeader>
                            <div className="h-14 w-14 rounded-2xl bg-danger/10 flex items-center justify-center mb-6 rotate-12">
                              <AlertTriangle className="h-7 w-7 text-danger" />
                            </div>
                            <AlertDialogTitle className="text-2xl font-black tracking-tight text-ink">{t("removeConfirmTitle")}</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted text-sm font-bold leading-relaxed pt-2">
                              {t("removeConfirmDesc", { name: member.label })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-8 gap-3">
                            <AlertDialogCancel className="rounded-full border-line-strong text-muted font-black uppercase tracking-widest text-[10px] py-6 px-6">
                              {commonT("cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemove(member.id)}
                              disabled={isDeleting === member.id}
                              className="bg-danger hover:bg-danger/90 text-white rounded-full px-8 font-black uppercase tracking-widest text-[10px] py-6 shadow-lg shadow-danger/20"
                            >
                              {isDeleting === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : commonT("confirm")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
