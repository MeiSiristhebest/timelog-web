"use client";

import { usePlayback } from "../../context/playback-context";
import { useEffect, useRef, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PenLine, Save, X, Loader2, User, Bot } from "lucide-react";
import { updateStoryTranscriptionAction } from "../../actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { StoryTranscriptSegment } from "../../queries";

interface InteractiveTranscriptProps {
  storyId: string;
  content: string;
  segments: StoryTranscriptSegment[];
  speakerName?: string;
}

/** Format ms offset as mm:ss timestamp badge */
function formatTimestamp(ms: number | null): string | null {
  if (!ms || ms < 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function InteractiveTranscript({ storyId, content, segments, speakerName }: InteractiveTranscriptProps) {
  const t = useTranslations("Stories");
  const { currentTime } = usePlayback();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedText(content);
  }, [content]);

  // Find the active segment index based on audio playback position
  const activeIndex = useMemo(() => {
    if (segments.length === 0) return -1;
    const currentMs = currentTime * 1000;
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      const startMs = seg.startTimeMs ?? 0;
      if (currentMs >= startMs) return i;
    }
    return -1;
  }, [segments, currentTime]);

  // Auto-scroll active segment into view
  useEffect(() => {
    if (activeIndex < 0 || !containerRef.current) return;
    const activeEl = containerRef.current.querySelector(`[data-seg-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateStoryTranscriptionAction(storyId, editedText);
    setIsSaving(false);

    if (result.status === "success") {
      toast.success(result.message);
      setIsEditing(false);
    } else {
      toast.error(result.message);
    }
  };

  // Determine whether to show structured segments or fall back to plain text
  const hasStructuredSegments = segments.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="eyebrow">{t("transcriptTitle")}</h3>
          {isEditing && (
            <span className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent-strong rounded-full font-bold tracking-tighter animate-pulse">
              {t("editing")}
            </span>
          )}
          {hasStructuredSegments && !isEditing && (
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full font-bold tracking-tighter border border-emerald-500/20">
              {t("dialogueMode")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full hover:bg-canvas-depth transition-colors text-muted hover:text-accent-strong"
              title={t("editTranscript")}
            >
              <PenLine className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 rounded-full hover:bg-accent/10 transition-colors text-accent-strong disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(content);
                }}
                className="p-2 rounded-full hover:bg-red-500/10 transition-colors text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="h-4 w-[1px] bg-line mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium italic">{t("statusSynced")}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-2 scroll-smooth custom-scrollbar"
      >
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-full min-h-[400px] p-6 text-lg leading-relaxed text-ink bg-canvas-depth border border-line rounded-[1.5rem] focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none font-serif"
            placeholder={t("transcriptPlaceholder")}
          />
        ) : hasStructuredSegments ? (
          /* ── Structured Dialogue View (AI / User bubbles) ── */
          <div className="space-y-4 py-2">
            {segments.map((seg, index) => {
              const isUser = seg.speaker === "user";
              const isActive = index === activeIndex;
              const timestamp = formatTimestamp(seg.startTimeMs);

              return (
                <div
                  key={seg.id}
                  data-seg-index={index}
                  className={cn(
                    "flex gap-3 transition-all duration-300",
                    isUser ? "flex-row" : "flex-row-reverse",
                    !isActive && "opacity-50"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 ring-2",
                      isUser
                        ? "bg-amber-100 ring-amber-300/50"
                        : "bg-indigo-100 ring-indigo-300/50"
                    )}
                  >
                    {isUser ? (
                      <User className="h-4 w-4 text-amber-700" />
                    ) : (
                      <Bot className="h-4 w-4 text-indigo-700" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={cn("flex flex-col gap-1 max-w-[78%]", isUser ? "items-start" : "items-end")}>
                    {/* Speaker label */}
                    <span className={cn("text-[10px] font-bold uppercase tracking-[0.15em]", isUser ? "text-amber-600" : "text-indigo-500")}>
                      {isUser ? (speakerName || t("speakerUser")) : t("speakerAI")}
                    </span>

                    {/* Text bubble */}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-[15px] leading-relaxed transition-all duration-300",
                        isUser
                          ? "rounded-tl-sm bg-canvas-elevated border border-line/60 text-ink"
                          : "rounded-tr-sm bg-indigo-50 border border-indigo-200/60 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800/40 dark:text-indigo-100",
                        isActive && (isUser
                          ? "border-amber-400/40 bg-amber-50/80 shadow-sm dark:bg-amber-950/30"
                          : "border-indigo-400/40 bg-indigo-100/80 shadow-sm dark:bg-indigo-900/50")
                      )}
                    >
                      {seg.text}
                    </div>

                    {/* Timestamp */}
                    {timestamp && (
                      <span className="text-[10px] tabular-nums text-muted/50 px-1">
                        {timestamp}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Plain Text Fallback ── */
          <div className="space-y-3">
            <div className="rounded-xl p-5 border border-line/40 bg-canvas-depth/30">
              <p className="text-base leading-relaxed text-ink font-serif whitespace-pre-wrap">
                {content}
              </p>
            </div>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="mt-6 pt-6 border-t border-line">
          <p className="text-[11px] text-muted italic text-center">
            {t("transcriptNote")}
          </p>
        </div>
      )}
    </div>
  );
}
