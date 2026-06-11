"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

export type InteractionActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

function interactionError(message: string): InteractionActionState {
  return {
    status: "error",
    message,
  };
}

export async function sendFamilyQuestionAction(
  _prevState: InteractionActionState,
  formData: FormData
): Promise<InteractionActionState> {
  const t = await getTranslations("Interactions");
  const tCommon = await getTranslations("Common");

  const seniorId = String(formData.get("seniorId") ?? "").trim();
  const questionText = String(formData.get("questionText") ?? "").trim();

  if (!seniorId) {
    return interactionError(t("errorSelectRecipient"));
  }

  if (!questionText || questionText.length < 5) {
    return interactionError(t("errorQuestionTooShort"));
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return interactionError(tCommon("supabaseNotConfigured"));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return interactionError(tCommon("authRequired"));
  }

  const { error } = await supabase.from("family_questions").insert({
    senior_user_id: seniorId,
    family_user_id: user.id,
    question_text: questionText,
    category: "Family Concern", // Default category
  });

  if (error) {
    console.error("Error sending family question:", error);
    return interactionError(error.message);
  }

  revalidatePath("/interactions");
  revalidatePath("/overview");

  return {
    status: "success",
    message: t("questionSent"),
  };
}

export async function updateCommentAction(
  commentId: string,
  newContent: string,
  storyId: string
): Promise<InteractionActionState> {
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  const { error } = await supabase
    .from("story_comments")
    .update({ content: newContent })
    .eq("id", commentId);

  if (error) {
    console.error("Error updating comment:", error);
    return { status: "error", message: error.message };
  }

  revalidatePath(`/stories/${storyId}`);

  const t = await getTranslations("Interactions");
  return {
    status: "success",
    message: t("commentRevised"),
  };
}

export async function deleteCommentAction(
  commentId: string,
  storyId: string
): Promise<InteractionActionState> {
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  const { error } = await supabase
    .from("story_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting comment:", error);
    return { status: "error", message: error.message };
  }

  revalidatePath(`/stories/${storyId}`);

  const t = await getTranslations("Interactions");
  return {
    status: "success",
    message: t("commentWithdrawn"),
  };
}
