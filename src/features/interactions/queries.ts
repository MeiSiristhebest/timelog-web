import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import {
  buildInteractionFeed,
  type InteractionCommentRow,
  type InteractionReactionRow,
  type InteractionItem,
} from "./presentation";
import { mockInteractions } from "@/lib/mock-data";

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
    return {
      metrics: { 
        commentCount: mockInteractions.filter(i => i.kind === "评论").length, 
        reactionCount: mockInteractions.filter(i => i.kind === "心意").length, 
        storiesTouched: new Set(mockInteractions.map(i => i.storyId)).size 
      },
      items: mockInteractions
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
       metrics: { 
         commentCount: mockInteractions.filter(i => i.kind === "评论").length, 
         reactionCount: mockInteractions.filter(i => i.kind === "心意").length, 
         storiesTouched: new Set(mockInteractions.map(i => i.storyId)).size 
       },
       items: mockInteractions
     };
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
     return {
       metrics: { 
         commentCount: mockInteractions.filter(i => i.kind === "评论").length, 
         reactionCount: mockInteractions.filter(i => i.kind === "心意").length, 
         storiesTouched: new Set(mockInteractions.map(i => i.storyId)).size 
       },
       items: mockInteractions
      };
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
      t: tInteractions
    }),
  };
}
