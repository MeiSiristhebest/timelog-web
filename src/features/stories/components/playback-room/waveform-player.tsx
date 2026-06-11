"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { PlayCircle, PauseCircle, RotateCcw, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { shouldRefreshPlaybackUrl } from "../../playback";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useWaveSurfer } from "./use-wavesurfer";

gsap.registerPlugin(useGSAP);

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
  const [localSrc, setLocalSrc] = useState(src);

  // Sync localSrc when src prop changes
  useEffect(() => {
    setLocalSrc(src);
  }, [src]);

  // Use our high-performance custom hook
  const { isReady, isPlaying, togglePlay, setTime } = useWaveSurfer({
    containerRef,
    src: localSrc,
    storyId,
  });

  const playerRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const pulseTweenRef = useRef<gsap.core.Tween | null>(null);
  const buttonPulseRef = useRef<gsap.core.Tween | null>(null);

  const { contextSafe } = useGSAP({ scope: playerRef });

  // Handle playing state breathing pulse
  useGSAP(() => {
    if (isPlaying) {
      // Start elegant breathing pulse on wavesurfer container
      pulseTweenRef.current = gsap.fromTo(
        containerRef.current,
        {
          filter: "drop-shadow(0 0 2px rgba(212, 182, 122, 0.3))",
        },
        {
          filter: "drop-shadow(0 0 8px rgba(212, 182, 122, 0.7))",
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        }
      );

      // Start elegant breathing pulse on play button shadow/glow
      buttonPulseRef.current = gsap.fromTo(
        playButtonRef.current,
        {
          boxShadow: "0 10px 20px -5px rgba(212, 182, 122, 0.2), 0 0 0 0 rgba(212, 182, 122, 0)",
        },
        {
          boxShadow: "0 12px 24px -4px rgba(212, 182, 122, 0.45), 0 0 12px 4px rgba(212, 182, 122, 0.25)",
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        }
      );
    } else {
      if (pulseTweenRef.current) {
        pulseTweenRef.current.kill();
        pulseTweenRef.current = null;
      }
      if (buttonPulseRef.current) {
        buttonPulseRef.current.kill();
        buttonPulseRef.current = null;
      }
      gsap.killTweensOf(containerRef.current);
      gsap.killTweensOf(playButtonRef.current);
      gsap.set(containerRef.current, { clearProps: "filter" });
      gsap.set(playButtonRef.current, { clearProps: "boxShadow" });
    }
  }, { dependencies: [isPlaying], scope: playerRef });

  const handleMouseEnter = contextSafe((e: React.MouseEvent) => {
    // Hover entry animation for player container
    gsap.to(e.currentTarget, {
      borderColor: "rgba(212, 182, 122, 0.3)",
      boxShadow: "0 12px 40px -12px rgba(212, 182, 122, 0.1)",
      duration: 0.4,
      ease: "power2.out",
    });
  });

  const handleMouseLeave = contextSafe((e: React.MouseEvent) => {
    // Reset hover animations
    gsap.to(e.currentTarget, {
      borderColor: "rgba(255, 255, 255, 0.08)", // default border-line color
      boxShadow: "0 0 0 0 rgba(0,0,0,0)",
      duration: 0.4,
      ease: "power2.out",
      clearProps: "borderColor,boxShadow",
    });
  });

  // Handle Play/Pause with expiry check
  const handlePlayPause = useCallback(() => {
    if (expiresAtEpochMs && shouldRefreshPlaybackUrl({ expiresAtEpochMs })) {
      onRefreshUrl().then((newUrl) => {
        setLocalSrc(newUrl);
      });
      return;
    }
    togglePlay();
  }, [expiresAtEpochMs, onRefreshUrl, togglePlay]);

  return (
    <div
      ref={playerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="rounded-[1.5rem] border border-line bg-[linear-gradient(180deg,rgba(242,214,161,0.08),transparent)] p-6 transition-all duration-500"
    >
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
            onClick={() => setTime(0)}
            className="p-2 rounded-full hover:bg-black/5 text-muted transition-colors"
            title={t("restart")}
          >
            <RotateCcw size={20} />
          </button>
          
          <button
            ref={playButtonRef}
            onClick={handlePlayPause}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-black font-medium uppercase tracking-[0.1em] hover:bg-accent-strong transition-all active:scale-95 shadow-lg shadow-accent/20"
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
