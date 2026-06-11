import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { StoryCard } from "./story-card";

// Mock the hook and components
vi.mock("@/lib/hooks/use-intersection-observer", () => ({
  useIntersectionObserver: vi.fn(() => ({
    ref: vi.fn(),
    entry: { isIntersecting: true },
  })),
}));

vi.mock("@/lib/routes", () => ({
  storyRoute: vi.fn((id) => `/stories/${id}`),
}));

const mockStory = {
  id: "1",
  title: "Test Story",
  speakerLabel: "Test Speaker",
  startedAtLabel: "Today",
  durationLabel: "5m",
  syncStatus: "synced",
  transcriptPreview: "This is a test transcript.",
  commentCount: 2,
  reactionCount: 5,
  isFavorite: false,
};

const messages = {
  Stories: {
    comments: "{count} comments",
    reactions: "{count} reactions",
    statusSynced: "Synced",
    statusSyncing: "Syncing...",
  },
};

function renderStoryCard() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <StoryCard story={mockStory} index={0} />
    </NextIntlClientProvider>
  );
}

describe("StoryCard", () => {
  it("renders story details correctly", () => {
    renderStoryCard();

    expect(screen.getByText("Test Story")).toBeDefined();
    expect(screen.getByText(/Test Speaker/)).toBeDefined();
    expect(screen.getByText("Synced")).toBeDefined();
    expect(screen.getByText("This is a test transcript.")).toBeDefined();
    expect(screen.getByText("2 comments")).toBeDefined();
    expect(screen.getByText("5 reactions")).toBeDefined();
  });

  it("links to the correct story route", () => {
    renderStoryCard();
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/stories/1");
  });
});
