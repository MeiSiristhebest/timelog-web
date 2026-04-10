import { Suspense } from "react";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { RealtimeRefresh } from "@/features/realtime/components/realtime-refresh";
import { buildInteractionRealtimeTargets } from "@/features/realtime/subscriptions";
import { getTranslations } from "next-intl/server";
import { AuditMetrics, ActivityTimeline } from "@/features/audit/components/audit-views";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuditOverview } from "@/features/audit/queries";

function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <article key={i} className="panel p-6 bg-canvas border-line">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-16 mb-2" />
          <Skeleton className="h-3 w-full" />
        </article>
      ))}
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="mt-12 space-y-8">
      {[...Array(3)].map((_, i) => (
        <article key={i} className="panel p-8 bg-canvas-depth border-line">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </article>
      ))}
    </div>
  );
}

async function AuditContent() {
  const overview = await getAuditOverview();
  
  return (
    <>
      <AuditMetrics overview={overview} />
      <ActivityTimeline overview={overview} />
    </>
  );
}

export default async function AuditPage() {
  const t = await getTranslations("Audit");

  return (
    <SectionPlaceholder
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <RealtimeRefresh
        channelName="audit-activity-refresh"
        targets={buildInteractionRealtimeTargets()}
      />

      <Suspense fallback={
        <div className="space-y-12">
          <MetricsSkeleton />
          <TimelineSkeleton />
        </div>
      }>
        <AuditContent />
      </Suspense>
    </SectionPlaceholder>
  );
}
