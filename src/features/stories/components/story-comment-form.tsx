"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Mic, MessageSquare, Type } from "lucide-react";
import { addStoryCommentAction, type StoryActionState } from "../actions";
import { VoiceCommentRecorder } from "./comment-room/voice-comment-recorder";
import { useTranslations } from "next-intl";

const initialState: StoryActionState = {
  status: "idle",
  message: null,
};

function SubmitButton({ label, disabled, className }: { label: string; disabled?: boolean; className?: string }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`rounded-xl border border-accent/40 bg-accent px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-[#1e170d] transition hover:bg-accent-strong disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-accent/10 active:scale-95 ${className || ""}`}
    >
      {label}
    </button>
  );
}

interface StoryCommentFormProps {
  storyId: string;
  initialIsRecordingMode?: boolean;
}

export function StoryCommentForm({ storyId, initialIsRecordingMode = false }: StoryCommentFormProps) {
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addStoryCommentAction, initialState);
  const [isRecordingMode, setIsRecordingMode] = useState(initialIsRecordingMode);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setAudioFile(null);
      setIsRecordingMode(false);
    }
  }, [state.status]);

  const handleRecordingComplete = (file: File) => {
    setAudioFile(file);
  };

  const handleAction = (formData: FormData) => {
    if (audioFile) {
      formData.append("audio", audioFile);
    }
    formAction(formData);
  };

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="display text-2xl text-ink tracking-tight">{t("Interactions.formTitle")}</h3>
        <button
          type="button"
          onClick={() => {
            setIsRecordingMode(!isRecordingMode);
            setAudioFile(null);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent/10 text-accent font-black text-[10px] uppercase tracking-widest hover:bg-accent/20 transition-all border border-accent/20"
        >
          {isRecordingMode ? (
            <>
              <Type className="h-3 w-3" />
              {t("Interactions.switchText")}
            </>
          ) : (
            <>
              <Mic className="h-3 w-3" />
              {t("Interactions.sendVoice")}
            </>
          )}
        </button>
      </div>

      <form ref={formRef} action={handleAction} className="space-y-4">
        <input type="hidden" name="storyId" value={storyId} />

        {isRecordingMode ? (
          <div className="py-4">
            <VoiceCommentRecorder
              onRecordingComplete={handleRecordingComplete}
              onCancel={() => setIsRecordingMode(false)}
            />
          </div>
        ) : (
          <textarea
            name="content"
            placeholder={t("Interactions.placeholder")}
            required={!audioFile}
            className="w-full p-6 text-lg leading-relaxed text-ink bg-canvas border-2 border-line/30 rounded-[2rem] focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none resize-none min-h-[160px] transition-all placeholder:text-muted/40 font-medium"
          />
        )}

        {state.status === "error" && (
          <p className="rounded-lg bg-danger/10 p-3 text-xs font-medium text-danger animate-in fade-in">
            {state.message}
          </p>
        )}
        
        {state.status === "success" && (
          <p className="rounded-lg bg-success/10 p-3 text-xs font-medium text-success animate-in fade-in">
            {state.message}
          </p>
        )}

        <div className="flex justify-end mt-4">
          <SubmitButton 
            className="rounded-full px-10 py-5 bg-accent text-white shadow-xl shadow-accent/20"
            label={state.status === "idle" ? (isRecordingMode ? t("Interactions.postVoice") : t("Interactions.postComment")) : t("Common.processing")} 
            disabled={state.status !== "idle" || (isRecordingMode && !audioFile)}
          />
        </div>
      </form>
    </div>
  );
}
