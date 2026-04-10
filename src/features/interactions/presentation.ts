export type InteractionCommentRow = {
  id: string;
  story_id: string;
  story_title: string | null;
  user_id: string | null;
  content: string;
  created_at: string | null;
};

export type InteractionReactionRow = {
  id: string;
  story_id: string;
  story_title: string | null;
  user_id: string | null;
  reaction_type: string | null;
  created_at: string | null;
};

export type InteractionItem = {
  id: string;
  storyId: string;
  storyTitle: string;
  actorLabel: string;
  kind: string;
  body: string;
  timestampLabel: string;
  sortValue: string;
};

function formatDateLabel(value: string | null, locale: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toSortValue(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

function deriveActorLabel(userId: string | null, t: any): string {
  if (!userId) return t("actorLabel");

  const compact = userId.replace(/[^a-zA-Z0-9]/g, "");
  if (compact.length <= 8) {
    return `${t("actorLabel")} ${compact}`;
  }

  return `${t("actorLabel")} ${compact.slice(-8)}`;
}

function describeReaction(type: string | null, t: any): string {
  const value = (type ?? "reaction").trim().toLowerCase();
  
  // Try to use typed reaction label from i18n
  // We'll assume Dashboard.reactionType exists or fallback to the type name
  return t(`kinds.${value}`) || `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function buildInteractionFeed({
  comments: rawComments,
  reactions: rawReactions,
  locale,
  t,
}: {
  comments: InteractionCommentRow[];
  reactions: InteractionReactionRow[];
  locale: string;
  t: any;
}): InteractionItem[] {
  const comments = rawComments.map((row) => ({
    id: row.id,
    storyId: row.story_id,
    storyTitle: (row.story_title?.trim() || t("untitledStory")),
    actorLabel: deriveActorLabel(row.user_id, t),
    kind: t("kinds.comment"),
    body: row.content,
    timestampLabel: formatDateLabel(row.created_at, locale),
    sortValue: toSortValue(row.created_at),
  }));

  const reactions = rawReactions.map((row) => ({
    id: row.id,
    storyId: row.story_id,
    storyTitle: (row.story_title?.trim() || t("untitledStory")),
    actorLabel: deriveActorLabel(row.user_id, t),
    kind: t("kinds.reaction"),
    body: describeReaction(row.reaction_type, t),
    timestampLabel: formatDateLabel(row.created_at, locale),
    sortValue: toSortValue(row.created_at),
  }));

  return [...comments, ...reactions]
    .sort((left, right) => right.sortValue.localeCompare(left.sortValue))
    .slice(0, 12);
}
