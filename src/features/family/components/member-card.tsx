"use client";

import { useState } from "react";
import { UserMinus, Shield, Clock, Mail, Loader2, AlertTriangle } from "lucide-react";
import { removeFamilyMemberAction, updateMemberRoleAction } from "../actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FamilyMemberView } from "../queries";
import { useTranslations } from "next-intl";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MemberCardProps {
  member: FamilyMemberView;
}

export function MemberCard({ member }: MemberCardProps) {
  const t = useTranslations("Family");
  const commonT = useTranslations("Common");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const handleRemove = async () => {
    setIsDeleting(true);
    const result = await removeFamilyMemberAction(member.id);
    setIsDeleting(true);

    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
      setIsDeleting(false);
    }
  };

  const handleUpdateRole = async (newRole: string) => {
    if (newRole === member.role) return;
    
    setIsUpdatingRole(true);
    const result = await updateMemberRoleAction(member.id, newRole);
    setIsUpdatingRole(false);

    if (result.status === "success") {
      toast.success(t("roleUpdated"));
    } else {
      toast.error(result.message);
    }
  };

  const isAdmin = member.role === "admin";

  return (
    <article className="group relative panel p-6 transition-all hover:bg-canvas-depth hover:border-accent/40 animate-slide-up bg-canvas border-line">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center display text-xl text-accent-strong overflow-hidden">
            {member.label.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="display text-xl text-ink leading-tight">{member.label}</h3>
              {isAdmin && (
                <Shield className="h-3.5 w-3.5 text-accent animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted">
              <Mail className="h-3 w-3" />
              <span>{member.email}</span>
            </div>
          </div>
        </div>

        <Badge
          variant={member.status === "accepted" ? "success" : "default"}
          className="rounded-full px-3 py-0.5 text-[10px] uppercase tracking-widest"
        >
          {member.status === "accepted" ? t("statusSeated") : t("statusInviting")}
        </Badge>
      </div>

      <div className="mt-6 pt-5 border-t border-line/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] eyebrow text-muted">
            <Clock className="h-3 w-3" />
            <span>{member.joinedAt}</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button disabled={isUpdatingRole} className="flex items-center gap-1.5 text-[10px] eyebrow text-accent-strong hover:bg-accent/5 px-2 py-1 rounded transition-colors disabled:opacity-50">
                <Shield className={cn("h-3 w-3", isUpdatingRole && "animate-spin")} />
                <span className="uppercase">{member.role === "admin" ? t("statusAdmin") : t("statusMember")}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl border-line bg-canvas">
              <DropdownMenuItem 
                onClick={() => handleUpdateRole("admin")}
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                {t("setAdmin")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleUpdateRole("member")}
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                {t("setMember")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-red-600 transition-all rounded-lg hover:bg-red-500/10">
                <UserMinus className="h-3.5 w-3.5" />
                {t("removeMember")}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-canvas border-line">
              <AlertDialogHeader>
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <AlertDialogTitle className="display text-2xl text-ink">{t("removeConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription className="text-muted leading-relaxed">
                  {t("removeConfirmDesc", { name: member.label })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6">
                <AlertDialogCancel className="rounded-full border-line text-muted hover:bg-canvas-depth">
                  {commonT("cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove();
                  }}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-ink text-white rounded-full px-8 border-none"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("confirmRemoval")
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </article>
  );
}
