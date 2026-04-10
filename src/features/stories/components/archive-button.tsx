"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { archiveStoryAction } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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

interface ArchiveButtonProps {
  storyId: string;
}

export function ArchiveButton({ storyId }: ArchiveButtonProps) {
  const t = useTranslations("Stories");
  const commonT = useTranslations("Common");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleArchive = async () => {
    setIsPending(true);
    const result = await archiveStoryAction(storyId);
    setIsPending(false);

    if (result.status === "success") {
      toast.success(result.message);
      router.push("/stories");
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 text-muted hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all text-xs font-semibold uppercase tracking-widest group">
          <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
          {t("batchArchive")}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-canvas border-line">
        <AlertDialogHeader>
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <AlertDialogTitle className="display text-2xl text-ink">{t("archiveConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted leading-relaxed">
            {t.rich("archiveConfirmDesc", {
              drawer: (chunks) => (
                <span className="text-ink font-medium">{chunks}</span>
              ),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel className="rounded-full border-line text-muted hover:bg-canvas-depth">
            {commonT("keepIt")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleArchive();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-ink text-white rounded-full px-8 border-none"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {commonT("processing")}
              </>
            ) : (
              t("batchArchive")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
