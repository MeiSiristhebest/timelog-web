import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Archive, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useBatchStore } from "../store";
import { 
  batchArchiveStoriesAction, 
  batchRestoreStoriesAction, 
  batchPermanentlyDeleteStoriesAction 
} from "../actions";
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

export type BatchFloatingToolbarProps = {
  mode: "active" | "archived";
};

export function BatchFloatingToolbar({ mode }: BatchFloatingToolbarProps) {
  const t = useTranslations("Stories");
  const { selectedIds, clearSelection, setManagementMode } = useBatchStore();
  const [isPending, setIsPending] = useState(false);
  
  if (selectedIds.length === 0) return null;

  const handleAction = async (action: (ids: string[]) => Promise<any>) => {
    setIsPending(true);
    try {
      const result = await action(selectedIds);
      if (result.status === "success") {
        toast.success(result.message);
        clearSelection();
        setManagementMode(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(t("Common.actionFailed"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12 fade-in duration-700 transform-gpu will-change-transform">
      <div className="bg-ink/95 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] flex items-center gap-2 p-2.5 pl-8 overflow-hidden transform-gpu">
        {/* Status indicator and count */}
        <div className="flex items-baseline gap-2 mr-6 select-none">
          <span className="text-[10px] font-black tracking-[0.3em] text-accent uppercase leading-none">{t("selectedCounts")}</span>
          <span className="display text-3xl text-white tabular-nums leading-none">
            {selectedIds.length.toString().padStart(2, '0')}
          </span>
        </div>
        
        <div className="h-10 w-px bg-white/10 mr-4" />

        <div className="flex items-center gap-2">
          {mode === "active" ? (
            <button
              disabled={isPending}
              onClick={() => handleAction(batchArchiveStoriesAction)}
              className="group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />}
              <span className="text-sm font-black uppercase tracking-widest">{t("batchArchive")}</span>
            </button>
          ) : (
            <>
              <button
                disabled={isPending}
                onClick={() => handleAction(batchRestoreStoriesAction)}
                className="group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4 text-accent group-hover:rotate-[-20deg] transition-transform" />}
                <span className="text-sm font-black uppercase tracking-widest">{t("batchRestore")}</span>
              </button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={isPending}
                    className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all hover:text-red-300 active:scale-95 disabled:opacity-50 border border-red-500/10 hover:border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-black uppercase tracking-widest">{t("batchDelete")}</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[3rem] p-12 bg-canvas border-line-strong shadow-2xl">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20 animate-pulse">
                       <Trash2 className="h-10 w-10 text-red-500" />
                    </div>
                    <AlertDialogHeader className="space-y-4">
                      <AlertDialogTitle className="display text-4xl text-ink">{t("batchDeleteConfirmTitle")}</AlertDialogTitle>
                      <AlertDialogDescription className="text-lg text-muted/80 leading-relaxed font-medium">
                        {t("batchDeleteConfirmDesc", { 
                          count: selectedIds.length,
                          quote: t("batchDeleteQuote")
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-12 w-full gap-4 sm:justify-center">
                      <AlertDialogCancel className="flex-1 rounded-2xl px-8 py-7 border-line text-muted hover:bg-canvas-depth transition-all uppercase tracking-widest text-xs font-black">
                        {t("keepMemory")}
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleAction(batchPermanentlyDeleteStoriesAction)}
                        className="flex-1 rounded-2xl px-8 py-7 bg-red-600 hover:bg-ink text-white shadow-2xl shadow-red-600/20 transition-all uppercase tracking-widest text-xs font-black border-none"
                      >
                        {t("confirmDelete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>

        <div className="h-10 w-px bg-white/10 mx-2" />

        <button
          onClick={clearSelection}
          className="p-4 hover:bg-white/5 text-white/30 hover:text-white transition-all rounded-full group/close"
          aria-label={t("clearSelection")}
        >
          <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
}
