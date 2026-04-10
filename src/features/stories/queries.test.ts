import { describe, expect, it } from "vitest";
import {
  mapCommentRows,
  mapReactionRows,
  type CommentRow,
  type ReactionRow,
} from "./presentation";

describe("story query mappers", () => {
  it("maps comment rows into display-ready comment items", () => {
    const rows: CommentRow[] = [
      {
        id: "comment-1",
        story_id: "story-1",
        user_id: "user-12345678",
        content: "I had never heard this part before.",
        created_at: "2026-04-07T08:00:00.000Z",
      },
      {
        id: "comment-2",
        story_id: "story-1",
        user_id: null,
        content: "Thank you for sharing this memory.",
        created_at: "invalid-date",
      },
    ];

    expect(mapCommentRows(rows)).toEqual([
      {
        id: "comment-1",
        authorLabel: "Family 12345678",
        content: "I had never heard this part before.",
        createdAtLabel: "April 7, 2026",
      },
      {
        id: "comment-2",
        authorLabel: "Family member",
        content: "Thank you for sharing this memory.",
        createdAtLabel: "Unknown date",
      },
    ]);
  });

  it("aggregates reaction rows by type", () => {
    const rows: ReactionRow[] = [
      { reaction_type: "heart" },
      { reaction_type: "heart" },
      { reaction_type: "clap" },
      { reaction_type: null },
    ];

    expect(mapReactionRows(rows)).toEqual([
      { type: "heart", count: 2, label: "Hearts" },
      { type: "clap", count: 1, label: "Claps" },
      { type: "unknown", count: 1, label: "Unknowns" },
    ]);
  });
});
