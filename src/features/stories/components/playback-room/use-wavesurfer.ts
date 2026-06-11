"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { usePlayback } from "../../context/playback-context";

interface UseWaveSurferProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  src: string;
  storyId: string;
}

export function useWaveSurfer({
  containerRef,
  src,
  storyId,
}: UseWaveSurferProps) {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);

  const {
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsBuffering,
    setStoryId,
  } = usePlayback();

  // Vercel React Best Practice: advanced-event-handler-refs
  // Store playback setters in a stable ref to prevent WaveSurfer from re-initializing on setter changes
  const settersRef = useRef({
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsBuffering,
    setStoryId,
  });

  useEffect(() => {
    settersRef.current = {
      setIsPlaying,
      setCurrentTime,
      setDuration,
      setIsBuffering,
      setStoryId,
    };
  }, [setIsPlaying, setCurrentTime, setDuration, setIsBuffering, setStoryId]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(212, 182, 122, 0.2)",
      progressColor: "#d4b67a",
      cursorColor: "#d4b67a",
      barWidth: 2,
      barGap: 3,
      barRadius: 4,
      height: 80,
      normalize: true,
      url: src,
    });

    wavesurferRef.current = ws;
    setWavesurfer(ws);
    settersRef.current.setStoryId(storyId);
    setIsReady(false);
    settersRef.current.setIsBuffering(true);

    const handleReady = () => {
      setIsReady(true);
      settersRef.current.setDuration(ws.getDuration());
      settersRef.current.setIsBuffering(false);
    };

    const handlePlay = () => settersRef.current.setIsPlaying(true);
    const handlePause = () => settersRef.current.setIsPlaying(false);
    const handleLoading = () => settersRef.current.setIsBuffering(true);

    const handleTimeUpdate = (currentTime: number) => {
      settersRef.current.setCurrentTime(currentTime);
      
      if (ws.isPlaying()) {
        const hue = (currentTime * 15) % 360;
        ws.setOptions({ progressColor: `hsla(${hue}, 45%, 72%, 0.85)` });
      }
    };

    const handleFinish = () => {
      settersRef.current.setIsPlaying(false);
      ws.setOptions({ progressColor: "#d4b67a" });
    };

    ws.on("ready", handleReady);
    ws.on("play", handlePlay);
    ws.on("pause", handlePause);
    ws.on("loading", handleLoading);
    ws.on("timeupdate", handleTimeUpdate);
    ws.on("finish", handleFinish);

    const handleHfSeek = (event: Event) => {
      const customEvent = event as CustomEvent<{ time: number }>;
      if (customEvent.detail && typeof customEvent.detail.time === "number") {
        ws.setTime(customEvent.detail.time);
      }
    };

    const containerElement = containerRef.current;
    containerElement?.addEventListener("hf-seek", handleHfSeek);

    return () => {
      containerElement?.removeEventListener("hf-seek", handleHfSeek);
      ws.un("ready", handleReady);
      ws.un("play", handlePlay);
      ws.un("pause", handlePause);
      ws.un("loading", handleLoading);
      ws.un("timeupdate", handleTimeUpdate);
      ws.un("finish", handleFinish);
      ws.destroy();
      wavesurferRef.current = null;
      setWavesurfer(null);
    };
  }, [src, storyId, containerRef]);

  const togglePlay = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }, []);

  const setTime = useCallback((time: number) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setTime(time);
    }
  }, []);

  return {
    wavesurfer,
    isReady,
    isPlaying,
    togglePlay,
    setTime,
  };
}
