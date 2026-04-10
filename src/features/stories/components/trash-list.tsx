"use client";

import { TrashItem } from "./trash-item";
import type { StoryListItem } from "../queries";
import { Inbox } from "lucide-react";
import { ManagementControlBar } from "./management-control-bar";
import { BatchFloatingToolbar } from "./batch-floating-toolbar";
import { useTranslation } from "@/lib/hooks/use-translation";

interface TrashListProps {
  initialStories: StoryListItem[];
}

export function TrashList({ initialStories }: TrashListProps) {
  const { t } = useTranslation();

  if (initialStories.length === 0) {

    return (
      <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-line rounded-[2rem] bg-canvas-elevated/30 text-center">
        <div className="h-16 w-16 rounded-full bg-canvas flex items-center justify-center mb-6">
          <Inbox className="h-8 w-8 text-line" />
        </div>
        <h3 className="display text-2xl text-muted">{t("Stories.emptyArchiveTitle")}</h3>
        <p className="mt-2 text-sm text-muted max-w-xs mx-auto leading-relaxed italic">
          {t("Stories.emptyArchiveDesc")}
        </p>
      </div>
    );
  }

  return (
    <>
      <ManagementControlBar allIds={initialStories.map(s => s.id)} />
      
      <div className="grid gap-4 mt-6">
        {initialStories.map((story) => (
          <TrashItem key={story.id} story={story} />
        ))}
      </div>

      <BatchFloatingToolbar mode="archived" />
    </>
  );
}
