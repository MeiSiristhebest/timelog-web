"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  storyId: string | null;
}

interface PlaybackContextType extends PlaybackState {
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsBuffering: (buffering: boolean) => void;
  setStoryId: (id: string | null) => void;
  seekTo: (time: number) => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  const seekTo = useCallback((time: number) => {
    setSeekTime(time);
    setCurrentTime(time);
  }, []);

  // Internal use for components to consume the seek signal
  const consumeSeek = useCallback(() => {
    const time = seekTime;
    setSeekTime(null);
    return time;
  }, [seekTime]);

  const value = {
    isPlaying,
    currentTime,
    duration,
    isBuffering,
    storyId,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsBuffering,
    setStoryId,
    seekTo,
    // Note: seekTime and consumeSeek are technically internals but could be exposed if needed
  };

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error("usePlayback must be used within a PlaybackProvider");
  }
  return context;
}
