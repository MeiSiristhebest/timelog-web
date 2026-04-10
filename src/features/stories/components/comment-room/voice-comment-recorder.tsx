"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Check, Volume2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface VoiceCommentRecorderProps {
  onRecordingComplete: (file: File) => void;
  onCancel: () => void;
}

export function VoiceCommentRecorder({
  onRecordingComplete,
  onCancel,
}: VoiceCommentRecorderProps) {
  const t = useTranslations();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert(t("Interactions.micAccessRequired") || "Please allow microphone access to record voice replies.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleConfirm = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], "reply.webm", { type: "audio/webm" });
      onRecordingComplete(file);
    }
  };

  const handleDiscard = () => {
    setAudioUrl(null);
    setRecordedBlob(null);
    setDuration(0);
    if (!audioUrl && !isRecording) {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-accent/20 bg-accent/5 p-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[#1e170d]">
        {isRecording ? (
          <div className="h-3 w-3 animate-pulse rounded-full bg-danger" />
        ) : (
          <Volume2 size={20} />
        )}
      </div>

      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          {isRecording ? t("Interactions.vRec_recording") : audioUrl ? t("Interactions.vRec_captured") : t("Interactions.vRec_title")}
        </p>
        <p className="text-lg font-semibold text-ink font-mono tabular-nums">
          {formatTime(duration)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[#1e170d] transition hover:scale-110 active:scale-95"
          >
            <Mic size={20} />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white hover:bg-black/80"
          >
            <Square size={18} fill="currentColor" />
          </button>
        )}

        {audioUrl && (
          <>
            <button
              onClick={handleDiscard}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-danger/20 text-danger hover:bg-danger/10"
              title={t("Common.cancel")}
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={handleConfirm}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white hover:bg-success/90"
              title={t("Common.confirm")}
            >
              <Check size={20} />
            </button>
          </>
        )}

        {!isRecording && !audioUrl && (
          <button
            onClick={onCancel}
            type="button"
            className="px-2 text-xs font-medium text-ink/40 hover:text-ink"
          >
            {t("Common.cancel")}
          </button>
        )}
      </div>
    </div>
  );
}
