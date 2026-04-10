import { Suspense } from "react";
import { getStories } from "@/features/stories/queries";
import { RealtimeRefresh } from "@/features/realtime/components/realtime-refresh";
import { buildStoryListRealtimeTargets } from "@/features/realtime/subscriptions";
import { StoriesDataTable } from "@/features/stories/components/stories-data-table";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export default async function StoriesPage() {
  const storiesPromise = getStories();
  const t = await getTranslations("Stories");

  return (
    <div className="space-y-6">
      <RealtimeRefresh
        channelName="stories-ledger-refresh"
        targets={buildStoryListRealtimeTargets()}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
         <div>
            <h1 className="text-3xl font-bold text-ink tracking-tight">{t("ledger")}</h1>
            <p className="text-sm text-muted mt-1">{t("description")}</p>
         </div>
         <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">{t("activeVault")}</span>
         </div>
      </div>

      <Suspense fallback={<StoriesTableSkeleton />}>
        <StoriesDataTable storiesPromise={storiesPromise} />
      </Suspense>
    </div>
  );
}

function StoriesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-16 w-full bg-canvas-elevated border border-line rounded-2xl animate-pulse" />
      <div className="h-96 w-full bg-canvas-elevated border border-line rounded-2xl animate-pulse" />
    </div>
  );
}
