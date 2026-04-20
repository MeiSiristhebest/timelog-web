"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: "Supabase not configured." };

  // 1. Check if the member even exists
  const { data: member, error: fetchError } = await supabase
    .from("family_members")
    .select("email, status")
    .eq("id", memberId)
    .single();

  if (fetchError || !member) {
    return { status: "error", message: "Family member not found." };
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
    message: `${member.email || "The member"} has been removed from the circle.`,
  };
}

export async function updateArchiveNameAction(newName: string): Promise<FamilyActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: "Supabase not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "No session found." };

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
    message: `Archive rebranded to "${newName}" successfully.`,
  };
}

export async function updateMemberRoleAction(
  memberId: string,
  newRole: string
): Promise<FamilyActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: "Supabase not configured." };

  const { error } = await supabase
    .from("family_members")
    .update({ role: newRole })
    .eq("id", memberId);

  if (error) {
    console.error("Error updating member role:", error);
    return { status: "error", message: error.message };
  }

  revalidatePath("/family");

  return {
    status: "success",
    message: "成员权限级别已成功变更",
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
  const email = formData.get("email") as string;
  if (!email || !email.includes("@")) {
    return { status: "error", message: "A valid email address is required.", inviteToken: null };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: "Supabase not configured.", inviteToken: null };

  try {
    // 检查是否存在
    const { data: existing } = await supabase
      .from("family_members")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
       return { status: "error", message: "This email is already part of the family circle.", inviteToken: null };
    }

    // 创建邀请
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        email,
        role: "member",
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/family");
    
    // In a real app, we'd send an email here. 
    // For the demo/web tool, we return the ID as a "token" just to show it works.
    return { 
      status: "success", 
      message: "The invitation has been successfully inscribed.", 
      inviteToken: data.id 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { status: "error", message, inviteToken: null };
  }
}
