export type StoryPlayback = {
  sourcePath: string | null;
  signedUrl: string | null;
  expiresLabel: string | null;
  expiresAtEpochMs: number | null;
  isReady: boolean;
};

export type WaveformBarState = "played" | "buffered" | "ahead";

export type WaveformBar = {
  id: string;
  height: number;
  state: WaveformBarState;
  isActive: boolean;
};

const PLAYBACK_REFRESH_WINDOW_MS = 2 * 60 * 1000;
const BASE_WAVEFORM_PATTERN = [0.34, 0.52, 0.78, 0.63, 0.88, 0.47, 0.72, 0.58];
export const PLAYBACK_SIGNED_URL_TTL_SECONDS = 1800;

function isRemoteStoragePath(value: string | null): value is string {
  if (!value) return false;
  if (value.startsWith("file://")) return false;
  if (value === "OFFLOADED") return false;
  return value.includes("/");
}

function formatExpiry(seconds: number): string | null {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 1) {
    return "under 1 min window";
  }

  return `${minutes} min window`;
}

export function buildStoryPlayback(input: {
  filePath: string | null;
  signedUrl: string | null;
  expiresInSeconds: number;
  nowEpochMs?: number;
}): StoryPlayback {
  if (!isRemoteStoragePath(input.filePath) || !input.signedUrl) {
    return {
      sourcePath: null,
      signedUrl: null,
      expiresLabel: null,
      expiresAtEpochMs: null,
      isReady: false,
    };
  }

  const nowEpochMs = input.nowEpochMs ?? Date.now();

  return {
    sourcePath: input.filePath,
    signedUrl: input.signedUrl,
    expiresLabel: formatExpiry(input.expiresInSeconds),
    expiresAtEpochMs: nowEpochMs + input.expiresInSeconds * 1000,
    isReady: true,
  };
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(value, 1));
}

export function shouldRefreshPlaybackUrl(input: {
  expiresAtEpochMs: number | null;
  nowEpochMs?: number;
}): boolean {
  if (!input.expiresAtEpochMs) {
    return true;
  }

  const nowEpochMs = input.nowEpochMs ?? Date.now();
  return input.expiresAtEpochMs - nowEpochMs <= PLAYBACK_REFRESH_WINDOW_MS;
}

export function buildWaveformBars(input: {
  barCount: number;
  progressRatio: number;
  bufferedRatio: number;
  isBuffering: boolean;
}): WaveformBar[] {
  const barCount = Math.max(1, Math.floor(input.barCount));
  const progressRatio = clampRatio(input.progressRatio);
  const bufferedRatio = Math.max(progressRatio, clampRatio(input.bufferedRatio));
  const activeIndex = Math.max(0, Math.ceil(progressRatio * barCount) - 1);

  return Array.from({ length: barCount }, (_, index) => {
    const ratio = (index + 0.5) / barCount;
    const state: WaveformBarState =
      ratio <= progressRatio ? "played" : ratio <= bufferedRatio ? "buffered" : "ahead";

    return {
      id: `bar-${index}`,
      height: BASE_WAVEFORM_PATTERN[index % BASE_WAVEFORM_PATTERN.length],
      state,
      isActive: input.isBuffering && index === activeIndex,
    };
  });
}
