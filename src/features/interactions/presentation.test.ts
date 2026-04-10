import { describe, expect, it } from "vitest";
import {
  buildInteractionFeed,
  type InteractionCommentRow,
  type InteractionReactionRow,
} from "./presentation";

describe("interaction presentation", () => {
  it("merges comments and reactions into a descending activity feed", () => {
    const comments: InteractionCommentRow[] = [
      {
        id: "comment-1",
        story_id: "story-1",
        story_title: "Summer Train",
        user_id: "user-11111111",
        content: "Ask about the station clock next time.",
        created_at: "2026-04-07T08:10:00.000Z",
      },
    ];

    const reactions: InteractionReactionRow[] = [
      {
        id: "reaction-1",
        story_id: "story-2",
        story_title: null,
        user_id: "user-22222222",
        reaction_type: "heart",
        created_at: "2026-04-07T09:30:00.000Z",
      },
    ];

    const t = (key: string) => {
      const messages: Record<string, string> = {
        untitledStory: "Untitled memory",
        actorLabel: "Family",
        "kinds.comment": "comment",
        "kinds.reaction": "reaction",
        "kinds.heart": "Heart reaction",
      };
      return messages[key] || key;
    };

    expect(buildInteractionFeed({ comments, reactions, locale: "en", t })).toEqual([
      {
        id: "reaction-1",
        storyId: "story-2",
        storyTitle: "Untitled memory",
        actorLabel: "Family 22222222",
        kind: "reaction",
        body: "Heart reaction",
        timestampLabel: "April 7, 2026",
        sortValue: "2026-04-07T09:30:00.000Z",
      },
      {
        id: "comment-1",
        storyId: "story-1",
        storyTitle: "Summer Train",
        actorLabel: "Family 11111111",
        kind: "comment",
        body: "Ask about the station clock next time.",
        timestampLabel: "April 7, 2026",
        sortValue: "2026-04-07T08:10:00.000Z",
      },
    ]);
  });

  it("caps the feed size and handles invalid timestamps", () => {
    const comments: InteractionCommentRow[] = Array.from({ length: 14 }, (_, index) => ({
      id: `comment-${index}`,
      story_id: "story-1",
      story_title: "Archive",
      user_id: null,
      content: `Comment ${index}`,
      created_at: index === 13 ? "invalid-date" : `2026-04-${String(index + 1).padStart(2, "0")}T08:00:00.000Z`,
    }));

    const t = (key: string) => {
      if (key === "actorLabel") return "Family member";
      return key;
    };

    const feed = buildInteractionFeed({ comments, reactions: [], locale: "en", t });

    expect(feed).toHaveLength(12);
    expect(feed.at(-1)).toMatchObject({
      actorLabel: "Family member",
    });
  });
});
