"use client";

import { useOptimistic, useTransition } from "react";
import { Star } from "lucide-react";
import { toggleFavoriteAction } from "../actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface FavoriteButtonProps {
  storyId: string;
  initialValue: boolean;
}

export function FavoriteButton({ storyId, initialValue }: FavoriteButtonProps) {
  const commonT = useTranslations("Common");
  const [isPending, startTransition] = useTransition();

  // React 19 Optimistic State
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(
    initialValue,
    (_state, newValue: boolean) => newValue
  );

  const handleToggle = async () => {
    startTransition(async () => {
      const targetValue = !optimisticFavorite;
      setOptimisticFavorite(targetValue);

      const result = await toggleFavoriteAction(storyId, optimisticFavorite);

      if (result.status === "error") {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  };

  const isFavorite = optimisticFavorite;

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "group flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-500 active:scale-95 disabled:opacity-50",
        isFavorite
          ? "bg-amber-400/10 border-amber-400/30 text-amber-600 shadow-inner shadow-amber-400/5"
          : "bg-canvas border-line text-muted hover:border-line-strong hover:text-ink shadow-sm"
      )}
    >
      <div className={cn(
        "p-1 rounded-full transition-transform duration-500",
        isFavorite ? "scale-110" : "group-hover:scale-110"
      )}>
        <Star className={cn("h-6 w-6", isFavorite && "fill-current")} />
      </div>
      <span className="text-sm font-semibold tracking-widest uppercase">
        {isFavorite ? "Heartfelt" : "Heart"}
      </span>
    </button>
  );
}
