"use client";

import { usePlayback } from "../../context/playback-context";
import { useEffect, useRef, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PenLine, Save, X, Loader2 } from "lucide-react";
import { updateStoryTranscriptionAction } from "../../actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface InteractiveTranscriptProps {
  storyId: string;
  content: string | TranscriptSegment[];
}

export function InteractiveTranscript({ storyId, content }: InteractiveTranscriptProps) {
  const t = useTranslations("Stories");
  const { currentTime } = usePlayback();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize editable text
  useEffect(() => {
    if (typeof content === "string") {
      setEditedText(content);
    } else if (Array.isArray(content)) {
      setEditedText(content.map(s => s.text).join("\n\n"));
    }
  }, [content]);

  // For now, if it's a string, we treat it as one big segment starting at 0
  const segments = useMemo(() => {
    if (Array.isArray(content)) return content;
    return [{ start: 0, end: 9999, text: content }];
  }, [content]);

  // Find active segment
  const activeIndex = useMemo(() => {
    return segments.findIndex(
      (s) => currentTime >= s.start && currentTime < s.end
    );
  }, [segments, currentTime]);

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="eyebrow">{t("transcriptTitle")}</h3>
          {isEditing && (
            <span className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent-strong rounded-full font-bold tracking-tighter animate-pulse">
              {t("editing")}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full hover:bg-canvas-depth transition-colors text-muted hover:text-accent-strong"
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
                  setEditedText(typeof content === "string" ? content : "");
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

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-4 scroll-smooth custom-scrollbar"
      >
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-full min-h-[400px] p-6 text-lg leading-relaxed text-ink bg-canvas-depth border border-line rounded-[1.5rem] focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none font-serif"
            placeholder={t("transcriptPlaceholder")}
          />
        ) : (
          <div className="space-y-6">
            {segments.map((segment, index) => (
              <div 
                key={index}
                className={cn(
                  "transition-all duration-500 rounded-xl p-4 cursor-pointer hover:bg-canvas-depth",
                  index === activeIndex 
                    ? "bg-canvas-elevated border-l-4 border-accent shadow-sm" 
                    : "opacity-60 grayscale-[0.5]"
                )}
              >
                <p className={cn(
                  "text-lg leading-relaxed transition-colors transcript-text",
                  index === activeIndex ? "text-ink font-medium" : "text-muted"
                )}>
                  {segment.text}
                </p>
                
                {Array.isArray(content) && (
                  <span className="mt-2 block text-[10px] tabular-nums tracking-widest text-muted/50">
                     {new Date(segment.start * 1000).toISOString().substr(14, 5)}
                  </span>
                )}
              </div>
            ))}
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
