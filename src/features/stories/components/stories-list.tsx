"use client";

import { use, useState, useMemo } from "react";
import { StoryCard } from "./story-card";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Search } from "lucide-react";
import { ManagementControlBar } from "./management-control-bar";
import { BatchFloatingToolbar } from "./batch-floating-toolbar";
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

export function StoriesList({ storiesPromise }: { storiesPromise: Promise<Story[]> }) {
  const t = useTranslations("Stories");
  const stories = use(storiesPromise);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredStories = useMemo(() => {
    if (!debouncedSearchQuery) return stories;
    const lowerQuery = debouncedSearchQuery.toLowerCase();
    return stories.filter(
      (story) =>
        story.title.toLowerCase().includes(lowerQuery) ||
        story.speakerLabel.toLowerCase().includes(lowerQuery) ||
        story.transcriptPreview.toLowerCase().includes(lowerQuery)
    );
  }, [stories, debouncedSearchQuery]);

  return (
    <>
      {/* 批量管理控制条 */}
      <ManagementControlBar allIds={filteredStories.map(s => s.id)} />

      <div className="mb-8 relative max-w-md animate-slide-up">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-line bg-canvas-depth/50 pl-11 pr-4 py-3 text-sm text-ink outline-none transition focus:border-accent/40 focus:bg-canvas-depth"
          aria-label="Search stories"
        />
      </div>

      <div className="grid gap-4">
        {filteredStories.length > 0 ? (
          filteredStories.map((story, idx) => (
            <StoryCard key={story.id} story={story} index={idx} />
          ))
        ) : (
          <div className="panel p-12 text-center border-dashed bg-transparent">
            <p className="display text-2xl text-ink/40">{t("emptySearchTitle")}</p>
            <p className="mt-2 text-muted italic">{t("emptySearchDesc")}</p>
          </div>
        )}
      </div>

      {/* 底部批量管理工具条 */}
      <BatchFloatingToolbar mode="active" />
    </>
  );
}
