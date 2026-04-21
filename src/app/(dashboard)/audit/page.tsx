import { Suspense } from "react";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { RealtimeRefresh } from "@/features/realtime/components/realtime-refresh";
import { buildInteractionRealtimeTargets } from "@/features/realtime/subscriptions";
import { getTranslations } from "next-intl/server";
import { AuditMetrics, ActivityTimeline } from "@/features/audit/components/audit-views";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuditOverview } from "@/features/audit/queries";
import { PermissionWrapper } from "@/components/auth/permission-wrapper";

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
    <PermissionWrapper
      permission="canViewAudit"
      fallback={
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 mb-4">
            <svg className="h-8 w-8 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-ink mb-2">需要管理员权限</h3>
          <p className="text-muted/70">只有管理员才能查看系统审计日志</p>
        </div>
      }
    >
      <>
        <AuditMetrics overview={overview} />
        <ActivityTimeline overview={overview} />
      </>
    </PermissionWrapper>
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
