import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import {
  mapCommentRows,
  mapReactionRows,
  type CommentRow,
  type ReactionRow,
  type StoryCommentItem,
  type StoryReactionSummary,
} from "./presentation";
import { buildStoryPlayback, type StoryPlayback } from "./playback";
import { createSignedStoryPlayback } from "./playback.server";
import { mockStories, getMockStoryById, getAllMockStoryIds } from "@/lib/mock-data";

const shouldUseMock = () => {
  const isMockFlag = process.env.NEXT_PUBLIC_USE_MOCK === "true";
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return isMockFlag || !hasSupabase;
};

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
  comments: StoryCommentItem[];
  reactions: StoryReactionSummary[];
  viewerHasHearted: boolean;
  playback: StoryPlayback;
};


async function formatDateLabel(value: string | number | null): Promise<string> {
  if (!value) {
    const t = await getTranslations("Common");
    return t("noResultsFound");
  }

  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    const t = await getTranslations("Common");
    return t("noResultsFound");
  }

  return new Intl.DateTimeFormat("en", {
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

async function deriveSpeakerLabel(userId: string | null): Promise<string> {
  const t = await getTranslations("Common");
  if (!userId) return t("speaker");
  return `${t("speaker")} ${userId.slice(0, 8)}`;
}

/**
 * 聚合统计所有故事的合计时长 (Storage Metrics)
 */
export async function getStorageMetrics(): Promise<{ totalDurationMs: number }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { totalDurationMs: 0 };
  }

  const { data, error } = await supabase
    .from("audio_recordings")
    .select("duration_ms")
    .is("deleted_at", null);

  if (shouldUseMock() || error || !data || data.length === 0) {
    return { totalDurationMs: 100 * 60 * 60 * 1000 };
  }

  const total = data.reduce((acc, row) => acc + (row.duration_ms || 0), 0);
  return { totalDurationMs: total };
}

function toPreview(text: string | null): string {
  if (!text) {
    return "Transcript is not available yet. This story is ready for protected playback and family interaction.";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("audio_recordings")
    .select("id, title, started_at, duration_ms, sync_status, transcription, user_id, is_favorite")
    .is("deleted_at", null)
    .order("started_at", { ascending: false })
    .limit(24);

  if (shouldUseMock() || error || !data || data.length === 0) {
    return mockStories;
  }

  const rows = data as StoryRow[];
  const storyIds = rows.map((row) => row.id);
  const [commentCounts, reactionCounts] = await Promise.all([
    getCommentCounts(storyIds),
    getReactionCounts(storyIds),
  ]);

  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      title: row.title?.trim() || "Untitled memory",
      speakerLabel: await deriveSpeakerLabel(row.user_id),
      startedAtLabel: await formatDateLabel(row.started_at),
      durationLabel: formatDuration(row.duration_ms),
      syncStatus: row.sync_status ?? "unknown",
      transcriptPreview: toPreview(row.transcription),
      commentCount: commentCounts.get(row.id) ?? 0,
      reactionCount: reactionCounts.get(row.id) ?? 0,
      isFavorite: Boolean(row.is_favorite),
    }))
  );
}

export async function getArchivedStories(): Promise<StoryListItem[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("audio_recordings")
    .select("id, title, started_at, duration_ms, sync_status, transcription, user_id, is_favorite")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  const rows = data as StoryRow[];
  const storyIds = rows.map((row) => row.id);
  const [commentCounts, reactionCounts] = await Promise.all([
    getCommentCounts(storyIds),
    getReactionCounts(storyIds),
  ]);

  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      title: row.title?.trim() || "Untitled memory",
      speakerLabel: await deriveSpeakerLabel(row.user_id),
      startedAtLabel: await formatDateLabel(row.started_at),
      durationLabel: formatDuration(row.duration_ms),
      syncStatus: row.sync_status ?? "unknown",
      transcriptPreview: toPreview(row.transcription),
      commentCount: commentCounts.get(row.id) ?? 0,
      reactionCount: reactionCounts.get(row.id) ?? 0,
      isFavorite: Boolean(row.is_favorite),
    }))
  );
}

export async function getStoryById(id: string): Promise<StoryDetail | null> {
  if (shouldUseMock()) {
    const mock = getMockStoryById(id);
    if (mock) {
      const listItem = mockStories.find(s => s.id === id);
      return {
        id: mock.id,
        title: mock.title,
        speakerLabel: mock.speakerLabel,
        startedAtLabel: mock.startedAtLabel,
        durationLabel: mock.durationLabel,
        syncStatus: mock.syncStatus,
        transcriptPreview: mock.transcriptPreview,
        transcript: mock.transcript,
        commentCount: mock.commentCount,
        reactionCount: mock.reactionCount,
        comments: mock.comments.map(c => ({
          id: c.id,
          userId: "user-mock",
          authorLabel: c.actorLabel,
          content: c.content,
          createdAtLabel: c.createdAtLabel,
          type: "text" as const
        })),
        reactions: mock.reactions,
        viewerHasHearted: mock.viewerHasHearted,
        playback: {
          sourcePath: "/mock/audio/story-001.m4a",
          signedUrl: mock.playback.signedUrl,
          expiresLabel: "Mock expiry",
          expiresAtEpochMs: mock.playback.expiresAtEpochMs,
          isReady: mock.playback.isReady
        },
        isFavorite: mock.isFavorite
      };
    }
    return null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const [userRes, storyRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("audio_recordings")
      .select("id, title, started_at, duration_ms, sync_status, transcription, user_id, file_path, is_favorite")
      .eq("id", id)
      .single(),
  ]);

  const user = userRes.data.user;
  const { data, error } = storyRes;

  if (error || !data) {
    return null;
  }

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
    createSignedStoryPlayback(supabase, (data as StoryRow).file_path ?? null),
  ]);

  const row = data as StoryRow;
  const transcript =
    row.transcription?.trim() ||
    "Transcript has not been synced yet. Protected playback wiring is ready for the next pass.";

  return {
    id: row.id,
    title: row.title?.trim() || "Untitled memory",
    speakerLabel: await deriveSpeakerLabel(row.user_id),
    startedAtLabel: await formatDateLabel(row.started_at),
    durationLabel: formatDuration(row.duration_ms),
    syncStatus: row.sync_status ?? "unknown",
    transcriptPreview: toPreview(transcript),
    transcript,
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
    .from("stories")
    .select("*", { count: "estimated", head: true });

  return count || 0;
}
