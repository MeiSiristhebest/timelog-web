const MAX_COMMENT_LENGTH = 1000;
const SUPPORTED_REACTION_TYPES = new Set(["heart", "clap", "listen"]);

export function validateStoryCommentContent(input: string): {
  ok: true;
  value: string;
} | {
  ok: false;
  error: string;
} {
  const value = input.trim();

  if (!value) {
    return {
      ok: false,
      error: "Comment cannot be empty.",
    };
  }

  if (value.length > MAX_COMMENT_LENGTH) {
    return {
      ok: false,
      error: `Comment must stay within ${MAX_COMMENT_LENGTH} characters.`,
    };
  }

  return {
    ok: true,
    value,
  };
}

export function normalizeReactionType(input: string): string {
  const value = input.trim().toLowerCase();
  return SUPPORTED_REACTION_TYPES.has(value) ? value : "heart";
}
