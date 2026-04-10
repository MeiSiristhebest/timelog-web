"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface VoiceCommentPlayerProps {
  url: string;
}

export function VoiceCommentPlayer({ url }: VoiceCommentPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="group relative flex items-center gap-3 rounded-xl bg-accent/10 p-2 pr-4 transition hover:bg-accent/20">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
      
      <button
        onClick={togglePlay}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[#1e170d] transition hover:scale-105 active:scale-95"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
      </button>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-accent">Voice Reply</span>
          <Volume2 size={12} className="text-accent/40" />
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent/20">
          <div 
            className="h-full bg-accent transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
