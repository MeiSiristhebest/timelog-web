import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import {
  mapCommentRows,
  mapReactionRows,
  type CommentRow,
  type ReactionRow,
  type StoryCommentItem,
  type StoryReactionSummary,
} from "./presentation";
import { type StoryPlayback } from "./playback";
import { createSignedStoryPlayback } from "./playback.server";

type StoryRow = {
  id: string;
  title: string | null;
  started_at: string | number | null;
  duration_ms: number | null;
  sync_status: string | null;
  transcription: string | null;
  user_id: string | null;
  file_path: string | null;
  is_favorite: boolean | null;
};

type TranscriptSegmentRow = {
  id: string;
  story_id: string;
  segment_index: number;
  speaker: "user" | "agent";
  text: string;
  start_time_ms: number | null;
  end_time_ms: number | null;
  is_final: boolean;
};

export type StoryTranscriptSegment = {
  id: string;
  segmentIndex: number;
  speaker: "user" | "agent";
  text: string;
  startTimeMs: number | null;
  endTimeMs: number | null;
};

export type StoryListItem = {
  id: string;
  title: string;
  speakerLabel: string;
  startedAtLabel: string;
  durationLabel: string;
  syncStatus: string;
  transcriptPreview: string;
  commentCount: number;
  reactionCount: number;
  isFavorite: boolean;
};

export type StoryDetail = StoryListItem & {
  transcript: string;
  segments: StoryTranscriptSegment[];
  comments: StoryCommentItem[];
  reactions: StoryReactionSummary[];
  viewerHasHearted: boolean;
  playback: StoryPlayback;
};


async function formatDateLabel(value: string | number | null, locale: string): Promise<string> {
  if (!value) {
    const t = await getTranslations("Common");
    return t("noResultsFound");
  }

  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    const t = await getTranslations("Common");
    return t("noResultsFound");
  }

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDuration(durationMs: number | null): string {
  if (!durationMs || durationMs <= 0) return "00m 00s";

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}m ${seconds
    .toString()
    .padStart(2, "0")}s`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deriveSpeakerLabel(supabase: any, userId: string | null): Promise<string> {
  const t = await getTranslations("Common");
  if (!userId) return t("speaker");
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();
    if (!error && data?.display_name) {
      return data.display_name;
    }
  } catch (err) {
    console.error("Error fetching display name for userId:", userId, err);
  }
  return `${t("speaker")} ${userId.slice(0, 8)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProfilesMap(supabase: any, userIds: (string | null)[]): Promise<Map<string, string>> {
  const profilesMap = new Map<string, string>();
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean))) as string[];
  if (uniqueUserIds.length === 0) return profilesMap;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", uniqueUserIds);

    if (!error && data) {
      for (const p of data) {
        if (p.display_name) {
          profilesMap.set(p.id, p.display_name);
        }
      }
    }
  } catch (err) {
    console.error("Error fetching profiles map:", err);
  }
  return profilesMap;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTargetUserIds(supabase: any, currentUserId: string): Promise<string[]> {
  const userIds = [currentUserId];
  try {
    const { data: connections } = await supabase
      .from("family_connections")
      .select("senior_id");
    if (connections) {
      for (const conn of connections) {
        if (conn.senior_id) {
          userIds.push(conn.senior_id);
        }
      }
    }
  } catch (err) {
    console.error("Error fetching family connections:", err);
  }
  return userIds;
}

/**
 * 聚合统计所有故事的合计时长 (Storage Metrics)
 */
export async function getStorageMetrics(): Promise<{ totalDurationMs: number }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { totalDurationMs: 0 };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { totalDurationMs: 0 };
  }

  const targetUserIds = await getTargetUserIds(supabase, user.id);

  const { data, error } = await supabase
    .from("audio_recordings")
    .select("duration_ms")
    .is("deleted_at", null)
    .in("user_id", targetUserIds);

  if (error) {
    console.error("Error fetching storage metrics from Supabase:", error);
    return { totalDurationMs: 0 };
  }

  if (!data || data.length === 0) {
    return { totalDurationMs: 0 };
  }

  const total = data.reduce((acc, row) => acc + (row.duration_ms || 0), 0);
  return { totalDurationMs: total };
}

function toPreview(text: string | null, fallback: string): string {
  if (!text) {
    return fallback;
  }

  const trimmed = text.trim();
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 140)}...`;
}

async function getCommentCounts(
  storyIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (storyIds.length === 0) {
    return counts;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return counts;
  }

  const { data, error } = await supabase
    .from("story_comments")
    .select("story_id")
    .in("story_id", storyIds);

  if (error || !data) {
    return counts;
  }

  for (const row of data as Array<{ story_id: string }>) {
    counts.set(row.story_id, (counts.get(row.story_id) ?? 0) + 1);
  }

  return counts;
}

async function getReactionCounts(
  storyIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  if (storyIds.length === 0) {
    return counts;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return counts;
  }

  const { data, error } = await supabase
    .from("story_reactions")
    .select("story_id")
    .in("story_id", storyIds);

  if (error || !data) {
    return counts;
  }

  for (const row of data as Array<{ story_id: string }>) {
    counts.set(row.story_id, (counts.get(row.story_id) ?? 0) + 1);
  }

  return counts;
}

async function getCommentsForStory(storyId: string): Promise<StoryCommentItem[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("story_comments")
    .select("id, story_id, user_id, content, created_at")
    .eq("story_id", storyId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return [];
  }

  return mapCommentRows(data as CommentRow[]);
}

async function getReactionSummaryForStory(
  storyId: string
): Promise<StoryReactionSummary[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("story_reactions")
    .select("reaction_type")
    .eq("story_id", storyId);

  if (error || !data) {
    return [];
  }

  return mapReactionRows(data as ReactionRow[]);
}

export async function getStories(): Promise<StoryListItem[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }
  const t = await getTranslations("Stories");
  const locale = await getLocale();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const targetUserIds = await getTargetUserIds(supabase, user.id);

  const { data, error } = await supabase
    .from("audio_recordings")
    .select("id, title, started_at, duration_ms, sync_status, transcription, user_id, is_favorite")
    .is("deleted_at", null)
    .in("user_id", targetUserIds)
    .order("started_at", { ascending: false })
    .limit(24);

  if (error) {
    console.error("Error fetching stories from Supabase:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const rows = data as StoryRow[];
  const storyIds = rows.map((row) => row.id);
  const userIds = rows.map((row) => row.user_id);
  const [commentCounts, reactionCounts, profilesMap] = await Promise.all([
    getCommentCounts(storyIds),
    getReactionCounts(storyIds),
    getProfilesMap(supabase, userIds),
  ]);

  const tCommon = await getTranslations("Common");

  return Promise.all(
    rows.map(async (row) => {
      const speakerLabel = row.user_id 
        ? (profilesMap.get(row.user_id) ?? `${tCommon("speaker")} ${row.user_id.slice(0, 8)}`)
        : tCommon("speaker");

      return {
        id: row.id,
        title: row.title?.trim() || t("untitledStory"),
        speakerLabel,
        startedAtLabel: await formatDateLabel(row.started_at, locale),
        durationLabel: formatDuration(row.duration_ms),
        syncStatus: row.sync_status ?? "unknown",
        transcriptPreview: toPreview(row.transcription, t("noTranscriptPreview")),
        commentCount: commentCounts.get(row.id) ?? 0,
        reactionCount: reactionCounts.get(row.id) ?? 0,
        isFavorite: Boolean(row.is_favorite),
      };
    })
  );
}

export async function getArchivedStories(): Promise<StoryListItem[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const t = await getTranslations("Stories");
  const locale = await getLocale();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const targetUserIds = await getTargetUserIds(supabase, user.id);

  const { data, error } = await supabase
    .from("audio_recordings")
    .select("id, title, started_at, duration_ms, sync_status, transcription, user_id, is_favorite")
    .not("deleted_at", "is", null)
    .in("user_id", targetUserIds)
    .order("deleted_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  const rows = data as StoryRow[];
  const storyIds = rows.map((row) => row.id);
  const userIds = rows.map((row) => row.user_id);
  const [commentCounts, reactionCounts, profilesMap] = await Promise.all([
    getCommentCounts(storyIds),
    getReactionCounts(storyIds),
    getProfilesMap(supabase, userIds),
  ]);

  const tCommon = await getTranslations("Common");

  return Promise.all(
    rows.map(async (row) => {
      const speakerLabel = row.user_id 
        ? (profilesMap.get(row.user_id) ?? `${tCommon("speaker")} ${row.user_id.slice(0, 8)}`)
        : tCommon("speaker");

      return {
        id: row.id,
        title: row.title?.trim() || t("untitledStory"),
        speakerLabel,
        startedAtLabel: await formatDateLabel(row.started_at, locale),
        durationLabel: formatDuration(row.duration_ms),
        syncStatus: row.sync_status ?? "unknown",
        transcriptPreview: toPreview(row.transcription, t("noTranscriptPreview")),
        commentCount: commentCounts.get(row.id) ?? 0,
        reactionCount: reactionCounts.get(row.id) ?? 0,
        isFavorite: Boolean(row.is_favorite),
      };
    })
  );
}

export async function getStoryById(id: string): Promise<StoryDetail | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }
  const t = await getTranslations("Stories");
  const locale = await getLocale();

  const [userRes, storyRes, segmentsRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("audio_recordings")
      .select("id, title, started_at, duration_ms, sync_status, transcription, user_id, file_path, is_favorite")
      .eq("id", id)
      .single(),
    supabase
      .from("transcript_segments")
      .select("id, story_id, segment_index, speaker, text, start_time_ms, end_time_ms, is_final")
      .eq("story_id", id)
      .eq("is_final", true)
      .order("segment_index", { ascending: true }),
  ]);

  const user = userRes.data.user;
  const { data, error } = storyRes;

  if (error || !data) {
    return null;
  }

  const row = data as StoryRow;

  console.log(`[getStoryById] story=${id} file_path=${row.file_path ?? "NULL"} sync_status=${row.sync_status ?? "NULL"} segments=${segmentsRes.data?.length ?? 0}`);

  // Map DB transcript segments to typed domain objects
  const segments: StoryTranscriptSegment[] = (segmentsRes.data ?? []).map((s: TranscriptSegmentRow) => ({
    id: s.id,
    segmentIndex: s.segment_index,
    speaker: s.speaker,
    text: s.text,
    startTimeMs: s.start_time_ms,
    endTimeMs: s.end_time_ms,
  }));

  const [commentCounts, reactionCounts, comments, reactions, heartReaction, playback] = await Promise.all([
    getCommentCounts([id]),
    getReactionCounts([id]),
    getCommentsForStory(id),
    getReactionSummaryForStory(id),
    user
      ? supabase
          .from("story_reactions")
          .select("id")
          .eq("story_id", id)
          .eq("user_id", user.id)
          .eq("reaction_type", "heart")
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    createSignedStoryPlayback(supabase, row.file_path ?? null),
  ]);

  console.log(`[getStoryById] story=${id} resolved playback:`, JSON.stringify(playback));

  const transcript =
    row.transcription?.trim() ||
    t("noTranscript");

  return {
    id: row.id,
      title: row.title?.trim() || t("untitledStory"),
      speakerLabel: await deriveSpeakerLabel(supabase, row.user_id),
    startedAtLabel: await formatDateLabel(row.started_at, locale),
    durationLabel: formatDuration(row.duration_ms),
    syncStatus: row.sync_status ?? "unknown",
    transcriptPreview: toPreview(transcript, t("noTranscriptPreview")),
    transcript,
    segments,
    commentCount: commentCounts.get(row.id) ?? 0,
    reactionCount: reactionCounts.get(row.id) ?? 0,
    comments,
    reactions,
    viewerHasHearted: Boolean(heartReaction.data),
    playback,
    isFavorite: Boolean(row.is_favorite),
  };
}

export async function getStoryCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("audio_recordings")
    .select("*", { count: "estimated", head: true });

  return count || 0;
}
