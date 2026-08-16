import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import {
  buildInteractionFeed,
  type InteractionCommentRow,
  type InteractionReactionRow,
  type InteractionItem,
} from "./presentation";

type TFunction = Awaited<ReturnType<typeof getTranslations>>;

type StoryTitleRow = {
  id: string;
  title: string | null;
};

export type InteractionsOverview = {
  metrics: {
    commentCount: number;
    reactionCount: number;
    storiesTouched: number;
  };
  items: InteractionItem[];
};

const emptyInteractionsOverview: InteractionsOverview = {
  metrics: {
    commentCount: 0,
    reactionCount: 0,
    storiesTouched: 0,
  },
  items: [],
};

async function getStoryTitles(
  storyIds: string[]
): Promise<Map<string, string>> {
  const titles = new Map<string, string>();

  if (storyIds.length === 0) {
    return titles;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return titles;
  }

  const { data, error } = await supabase
    .from("audio_recordings")
    .select("id, title")
    .in("id", storyIds);

  if (error || !data) {
    return titles;
  }

  for (const row of data as StoryTitleRow[]) {
    titles.set(row.id, row.title?.trim() || "Untitled memory");
  }

  return titles;
}

export async function getInteractionsOverview(): Promise<InteractionsOverview> {
  const tInteractions = await getTranslations("Interactions");
  const locale = await getLocale();
  
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return emptyInteractionsOverview;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyInteractionsOverview;
  }

  const [commentsResponse, reactionsResponse] = await Promise.all([
    supabase
      .from("story_comments")
      .select("id, story_id, user_id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("story_reactions")
      .select("id, story_id, user_id, reaction_type, created_at")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (commentsResponse.error || reactionsResponse.error) {
    return emptyInteractionsOverview;
  }

  const commentRows = (commentsResponse.data ??
    []) as Array<Omit<InteractionCommentRow, "story_title">>;
  const reactionRows = (reactionsResponse.data ??
    []) as Array<Omit<InteractionReactionRow, "story_title">>;
  const storyIds = Array.from(
    new Set([
      ...commentRows.map((row) => row.story_id),
      ...reactionRows.map((row) => row.story_id),
    ])
  );
  const storyTitles = await getStoryTitles(storyIds);

  const comments: InteractionCommentRow[] = commentRows.map((row) => ({
    ...row,
    story_title: storyTitles.get(row.story_id) ?? null,
  }));

  const reactions: InteractionReactionRow[] = reactionRows.map((row) => ({
    ...row,
    story_title: storyTitles.get(row.story_id) ?? null,
  }));

  return {
    metrics: {
      commentCount: comments.length,
      reactionCount: reactions.length,
      storiesTouched: storyIds.length,
    },
    items: buildInteractionFeed({
      comments,
      reactions,
      locale,
      t: tInteractions as any
    }),
  };
}

export type FamilyQuestionView = {
  id: string;
  questionText: string;
  category: string;
  createdAtLabel: string;
  answeredAtLabel: string | null;
  recordingId: string | null;
  recordingTitle: string | null;
  seniorName: string;
};

export async function getFamilyQuestions(): Promise<FamilyQuestionView[]> {
  const locale = await getLocale();
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("family_questions")
    .select("id, question_text, category, created_at, answered_at, recording_id, senior_user_id")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching family questions:", error);
    return [];
  }

  const seniorIds = data.map((q) => q.senior_user_id);
  const recordingIds = data.map((q) => q.recording_id).filter(Boolean) as string[];

  // Fetch profiles & stories in parallel
  const [profilesRes, storiesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, full_name")
      .in("id", seniorIds),
    recordingIds.length > 0
      ? supabase
          .from("audio_recordings")
          .select("id, title")
          .in("id", recordingIds)
      : Promise.resolve({ data: null, error: null })
  ]);

  const profilesMap = new Map<string, string>();
  if (profilesRes.data) {
    for (const p of profilesRes.data) {
      profilesMap.set(p.id, p.display_name || p.full_name || "Unknown");
    }
  }

  const storiesMap = new Map<string, string>();
  if (storiesRes.data) {
    for (const s of storiesRes.data) {
      storiesMap.set(s.id, s.title || "Untitled memory");
    }
  }

  return data.map((row) => {
    const createdDate = row.created_at ? new Date(row.created_at) : new Date();
    const answeredDate = row.answered_at ? new Date(row.answered_at) : null;

    const formatter = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    return {
      id: row.id,
      questionText: row.question_text,
      category: row.category,
      createdAtLabel: formatter.format(createdDate),
      answeredAtLabel: answeredDate ? formatter.format(answeredDate) : null,
      recordingId: row.recording_id,
      recordingTitle: row.recording_id ? (storiesMap.get(row.recording_id) ?? "Untitled memory") : null,
      seniorName: profilesMap.get(row.senior_user_id) ?? "Elder",
    };
  });
}

