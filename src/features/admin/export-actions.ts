"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ExportActionState = {
  status: "idle" | "success" | "error";
  data: object | null;
  message: string | null;
};

/**
 * Consolidates all family data into a single structured object for export.
 * This satisfies the "Data Sovereignty" requirement.
 */
export async function exportAllDataAction(): Promise<ExportActionState> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { status: "error", data: null, message: "Supabase not configured." };

  try {
    // 1. Fetch Stories (Metadata & Transcripts)
    const { data: stories } = await supabase
      .from("audio_recordings")
      .select("*")
      .order("created_at", { ascending: false });

    // 2. Fetch Comments/Interactions
    const { data: comments } = await supabase
      .from("story_comments")
      .select("*")
      .order("created_at", { ascending: false });

    // 3. Fetch Family Members
    const { data: members } = await supabase
      .from("family_members")
      .select("*");

    // 4. Fetch Devices
    const { data: devices } = await supabase
      .from("devices")
      .select("*");

    // 5. Fetch Interaction Questions
    const { data: questions } = await supabase
      .from("family_questions")
      .select("*");

    // Consolidate
    const backupData = {
      archive_metadata: {
        exported_at: new Date().toISOString(),
        version: "1.0",
        format: "TimeLog-Heritage-Archive",
      },
      stories: stories || [],
      interactions: {
        comments: comments || [],
        questions: questions || [],
      },
      identity: {
        members: members || [],
        devices: devices || [],
      }
    };

    return {
      status: "success",
      data: backupData,
      message: "家族档案数据已成功聚合，准备开始导出流程。",
    };
  } catch (error: unknown) {
    console.error("Export error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { status: "error", data: null, message };
  }
}
