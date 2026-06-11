"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

export type StoryActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function toggleFavoriteAction(
  storyId: string,
  currentValue: boolean
): Promise<StoryActionState> {
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  const { error } = await supabase
    .from("audio_recordings")
    .update({ is_favorite: !currentValue })
    .eq("id", storyId);

  if (error) {
    console.error("Error toggling favorite:", error);
    return { status: "error", message: error.message };
  }

  revalidatePath("/stories");
  revalidatePath(`/stories/${storyId}`);
  revalidatePath("/overview");

  const t = await getTranslations("Stories");

  return {
    status: "success",
    message: !currentValue ? t("favoriteAdded") : t("favoriteRemoved"),
  };
}

export async function updateStoryTitleAction(
  storyId: string,
  newTitle: string
): Promise<StoryActionState> {
  const t = await getTranslations("Stories");
  const tCommon = await getTranslations("Common");
  const cleanTitle = newTitle.trim();
  if (!cleanTitle) return { status: "error", message: t("errorTitleEmpty") };

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  const { error } = await supabase
    .from("audio_recordings")
    .update({ title: cleanTitle })
    .eq("id", storyId);

  if (error) {
    console.error("Error updating story title:", error);
    return { status: "error", message: error.message };
  }

  revalidatePath("/stories");
  revalidatePath(`/stories/${storyId}`);

  return {
    status: "success",
    message: t("titleUpdated"),
  };
}

export async function archiveStoryAction(storyId: string): Promise<StoryActionState> {
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  const { error } = await supabase
    .from("audio_recordings")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", storyId);

  if (error) {
    console.error("Error archiving story:", error);
    return { status: "error", message: error.message };
  }

  revalidatePath("/stories");
  revalidatePath(`/stories/${storyId}`);
  revalidatePath("/overview");

  const t = await getTranslations("Stories");

  return {
    status: "success",
    message: t("memoryArchived"),
  };
}

export async function restoreStoryAction(storyId: string): Promise<StoryActionState> {
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  const { error } = await supabase
    .from("audio_recordings")
    .update({ deleted_at: null })
    .eq("id", storyId);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/stories");
  revalidatePath("/archive/trash");

  const t = await getTranslations("Stories");

  return {
    status: "success",
    message: t("memoryRestored"),
  };
}

export async function permanentlyDeleteStoryAction(storyId: string): Promise<StoryActionState> {
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  // Note: RLS will handle permission check
  const { error } = await supabase
    .from("audio_recordings")
    .delete()
    .eq("id", storyId);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/stories");
  revalidatePath("/archive/trash");

  const t = await getTranslations("Stories");

  return {
    status: "success",
    message: t("memoryDeleted"),
  };
}

export async function updateStoryTranscriptionAction(
  storyId: string,
  newTranscription: string
): Promise<StoryActionState> {
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  const { error } = await supabase
    .from("audio_recordings")
    .update({ transcription: newTranscription })
    .eq("id", storyId);

  if (error) {
    console.error("Error updating story transcription:", error);
    return { status: "error", message: error.message };
  }

  revalidatePath(`/stories/${storyId}`);
  revalidatePath("/stories");

  const t = await getTranslations("Stories");

  return {
    status: "success",
    message: t("transcriptUpdated"),
  };
}

/**
 * 批量归档故事 (移至回收站)
 */
export async function batchArchiveStoriesAction(ids: string[]): Promise<StoryActionState> {
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  try {
    const { error } = await supabase
      .from("audio_recordings")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", ids);

    if (error) throw error;

    revalidatePath("/stories");
    revalidatePath("/archive/trash");
    revalidatePath("/overview");
    const t = await getTranslations("Stories");
    return { status: "success", message: t("batchArchivedSuccess", { count: ids.length }) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { status: "error", message };
  }
}

/**
 * 批量从回收站恢复故事
 */
export async function batchRestoreStoriesAction(ids: string[]): Promise<StoryActionState> {
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  try {
    const { error } = await supabase
      .from("audio_recordings")
      .update({ deleted_at: null })
      .in("id", ids);

    if (error) throw error;

    revalidatePath("/stories");
    revalidatePath("/archive/trash");
    revalidatePath("/overview");
    const t = await getTranslations("Stories");
    return { status: "success", message: t("batchRestoredSuccess", { count: ids.length }) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { status: "error", message };
  }
}

/**
 * 批量永久删除故事 (物理删除)
 */
export async function batchPermanentlyDeleteStoriesAction(ids: string[]): Promise<StoryActionState> {
  const tCommon = await getTranslations("Common");
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  try {
    const { error } = await supabase
      .from("audio_recordings")
      .delete()
      .in("id", ids);

    if (error) throw error;

    revalidatePath("/stories");
    revalidatePath("/archive/trash");
    const t = await getTranslations("Stories");
    return { status: "success", message: t("batchDeletedSuccess", { count: ids.length }) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { status: "error", message };
  }
}
/**
 * 添加故事评论 (支持文本和语音)
 */
export async function addStoryCommentAction(
  prevState: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
  const t = await getTranslations("Stories");
  const tCommon = await getTranslations("Common");
  const storyId = formData.get("storyId") as string;
  const content = formData.get("content") as string;
  const audioFile = formData.get("audio") as File | null;

  if (!storyId) return { status: "error", message: t("errorStoryIdMissing") };
  if (!content && !audioFile) return { status: "error", message: t("errorCommentEmpty") };

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: tCommon("unauthorized") };

  try {
    let finalContent = content;

    // 如果有音频文件，先上传
    if (audioFile && audioFile.size > 0) {
      const fileName = `comment_${storyId}_${user.id}_${Date.now()}.wav`;
      const { error: uploadError } = await supabase.storage
        .from("audio_recordings")
        .upload(`comments/${fileName}`, audioFile);

      if (uploadError) throw uploadError;
      finalContent = `[AUDIO] ${fileName}`;
    }

    const { error } = await supabase
      .from("story_comments")
      .insert({
        story_id: storyId,
        user_id: user.id,
        content: finalContent,
      });

    if (error) throw error;

    revalidatePath(`/stories/${storyId}`);
    return { status: "success", message: t("commentAdded") };
  } catch (error: unknown) {
    console.error("Error adding comment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { status: "error", message };
  }
}

/**
 * 切换故事反应 (心跳)
 */
export async function toggleStoryReactionAction(
  prevState: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
  const t = await getTranslations("Stories");
  const tCommon = await getTranslations("Common");
  const storyId = formData.get("storyId") as string;

  if (!storyId) return { status: "error", message: t("errorStoryIdMissing") };

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", message: tCommon("supabaseNotConfigured") };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: tCommon("unauthorized") };

  try {
    // 检查是否已经点赞
    const { data: existing } = await supabase
      .from("story_reactions")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", user.id)
      .eq("reaction_type", "heart")
      .maybeSingle();

    const t = await getTranslations("Stories");

    if (existing) {
      // 移除
      await supabase.from("story_reactions").delete().eq("id", existing.id);
      revalidatePath(`/stories/${storyId}`);
      return { status: "success", message: t("reactionRemoved") };
    } else {
      // 添加
      await supabase.from("story_reactions").insert({
        story_id: storyId,
        user_id: user.id,
        reaction_type: "heart",
      });
      revalidatePath(`/stories/${storyId}`);
      return { status: "success", message: t("reactionAdded") };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { status: "error", message };
  }
}
