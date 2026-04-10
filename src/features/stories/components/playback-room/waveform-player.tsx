"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { usePlayback } from "../../context/playback-context";
import { PlayCircle, PauseCircle, RotateCcw, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { shouldRefreshPlaybackUrl } from "../../playback";
import { cn } from "@/lib/utils";

interface WaveformPlayerProps {
  src: string;
  storyId: string;
  expiresAtEpochMs: number | null;
  onRefreshUrl: () => Promise<string>;
}

export function WaveformPlayer({
  src,
  storyId,
  expiresAtEpochMs,
  onRefreshUrl,
}: WaveformPlayerProps) {
  const t = useTranslations("Waveform");
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const {
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsBuffering,
    setStoryId,
  } = usePlayback();

  const [localSrc, setLocalSrc] = useState(src);
  const [isReady, setIsReady] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(212, 182, 122, 0.2)", // Muted Golden Sand
      progressColor: "#d4b67a", // Golden Sand Accent
      cursorColor: "#d4b67a",
      barWidth: 2,
      barGap: 3,
      barRadius: 4,
      height: 80,
      normalize: true,
      url: localSrc,
    });

    wavesurferRef.current = ws;
    setStoryId(storyId);

    ws.on("ready", () => {
      setIsReady(true);
      setDuration(ws.getDuration());
      setIsBuffering(false);
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("loading", () => setIsBuffering(true));
    
    ws.on("timeupdate", (currentTime) => {
      setCurrentTime(currentTime);
      
      // Dynamic HSL Shift for Waveform Color when playing
      if (ws.isPlaying()) {
        const hue = (currentTime * 15) % 360; // Fluid shift
        ws.setOptions({ progressColor: `hsla(${hue}, 45%, 72%, 0.85)` });
      }
    });

    ws.on("finish", () => {
      setIsPlaying(false);
      ws.setOptions({ progressColor: "#d4b67a" }); // Reset to theme gold
    });

    return () => {
      ws.destroy();
    };
  }, [localSrc, setDuration, setIsBuffering, setIsPlaying, setCurrentTime, setStoryId, storyId]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (!wavesurferRef.current) return;

    // Check expiry before playing
    if (expiresAtEpochMs && shouldRefreshPlaybackUrl({ expiresAtEpochMs })) {
        onRefreshUrl().then(newUrl => {
            setLocalSrc(newUrl);
            // WaveSurfer will re-init with new URL via useEffect dependency
        });
        return;
    }

    wavesurferRef.current.playPause();
  }, [expiresAtEpochMs, onRefreshUrl]);

  return (
    <div className="rounded-[1.5rem] border border-line bg-[linear-gradient(180deg,rgba(242,214,161,0.08),transparent)] p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="display text-2xl text-ink">
            {isPlaying ? t("nowListening") : t("player")}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {t("highFidelity")}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => wavesurferRef.current?.setTime(0)}
            className="p-2 rounded-full hover:bg-black/5 text-muted transition-colors"
            title={t("restart")}
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            onClick={togglePlay}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-black font-medium uppercase tracking-[0.1em] hover:bg-accent-strong transition-all active:scale-95 shadow-lg shadow-accent/20",
              isPlaying && "animate-pulse-subtle"
            )}
          >
            {isPlaying ? (
              <><PauseCircle size={20} className="fill-black/10" /> {t("pause")}</>
            ) : (
              <><PlayCircle size={20} className="fill-black/10" /> {t("play")}</>
            )}
          </button>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="w-full min-h-[80px] cursor-pointer"
      />
      
      {!isReady && (
        <div className="flex items-center justify-center h-[80px] -mt-[80px]">
           <RefreshCw className="animate-spin text-accent/50" size={24} />
        </div>
      )}

      <div className="mt-4 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted font-medium">
        <span>00:00</span>
        <span>{t("poweredBy")}</span>
        <span>{t("end")}</span>
      </div>
    </div>
  );
}
