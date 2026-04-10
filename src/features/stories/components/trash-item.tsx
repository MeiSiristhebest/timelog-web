"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTranslation } from "@/lib/hooks/use-translation";
import { RotateCcw, Trash2, Archive, Loader2, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { restoreStoryAction, permanentlyDeleteStoryAction } from "../actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { StoryListItem } from "../queries";
import { useBatchStore } from "../store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TrashItemProps {
  story: StoryListItem;
}

export function TrashItem({ story }: TrashItemProps) {
  const t = useTranslations("Stories");
  const { t: commonT } = useTranslation();
  const [isActing, setIsActing] = useState<"restoring" | "deleting" | null>(null);
  const { isManagementMode, selectedIds, toggleSelection } = useBatchStore();
  const isSelected = selectedIds.includes(story.id);

  const handleRestore = async () => {
    setIsActing("restoring");
    const result = await restoreStoryAction(story.id);
    setIsActing(null);

    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async () => {
    setIsActing("deleting");
    const result = await permanentlyDeleteStoryAction(story.id);
    setIsActing(null);

    if (result.status === "success") {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div 
      onClick={() => isManagementMode ? toggleSelection(story.id) : null}
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-[1.5rem] border transition-all gap-4 animate-in fade-in slide-in-from-bottom-2",
        isManagementMode ? "cursor-pointer" : "",
        isSelected ? "border-accent bg-accent/5" : "border-line bg-panel hover:bg-canvas-elevated"
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Archive className="h-4 w-4 text-muted" />
          <h3 className="display text-xl text-ink">{story.title}</h3>
        </div>
        <p className="text-xs text-muted uppercase tracking-widest font-medium">
          {story.speakerLabel} · {story.startedAtLabel}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isManagementMode ? (
          <div className="p-2 transition-all duration-300">
            {isSelected ? (
              <CheckCircle2 className="h-6 w-6 text-accent fill-accent/5 animate-in zoom-in-50" />
            ) : (
              <Circle className="h-6 w-6 text-line" />
            )}
          </div>
        ) : (
          <>
            <button
              onClick={handleRestore}
              disabled={!!isActing}
              className="group flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-accent hover:bg-accent/5 rounded-full transition-all disabled:opacity-50"
            >
              {isActing === "restoring" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-45" />
              )}
              {t("restoreMemory")}
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={!!isActing}
                  className="group flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-red-600 hover:bg-red-500/10 rounded-full transition-all disabled:opacity-50"
                >
                  {isActing === "deleting" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                  )}
                  {t("erase")}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem] p-10 bg-panel border-line">
                <AlertDialogHeader>
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <AlertDialogTitle className="display text-2xl">{t("deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted leading-relaxed">
                    {t("deleteConfirmDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 gap-3">
                  <AlertDialogCancel className="rounded-full px-6 py-4 border-line text-muted font-bold uppercase tracking-widest text-[10px]">{commonT("Common.keepIt")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-canvas rounded-full px-8 py-4 shadow-lg shadow-red-600/20 border-none font-bold uppercase tracking-widest text-[10px]"
                  >
                    {t("batchDelete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
}
