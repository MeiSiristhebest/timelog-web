export type CommentRow = {
  id: string;
  story_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
};

export type ReactionRow = {
  reaction_type: string | null;
};

export type StoryCommentItem = {
  id: string;
  userId: string | null;
  authorLabel: string;
  content: string;
  createdAtLabel: string;
  type: "text" | "audio";
  audioUrl?: string;
};

export type StoryReactionSummary = {
  type: string;
  count: number;
  label: string;
};

function formatDateLabel(value: string | number | null): string {
  if (!value) return "Unknown date";

  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function pluralizeReaction(type: string): string {
  if (type.endsWith("s")) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  return `${type.charAt(0).toUpperCase() + type.slice(1)}s`;
}

function toShortActorId(userId: string): string {
  const compact = userId.replace(/[^a-zA-Z0-9]/g, "");
  if (compact.length <= 8) return compact;
  return compact.slice(-8);
}

export function mapCommentRows(rows: CommentRow[]): StoryCommentItem[] {
  return rows.map((row) => {
    const isAudio = row.content.startsWith("[AUDIO]");
    const type = isAudio ? "audio" : "text";
    const content = isAudio ? "Voice Reply" : row.content;
    const audioUrl = isAudio ? row.content.replace("[AUDIO]", "").trim() : undefined;

    return {
      id: row.id,
      userId: row.user_id,
      authorLabel: row.user_id ? `Family ${toShortActorId(row.user_id)}` : "Family member",
      content,
      type,
      audioUrl,
      createdAtLabel: formatDateLabel(row.created_at),
    };
  });
}

export function mapReactionRows(rows: ReactionRow[]): StoryReactionSummary[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const type = row.reaction_type ?? "unknown";
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([type, count]) => ({
    type,
    count,
    label: pluralizeReaction(type),
  }));
}
