import { describe, expect, it } from "vitest";
import {
  buildInteractionRealtimeTargets,
  buildStoryDetailRealtimeTargets,
  buildStoryListRealtimeTargets,
} from "./subscriptions";

describe("realtime subscription targets", () => {
  it("includes story list refresh targets for story and interaction mutations", () => {
    expect(buildStoryListRealtimeTargets()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "audio_recordings", event: "INSERT" }),
        expect.objectContaining({ table: "story_comments", event: "INSERT" }),
        expect.objectContaining({ table: "story_reactions", event: "DELETE" }),
      ])
    );
  });

  it("filters story detail targets to the current story id", () => {
    expect(buildStoryDetailRealtimeTargets("story-123")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: "audio_recordings",
          filter: "id=eq.story-123",
        }),
        expect.objectContaining({
          table: "story_comments",
          filter: "story_id=eq.story-123",
        }),
      ])
    );
  });

  it("keeps the interactions inbox subscribed to both feed and activity facts", () => {
    expect(buildInteractionRealtimeTargets()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "story_comments", event: "UPDATE" }),
        expect.objectContaining({ table: "activity_events", event: "INSERT" }),
      ])
    );
  });
});
