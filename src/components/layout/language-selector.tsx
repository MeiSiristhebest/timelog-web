"use client";

import { useTranslation } from "@/lib/hooks/use-translation";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className }: { className?: string }) {
  const { locale } = useTranslation();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const changeLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className={cn("inline-flex items-center gap-1 bg-glass border border-line p-1 rounded-full shadow-sm backdrop-blur-md z-50", className)}>
      <div className="flex items-center justify-center h-8 w-8 text-muted/80">
        <Globe className="h-4 w-4" />
      </div>
      <button
        type="button"
        onClick={() => changeLocale("en")}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-bold transition-all uppercase tracking-wider cursor-pointer",
          locale === "en" ? "bg-ink text-canvas shadow-sm" : "text-muted hover:text-ink"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => changeLocale("zh")}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-bold transition-all uppercase tracking-wider cursor-pointer",
          locale === "zh" ? "bg-ink text-canvas shadow-sm" : "text-muted hover:text-ink"
        )}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => changeLocale("th")}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-bold transition-all uppercase tracking-wider cursor-pointer",
          locale === "th" ? "bg-ink text-canvas shadow-sm" : "text-muted hover:text-ink"
        )}
      >
        ไทย
      </button>
    </div>
  );
}
