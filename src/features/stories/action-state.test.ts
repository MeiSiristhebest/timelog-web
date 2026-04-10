import { describe, expect, it } from "vitest";
import {
  normalizeReactionType,
  validateStoryCommentContent,
} from "./action-state";

describe("story action state helpers", () => {
  it("trims valid comment content", () => {
    expect(validateStoryCommentContent("  A memory worth saving.  ")).toEqual({
      ok: true,
      value: "A memory worth saving.",
    });
  });

  it("rejects empty comment content", () => {
    expect(validateStoryCommentContent("   ")).toEqual({
      ok: false,
      error: "Comment cannot be empty.",
    });
  });

  it("rejects oversized comment content", () => {
    expect(validateStoryCommentContent("a".repeat(1001))).toEqual({
      ok: false,
      error: "Comment must stay within 1000 characters.",
    });
  });

  it("normalizes supported reaction types and falls back to heart", () => {
    expect(normalizeReactionType("clap")).toBe("clap");
    expect(normalizeReactionType("heart")).toBe("heart");
    expect(normalizeReactionType("unexpected")).toBe("heart");
  });
});
