export const dynamic = "force-dynamic";

import Link from "next/link";
import { RealtimeRefresh } from "@/features/realtime/components/realtime-refresh";
import { buildInteractionRealtimeTargets, buildStoryListRealtimeTargets } from "@/features/realtime/subscriptions";
import { getStories, getStorageMetrics, type StoryListItem } from "@/features/stories/queries";
import { storyRoute } from "@/lib/routes";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getDevices, type DeviceView } from "@/features/devices/queries";
import { getFamilyMembers, type FamilyMemberView } from "@/features/family/queries";
import {
  BookOpen,
  ArrowRight,
  Clock,
  History,
  ShieldCheck
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";





async function OverviewContent({
  storiesPromise,
  devicesPromise,
  storageMetricsPromise,
  membersPromise,
}: {
  storiesPromise: Promise<StoryListItem[]>;
  devicesPromise: Promise<DeviceView[]>;
  storageMetricsPromise: Promise<{ totalDurationMs: number }>;
  membersPromise: Promise<FamilyMemberView[]>;
}) {
  const t = await getTranslations();

  return (
    <OverviewContentInner
      storiesPromise={storiesPromise}
      devicesPromise={devicesPromise}
      storageMetricsPromise={storageMetricsPromise}
      membersPromise={membersPromise}
      t={t}
    />
  );
}

async function OverviewContentInner({
  storiesPromise,
  devicesPromise,
  storageMetricsPromise,
  membersPromise,
  t,
}: {
  storiesPromise: Promise<StoryListItem[]>;
  devicesPromise: Promise<DeviceView[]>;
  storageMetricsPromise: Promise<{ totalDurationMs: number }>;
  membersPromise: Promise<FamilyMemberView[]>;
  t: (key: string, options?: Record<string, string | number>) => string;
}) {
  const [stories, _devices, storageMetrics, members] = await Promise.all([
    storiesPromise,
    devicesPromise,
    storageMetricsPromise,
    membersPromise
  ]);

  const syncedStories = stories.filter((story) => story.syncStatus === "synced");
  const totalComments = stories.reduce((sum, story) => sum + (story.commentCount || 0), 0);
  
  // Calculate actual hours and GB separately
  const totalHours = storageMetrics.totalDurationMs / (1000 * 60 * 60);
  const storageUsedHours = totalHours.toFixed(1);
  const storageUsedGb = (totalHours * 0.1).toFixed(2); // Show 2 decimal places for better precision (e.g., 0.03GB)

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-panel-strong/40 to-canvas-depth p-8 shadow-sm backdrop-blur-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
        <div className="relative space-y-2">
          <h1 className="font-display text-3xl md:text-4xl text-ink font-bold tracking-tight">
            {t("Overview.title")}
          </h1>
          <p className="text-sm text-muted max-w-2xl font-medium leading-relaxed">
            {t("Overview.description")}
          </p>
        </div>
      </div>

      {/* KPI Grid with Sparklines - uses client wrapper to avoid RSC boundary */}
      <KpiGrid
        storiesCount={stories.length}
        membersCount={members.length}
        totalComments={totalComments}
        storageUsedGb={storageUsedGb}
        storiesTitle={t("Overview.visibleStories")}
        storiesDesc={t("Overview.title")}
        familyTitle={t("Dashboard.family")}
        familyDesc={t("Family.subtitle")}
        interactionsTitle={t("Overview.unreadReplies")}
        interactionsDesc={t("Overview.freshlySynced")}
        storageTitle={t("Overview.capacity", { used: storageUsedHours, total: 10 })}
        storageDesc={t("Settings.cloudSync")}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Recent Stories Table */}
        <Card doubleBezel className="overflow-hidden flex flex-col">
          <div className="p-6 border-b border-line flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-lg font-bold text-ink tracking-tight">{t("Overview.recentStories")}</h3>
              <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-[0.15em]">{t("Overview.recentStoriesDesc")}</p>
            </div>
            <Link 
              href="/stories" 
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/5 hover:bg-accent/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              {t("Common.viewAll")} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-line bg-canvas-elevated">
                  <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted">{t("Stories.tableTitle")}</TableHead>
                  <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted">{t("Stories.tableDuration")}</TableHead>
                  <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted">{t("Stories.tableDate")}</TableHead>
                  <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted text-right">{t("Stories.tableStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncedStories.slice(0, 5).map((story) => (
                  <TableRow key={story.id} className="group border-b border-line hover:bg-accent/[0.01] transition-colors">
                    <TableCell className="px-6 py-4">
                      <Link href={storyRoute(story.id)} className="block space-y-0.5">
                        <p className="text-sm font-bold text-ink group-hover:text-accent transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                          {story.title}
                        </p>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-[0.15em]">{story.speakerLabel}</p>
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-muted font-bold">
                        <Clock className="h-3.5 w-3.5 text-muted/60" />
                        {story.durationLabel}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-muted font-bold">
                      {story.startedAtLabel}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Badge variant="success" className="text-[9px] font-bold uppercase tracking-[0.15em]">
                        {t("Stories.statusSynced")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {syncedStories.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 rounded-full border border-dashed border-line flex items-center justify-center text-muted">
                  <BookOpen className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted italic font-bold">{t("Overview.emptyRecent")}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Sync Feed / Right Sidebar (Activity Style) */}
        <div className="space-y-6">
          <Card doubleBezel>
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <History className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-[0.15em]">{t("Overview.inProgress")}</h3>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold animate-pulse bg-accent/10 text-accent border-accent/20">
                  {t("Dashboard.activeCount", { count: stories.filter(s => s.syncStatus !== 'synced').length })}
                </Badge>
              </div>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-px before:bg-line before:h-full pb-2">
                {stories.filter(s => s.syncStatus !== 'synced').length > 0 ? (
                  stories.filter(s => s.syncStatus !== 'synced').map((story) => (
                    <div key={story.id} className="relative pl-8 group">
                      <div className="absolute left-[9px] top-1.5 h-2.5 w-2.5 rounded-full border border-canvas bg-accent group-hover:scale-125 transition-transform" />
                      <div className="p-4 rounded-xl bg-canvas-depth/50 border border-line hover:border-accent/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-ink truncate group-hover:text-accent transition-colors">{story.title}</p>
                            <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-[0.15em]">
                              {t("Stories.statusSyncing")} • {t("Overview.timeAgo", { time: "2m" })}
                            </p>
                          </div>
                          <div className="flex h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                    <div className="h-10 w-10 rounded-xl border border-dashed border-muted flex items-center justify-center mb-4">
                      <ShieldCheck className="h-5 w-5 text-muted" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">{t("Overview.vaultSecure")}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Premium Encryption Card */}
          <Card doubleBezel>
            <div className="p-6 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-500" />
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck size={50} className="text-accent" />
              </div>
              
              <div className="relative space-y-4">
                <div className="inline-flex px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                  <p className="text-[9px] font-bold text-accent uppercase tracking-[0.25em]">{t("Settings.tabSecurity")}</p>
                </div>
                <h4 className="text-sm font-bold tracking-tight leading-tight text-ink">{t("Settings.encryptionPolicy")}</h4>
                <div className="space-y-2">
                  <div className="h-1 w-full bg-line rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-accent transition-all duration-1000" />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.15em] text-muted">
                    <span>AES-256</span>
                    <span>{t("Overview.securePercent")}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted font-medium leading-relaxed">
                  {t("Settings.encryptionDesc")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const storiesPromise = getStories();
  const devicesPromise = getDevices();
  const storageMetricsPromise = getStorageMetrics();
  const membersPromise = getFamilyMembers();

  return (
    <div className="animate-fade-in">
      <RealtimeRefresh
        channelName="overview-stories-refresh"
        targets={[
          ...buildStoryListRealtimeTargets(),
          ...buildInteractionRealtimeTargets(),
        ]}
      />
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewContent
          storiesPromise={storiesPromise}
          devicesPromise={devicesPromise}
          storageMetricsPromise={storageMetricsPromise}
          membersPromise={membersPromise}
        />
      </Suspense>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl border border-line" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-96 rounded-2xl border border-line shadow-sm" />
        <Skeleton className="h-96 rounded-2xl border border-line shadow-sm" />
      </div>
    </div>
  );
}

