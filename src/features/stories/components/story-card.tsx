"use client";

import Link from "next/link";
import { useIntersectionObserver } from "@/lib/hooks/use-intersection-observer";
import { storyRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useBatchStore } from "../store";
import { useTranslations } from "next-intl";

type Story = {
  id: string;
  title: string;
  speakerLabel: string;
  startedAtLabel: string;
  durationLabel: string;
  syncStatus: string;
  transcriptPreview: string;
  commentCount: number;
  reactionCount: number;
  isFavorite: boolean;
};

import { StoryCardSkeleton } from "./story-card-skeleton";
import { Star, CheckCircle2, Circle, MessageSquare, Heart, ChevronRight } from "lucide-react";
import { toggleFavoriteAction } from "../actions";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Archive } from "lucide-react";

export function StoryCard({ story, index }: { story: Story; index: number }) {
  const t = useTranslations("Stories");
  const [isFavorite, setIsFavorite] = useState(story.isFavorite);
  const [isPending, startTransition] = useTransition();

  const { isManagementMode, selectedIds, toggleSelection } = useBatchStore();
  const isSelected = selectedIds.includes(story.id);

  const { ref, entry } = useIntersectionObserver({
    freezeOnceVisible: true,
    rootMargin: "100px",
  });
  const isVisible = entry?.isIntersecting;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      // Optimistic UI update inside transition
      const oldValue = isFavorite;
      setIsFavorite(!oldValue);

      const result = await toggleFavoriteAction(story.id, oldValue);
      if (result.status === "error") {
        setIsFavorite(oldValue); // Revert on failure
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  };

  return (
    <div ref={ref} className="min-h-[160px]">
      {isVisible ? (
        <div
          onClick={() => isManagementMode ? toggleSelection(story.id) : null}
          className={cn(
            "card group block p-6 md:p-8 transition-all duration-500 relative overflow-hidden",
            isManagementMode ? "cursor-pointer" : "",
            isSelected 
              ? "border-accent bg-gradient-to-br from-accent/10 to-transparent shadow-[0_20px_50px_rgba(var(--color-accent),0.1)] scale-[0.99]" 
              : "border-line bg-panel hover:border-accent/40 hover:-translate-y-1 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]",
            "animate-slide-up"
          )}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {/* 装饰性背景设计 (Card Texture) - 仅在非管理模式且 Hover 时显示更明显 */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity pointer-events-none">
            <Archive size={120} />
          </div>

          {/* Action Area (Corner Controls) */}
          <div className="absolute right-6 top-6 z-10 flex items-center gap-2">
            {isManagementMode ? (
              <div className="p-2 transition-all duration-500">
                {isSelected ? (
                  <CheckCircle2 className="h-7 w-7 text-accent fill-accent/5 animate-in zoom-in-50" />
                ) : (
                  <Circle className="h-7 w-7 text-line" />
                )}
              </div>
            ) : (
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-500 border border-line/20",
                  isFavorite 
                    ? "bg-amber-400/10 text-amber-500 scale-110 border-amber-400/20 shadow-lg shadow-amber-400/10" 
                    : "bg-canvas text-muted hover:bg-canvas-elevated hover:text-ink opacity-0 group-hover:opacity-100"
                )}
              >
                <Star className={cn("h-5 w-5", isFavorite && "fill-current")} />
              </button>
            )}
          </div>

          <Link
            href={isManagementMode ? "#" : storyRoute(story.id)}
            onClick={(e) => isManagementMode && e.preventDefault()}
            className="block h-full"
          >
            <div className="flex flex-col h-full">
              <div className="flex flex-wrap items-start justify-between gap-6 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <h3 className="display text-3xl text-ink leading-[1.15] group-hover:text-accent-strong transition-colors duration-500 underline decoration-transparent group-hover:decoration-accent/20 decoration-2 underline-offset-8">
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="h-px w-4 bg-line" />
                    <p className="eyebrow text-muted tracking-[0.2em] font-bold uppercase text-[10px]">
                      {story.speakerLabel} · {story.startedAtLabel}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="badge border-accent/20 bg-accent/5 text-accent-strong uppercase tracking-[0.2em] text-[9px] font-black px-4 py-1 rounded-full shadow-sm">
                    {story.syncStatus === "synced" 
                      ? (t("statusSynced") || "Synchronized") 
                      : (t("statusSyncing") || story.syncStatus)}
                  </p>
                  <p className="display text-2xl text-line group-hover:text-muted transition-colors">
                    {story.durationLabel}
                  </p>
                </div>
              </div>

              <div className="relative mb-8">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent/10 rounded-full group-hover:bg-accent/30 transition-colors" />
                <p className="pl-6 text-sm leading-8 text-muted/80 line-clamp-3 italic font-medium">
                  {story.transcriptPreview}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-line group-hover:border-accent/10 transition-colors flex items-center justify-between">
                <div className="flex gap-8">
                  <div className="flex items-center gap-2 group/stat">
                    <div className="h-6 w-6 rounded-md bg-canvas-depth flex items-center justify-center group-hover:bg-accent/5 transition-colors">
                      <MessageSquare className="h-3 w-3 text-muted group-hover:text-accent" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted group-hover:text-ink transition-colors">
                      {t("comments", { count: story.commentCount })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 group/stat">
                    <div className="h-6 w-6 rounded-md bg-canvas-depth flex items-center justify-center group-hover:bg-accent/5 transition-colors">
                      <Heart className="h-3 w-3 text-muted group-hover:text-accent" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted group-hover:text-ink transition-colors">
                      {t("reactions", { count: story.reactionCount })}
                    </span>
                  </div>
                </div>
                
                <div className="h-8 w-8 rounded-full border border-line flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-500 bg-panel shadow-sm">
                   <ChevronRight className="h-4 w-4 text-accent" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <StoryCardSkeleton index={index} />
      )}
    </div>
  );
}
