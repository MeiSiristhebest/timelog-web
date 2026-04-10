import { describe, expect, it } from "vitest";
import {
  buildStoryPlayback,
  buildWaveformBars,
  shouldRefreshPlaybackUrl,
} from "./playback";

describe("story playback contract", () => {
  it("exposes signed playback data when both path and signed url exist", () => {
    expect(
      buildStoryPlayback({
        filePath: "user-1/story-1.opus",
        signedUrl: "https://example.com/signed-audio",
        expiresInSeconds: 1800,
        nowEpochMs: 1_000,
      })
    ).toEqual({
      sourcePath: "user-1/story-1.opus",
      signedUrl: "https://example.com/signed-audio",
      expiresLabel: "30 min window",
      expiresAtEpochMs: 1_801_000,
      isReady: true,
    });
  });

  it("treats local or missing paths as unavailable for web playback", () => {
    expect(
      buildStoryPlayback({
        filePath: "file:///local/cache/story.wav",
        signedUrl: null,
        expiresInSeconds: 1800,
        nowEpochMs: 1_000,
      })
    ).toEqual({
      sourcePath: null,
      signedUrl: null,
      expiresLabel: null,
      expiresAtEpochMs: null,
      isReady: false,
    });
  });

  it("refreshes signed playback shortly before expiry", () => {
    expect(
      shouldRefreshPlaybackUrl({
        expiresAtEpochMs: 1_800_000,
        nowEpochMs: 1_700_000,
      })
    ).toBe(true);

    expect(
      shouldRefreshPlaybackUrl({
        expiresAtEpochMs: 1_800_000,
        nowEpochMs: 1_500_000,
      })
    ).toBe(false);
  });

  it("builds waveform bars with played, buffered, and ahead states", () => {
    expect(
      buildWaveformBars({
        barCount: 6,
        progressRatio: 0.5,
        bufferedRatio: 0.75,
        isBuffering: true,
      })
    ).toEqual([
      expect.objectContaining({ state: "played", isActive: false }),
      expect.objectContaining({ state: "played", isActive: false }),
      expect.objectContaining({ state: "played", isActive: true }),
      expect.objectContaining({ state: "buffered", isActive: false }),
      expect.objectContaining({ state: "buffered", isActive: false }),
      expect.objectContaining({ state: "ahead", isActive: false }),
    ]);
  });
});
