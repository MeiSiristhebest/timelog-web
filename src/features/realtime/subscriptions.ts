export type RealtimeTarget = {
  event: "INSERT" | "UPDATE" | "DELETE";
  schema: "public";
  table: "audio_recordings" | "story_comments" | "story_reactions" | "activity_events";
  filter?: string;
};

function byStoryId(storyId: string): string {
  return `story_id=eq.${storyId}`;
}

/**
 * @deprecated Use buildStoryListRealtimeTargets instead.
 */
export function buildStoriesRealtimeTargets(): RealtimeTarget[] {
  return buildStoryListRealtimeTargets();
}

export function buildStoryListRealtimeTargets(): RealtimeTarget[] {
  return [
    { event: "INSERT", schema: "public", table: "audio_recordings" },
    { event: "UPDATE", schema: "public", table: "audio_recordings" },
    { event: "DELETE", schema: "public", table: "audio_recordings" },
    { event: "INSERT", schema: "public", table: "story_comments" },
    { event: "DELETE", schema: "public", table: "story_comments" },
    { event: "INSERT", schema: "public", table: "story_reactions" },
    { event: "DELETE", schema: "public", table: "story_reactions" },
  ];
}

export function buildStoryDetailRealtimeTargets(storyId: string): RealtimeTarget[] {
  const filter = byStoryId(storyId);
  return [
    { event: "UPDATE", schema: "public", table: "audio_recordings", filter: `id=eq.${storyId}` },
    { event: "INSERT", schema: "public", table: "story_comments", filter },
    { event: "UPDATE", schema: "public", table: "story_comments", filter },
    { event: "DELETE", schema: "public", table: "story_comments", filter },
    { event: "INSERT", schema: "public", table: "story_reactions", filter },
    { event: "DELETE", schema: "public", table: "story_reactions", filter },
  ];
}

export function buildInteractionRealtimeTargets(): RealtimeTarget[] {
  return [
    { event: "INSERT", schema: "public", table: "story_comments" },
    { event: "UPDATE", schema: "public", table: "story_comments" },
    { event: "DELETE", schema: "public", table: "story_comments" },
    { event: "INSERT", schema: "public", table: "story_reactions" },
    { event: "DELETE", schema: "public", table: "story_reactions" },
    { event: "INSERT", schema: "public", table: "activity_events" },
    { event: "UPDATE", schema: "public", table: "activity_events" },
  ];
}
