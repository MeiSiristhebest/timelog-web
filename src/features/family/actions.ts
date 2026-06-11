"use server";

import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

export type FamilyActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export type FamilyInviteActionState = FamilyActionState & {
  inviteToken?: string | null;
};

/**
 * Removes a family member from the current circle.
 * Only the owner (admin) should be able to perform this.
 * RLS on `family_members` should ideally handle the permission.
 */
export async function removeFamilyMemberAction(memberId: string): Promise<FamilyActionState> {
  const t = await getTranslations("Family");
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  // 1. Check if the member even exists
  const { data: member, error: fetchError } = await supabase
    .from("family_members")
    .select("email, status")
    .eq("id", memberId)
    .single();

  if (fetchError || !member) {
    return { status: "error", message: t("errorMemberNotFound") };
  }

  // 2. Delete the record
  const { error: deleteError } = await supabase
    .from("family_members")
    .delete()
    .eq("id", memberId);

  if (deleteError) {
    console.error("Error removing family member:", deleteError);
    return { status: "error", message: deleteError.message };
  }

  revalidatePath("/family");
  revalidatePath("/audit");

  return {
    status: "success",
    message: t("memberRemovedSuccess", { email: member.email || t("pendingMember") }),
  };
}

export async function updateArchiveNameAction(newName: string): Promise<FamilyActionState> {
  const t = await getTranslations("Family");
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: tCommon("authRequired") };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: newName })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating archive name:", error);
    return { status: "error", message: error.message };
  }

  revalidatePath("/(dashboard)", "layout");
  revalidatePath("/settings");

  return {
    status: "success",
    message: t("archiveRebranded", { name: newName }),
  };
}

export async function updateMemberRoleAction(
  memberId: string,
  newRole: string
): Promise<FamilyActionState> {
  const t = await getTranslations("Family");
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  // 获取当前用户信息
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: tCommon("authRequired") };

  // 检查当前用户是否为管理员
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!currentUserProfile || !["family_owner", "super_admin"].includes(currentUserProfile.role)) {
    return { status: "error", message: t("errorAdminOnly") };
  }

  // 验证新角色是否有效
  const validRoles = ["family_owner", "family_member"];
  if (!validRoles.includes(newRole)) {
    return { status: "error", message: t("errorInvalidRole") };
  }

  // 更新用户角色（在profiles表中）
  const { data: member } = await supabase
    .from("family_members")
    .select("user_id")
    .eq("id", memberId)
    .single();

  if (!member?.user_id) {
    return { status: "error", message: t("errorProfileNotFound") };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", member.user_id);

  if (profileError) {
    console.error("Error updating profile role:", profileError);
    return { status: "error", message: profileError.message };
  }

  // 同时更新family_members表中的角色（用于一致性）
  const { error: memberError } = await supabase
    .from("family_members")
    .update({ role: newRole })
    .eq("id", memberId);

  if (memberError) {
    console.error("Error updating member role:", memberError);
    // 不返回错误，因为profiles已经更新了
  }

  revalidatePath("/family");
  revalidatePath("/audit");

  const roleLabel = newRole === 'family_owner' ? t("statusAdmin") : t("statusMember");
  return {
    status: "success",
    message: t("roleUpdatedSuccess", { role: roleLabel }),
  };
}

/**
 * Creates a unique invite link for a new family member.
 * This effectively generates a record in the `family_members` table with 'pending' status.
 */
export async function createFamilyInviteAction(
  prevState: FamilyInviteActionState,
  formData: FormData
): Promise<FamilyInviteActionState> {
  const t = await getTranslations("Family");
  const tCommon = await getTranslations("Common");
  const email = formData.get("email") as string;
  if (!email || !email.includes("@")) {
    return { status: "error", message: t("errorInvalidEmail"), inviteToken: null };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured"), inviteToken: null };

  // 获取当前用户信息
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: tCommon("authRequired"), inviteToken: null };

  try {
    // 检查是否存在
    const { data: existing } = await supabase
      .from("family_members")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
       return { status: "error", message: t("errorEmailExists"), inviteToken: null };
    }

    // 1. 获取当前用户的 family_id
    const { data: currentUserMember } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", user.id)
      .maybeSingle();

    // 2. 如果当前用户没有 family_id（例如他是第一个创建家庭的所有者），则生成一个新的 UUID
    const familyId = currentUserMember?.family_id || crypto.randomUUID();

    // 创建邀请
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        email,
        role: "member",
        status: "pending",
        family_id: familyId,
        invited_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/family");
    
    // In a real app, we'd send an email here. 
    // For the demo/web tool, we return the ID as a "token" just to show it works.
    return { 
      status: "success", 
      message: t("inviteSuccess"), 
      inviteToken: data.id 
    };
  } catch (error: unknown) {
    console.error("Error in createFamilyInviteAction:", error);
    const err = error as { message?: string } | null;
    const message = err?.message || (typeof error === "string" ? error : tCommon("unknownError"));
    return { status: "error", message, inviteToken: null };
  }
}
