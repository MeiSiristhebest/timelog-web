"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildWaveformBars,
  shouldRefreshPlaybackUrl,
} from "../playback";
import { useTranslations } from "next-intl";

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainder = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainder
    .toString()
    .padStart(2, "0")}`;
}

export function StoryAudioPlayer({
  storyId,
  src,
  durationLabel,
  expiresAtEpochMs,
  expiresLabel,
}: {
  storyId: string;
  src: string;
  durationLabel: string;
  expiresAtEpochMs: number | null;
  expiresLabel: string | null;
}) {
  const t = useTranslations("Waveform");
  const audioRef = useRef<HTMLAudioElement>(null);
  const resumeTimeRef = useRef<number | null>(null);
  const [sourceUrl, setSourceUrl] = useState(src);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [playbackExpiry, setPlaybackExpiry] = useState<number | null>(
    expiresAtEpochMs
  );

  const refreshPlayback = useCallback(
    async (reason: "manual" | "expired" | "error") => {
      if (isRefreshing) return;

      setIsRefreshing(true);
      setRefreshError(null);

      const audio = audioRef.current;
      const shouldResume = Boolean(audio && !audio.paused);
      resumeTimeRef.current = audio?.currentTime ?? currentTime;

      try {
        const response = await fetch(`/api/stories/${storyId}/playback`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Playback refresh failed (${response.status})`);
        }

        const payload = (await response.json()) as {
          signedUrl?: string;
          expiresAtEpochMs?: number | null;
        };

        if (!payload.signedUrl) {
          throw new Error("Playback refresh returned no signed URL");
        }

        const signedUrl = payload.signedUrl;
        startTransition(() => {
          setSourceUrl(signedUrl);
          setPlaybackExpiry(payload.expiresAtEpochMs ?? null);
        });

        if (audio) {
          audio.pause();
          audio.src = signedUrl;
          audio.load();

          if (shouldResume || reason === "expired") {
            void audio.play().catch(() => {
              setIsPlaying(false);
            });
          }
        }
      } catch (error) {
        setRefreshError(
          error instanceof Error ? error.message : "Playback refresh failed"
        );
      } finally {
        setIsRefreshing(false);
      }
    },
    [currentTime, isRefreshing, storyId]
  );

  const progress = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min((currentTime / duration) * 100, 100);
  }, [currentTime, duration]);

  const bufferedProgress = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min((bufferedEnd / duration) * 100, 100);
  }, [bufferedEnd, duration]);

  const waveformBars = useMemo(
    () =>
      buildWaveformBars({
        barCount: 48,
        progressRatio: progress / 100,
        bufferedRatio: bufferedProgress / 100,
        isBuffering,
      }),
    [bufferedProgress, isBuffering, progress]
  );

  const statusLabel = useMemo(() => {
    if (refreshError) return t("refreshFailed");
    if (isRefreshing) return t("refreshing");
    if (isBuffering) return t("buffering");
    if (isPlaying) return t("nowListening");
    return t("ready");
  }, [isBuffering, isPlaying, isRefreshing, refreshError, t]);

  useEffect(() => {
    setSourceUrl(src);
    setPlaybackExpiry(expiresAtEpochMs);
    setRefreshError(null);
  }, [expiresAtEpochMs, src]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (
        shouldRefreshPlaybackUrl({
          expiresAtEpochMs: playbackExpiry,
        })
      ) {
        void refreshPlayback("expired");
      }
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [playbackExpiry, refreshPlayback]);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (
      shouldRefreshPlaybackUrl({
        expiresAtEpochMs: playbackExpiry,
      })
    ) {
      void refreshPlayback("expired");
      return;
    }

    if (audio.paused) {
      void audio.play();
      return;
    }

    audio.pause();
  }

  function handleSeek(nextValue: string) {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Number(nextValue);
    if (!Number.isFinite(nextTime)) return;

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  return (
    <div className="rounded-[1.25rem] border border-line bg-[linear-gradient(180deg,rgba(242,214,161,0.12),transparent)] p-5">
      <audio
        ref={audioRef}
        src={sourceUrl}
        preload="metadata"
        onLoadStart={() => setIsBuffering(true)}
        onCanPlay={(event) => {
          setIsBuffering(false);
          const audio = event.currentTarget;
          if (resumeTimeRef.current !== null) {
            audio.currentTime = Math.min(
              resumeTimeRef.current,
              audio.duration || resumeTimeRef.current
            );
            setCurrentTime(audio.currentTime);
            resumeTimeRef.current = null;
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
          const buffered = event.currentTarget.buffered;
          const end = buffered.length
            ? buffered.end(buffered.length - 1)
            : event.currentTarget.currentTime;
          setBufferedEnd(end);
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
        }}
        onError={() => {
          if (
            shouldRefreshPlaybackUrl({
              expiresAtEpochMs: playbackExpiry,
            })
          ) {
            void refreshPlayback("error");
            return;
          }
          setRefreshError("Protected stream could not be loaded.");
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="display text-3xl text-ink">
            {statusLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Protected stream from Supabase Storage. Story length {durationLabel}.{" "}
            {expiresLabel ? `Access window ${expiresLabel}.` : null}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void refreshPlayback("manual")}
            className="rounded-full border border-line bg-black/10 px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] text-muted transition hover:border-line-strong hover:text-ink"
          >
            {isRefreshing ? t("refreshing") : t("renewAccess")}
          </button>
          <button
            type="button"
            onClick={togglePlayback}
            className="rounded-full border border-line-strong bg-accent px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-black transition hover:bg-accent-strong"
          >
            {isPlaying ? t("pause") : t("play")}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex h-24 items-end gap-1 rounded-[1rem] border border-line bg-[radial-gradient(circle_at_left,rgba(242,214,161,0.14),transparent_40%),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] px-3 pb-3 [background-size:100%_100%,18px_100%]">
          {waveformBars.map((bar) => {
            const colorClass =
              bar.state === "played"
                ? "bg-accent"
                : bar.state === "buffered"
                  ? "bg-accent/50"
                  : "bg-white/10";

            return (
              <div
                key={bar.id}
                className={`flex-1 rounded-full transition-all ${colorClass} ${
                  bar.isActive ? "opacity-100" : "opacity-80"
                }`}
                style={{
                  height: `${Math.max(bar.height * 100, 18)}%`,
                  boxShadow: bar.isActive
                    ? "0 0 18px rgba(242,214,161,0.45)"
                    : undefined,
                }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>{t("percentBuffered", { percent: Math.round(bufferedProgress) })}</span>
          <span>{refreshError ?? statusLabel}</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white/20 transition-[width]"
            style={{ width: `${bufferedProgress}%` }}
          />
          <div
            className="-mt-1.5 h-full rounded-full bg-[linear-gradient(90deg,rgba(242,214,161,0.9),rgba(242,214,161,0.35))] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || currentTime)}
          onChange={(event) => handleSeek(event.target.value)}
          className="mt-4 w-full accent-[var(--accent)]"
        />
        <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
}
