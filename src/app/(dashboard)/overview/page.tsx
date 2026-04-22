import Link from "next/link";
import { RealtimeRefresh } from "@/features/realtime/components/realtime-refresh";
import { buildInteractionRealtimeTargets, buildStoryListRealtimeTargets } from "@/features/realtime/subscriptions";
import { getStories, getStorageMetrics, type StoryListItem } from "@/features/stories/queries";
import { storyRoute } from "@/lib/routes";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { getDevices } from "@/features/devices/queries";
import { getFamilyMembers } from "@/features/family/queries";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
// Import test function for debugging
import "@/lib/supabase-test";




async function OverviewContent({ storiesPromise }: { storiesPromise: Promise<StoryListItem[]> }) {
  const t = await getTranslations();

  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContentInner storiesPromise={storiesPromise} t={t} />
    </Suspense>
  );
}

"use client";

function AuthDebugInfo() {
  const { userRole, isLoading, user, isAuthenticated } = useAuth();
  const permissions = usePermissions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>调试信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p><strong>用户角色:</strong> {userRole}</p>
          <p><strong>加载中:</strong> {isLoading ? '是' : '否'}</p>
          <p><strong>已认证:</strong> {isAuthenticated ? '是' : '否'}</p>
          <p><strong>用户ID:</strong> {user?.id || '无'}</p>
          <p><strong>用户邮箱:</strong> {user?.email || '无'}</p>
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p><strong>权限检查:</strong></p>
            <p>是家庭所有者: {permissions.isRole('family_owner') ? '是' : '否'}</p>
            <p>可以查看故事: {permissions.hasPermission('canViewStories') ? '是' : '否'}</p>
            <p>可以查看审计: {permissions.hasPermission('canViewAudit') ? '是' : '否'}</p>
            <p>可以管理设备: {permissions.hasPermission('canManageDevices') ? '是' : '否'}</p>
          </div>
          <div className="mt-4 p-2 bg-blue-50 rounded">
            <p className="text-xs text-blue-700">
              <strong>调试测试:</strong> 在浏览器控制台运行 <code>testSupabaseConnection()</code> 来测试数据库连接和RLS策略
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function OverviewContentInner({ storiesPromise, t }: { storiesPromise: Promise<StoryListItem[]>; t: any }) {
  const [stories, devices, storageMetrics, members] = await Promise.all([
    storiesPromise,
    getDevices(),
    getStorageMetrics(),
    getFamilyMembers()
  ]);

  const syncedStories = stories.filter((story) => story.syncStatus === "synced");
  const totalComments = stories.reduce((sum, story) => sum + (story.commentCount || 0), 0);
  const storageUsedGb = (storageMetrics.totalDurationMs / (1000 * 60 * 60 * 10)).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Auth Debug Info */}
      <AuthDebugInfo />
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
        storageTitle={t("Overview.capacity", { used: storageUsedGb, total: 10 })}
        storageDesc={t("Settings.cloudSync")}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Recent Stories Table */}
        <div className="bg-canvas-elevated border border-line rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-line flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-lg font-black text-ink tracking-tight">{t("Overview.recentStories")}</h3>
              <p className="text-xs text-muted font-bold mt-1 uppercase tracking-widest">{t("Overview.recentStoriesDesc")}</p>
            </div>
            <Link 
              href="/stories" 
              className="text-xs font-black text-accent hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/5 hover:bg-accent/10 transition-all"
            >
              {t("Common.viewAll")} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-line bg-canvas-depth/30">
                  <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted">{t("Stories.tableTitle")}</TableHead>
                  <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted">{t("Stories.tableDuration")}</TableHead>
                  <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted">{t("Stories.tableDate")}</TableHead>
                  <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest text-muted text-right">{t("Stories.tableStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncedStories.slice(0, 5).map((story) => (
                  <TableRow key={story.id} className="group border-b border-line hover:bg-accent/[0.02] transition-colors">
                    <TableCell className="px-6 py-4">
                      <Link href={storyRoute(story.id)} className="block space-y-0.5">
                        <p className="text-sm font-black text-ink group-hover:text-accent transition-colors">
                          {story.title}
                        </p>
                        <p className="text-[10px] text-muted font-black uppercase tracking-widest">{story.speakerLabel}</p>
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
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-emerald-500/20 bg-emerald-500/5 text-emerald-600">
                        {t("Stories.statusSynced")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {syncedStories.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-line flex items-center justify-center text-muted">
                  <BookOpen className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted italic font-bold">{t("Overview.emptyRecent")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sync Feed / Right Sidebar (Activity Style) */}
        <div className="space-y-6">
          <div className="bg-canvas-elevated border border-line rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                   <History className="h-4 w-4 text-accent" />
                </div>
                <h3 className="text-xs font-black text-ink uppercase tracking-widest">{t("Overview.inProgress")}</h3>
              </div>
              <Badge variant="outline" className="text-[9px] font-black animate-pulse bg-accent/10 text-accent border-accent/20">
                {t("Dashboard.activeCount", { count: stories.filter(s => s.syncStatus !== 'synced').length })}
              </Badge>
            </div>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-px before:bg-line before:h-full pb-2">
              {stories.filter(s => s.syncStatus !== 'synced').length > 0 ? (
                stories.filter(s => s.syncStatus !== 'synced').map((story) => (
                  <div key={story.id} className="relative pl-8 group">
                    <div className="absolute left-[9px] top-1 h-3 w-3 rounded-full border-2 border-canvas bg-accent group-hover:scale-125 transition-transform" />
                    <div className="p-4 rounded-xl bg-canvas-depth border border-line shadow-sm hover:border-accent/40 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-ink truncate group-hover:text-accent transition-colors">{story.title}</p>
                          <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-widest">
                            {t("Stories.statusSyncing")} • {t("Overview.timeAgo", { time: "2m" })}
                          </p>
                        </div>
                        <div className="flex h-3 w-3 rounded-full bg-accent animate-pulse shrink-0 border-2 border-white/20" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="h-10 w-10 rounded-xl border border-dashed border-muted flex items-center justify-center mb-4">
                     <ShieldCheck className="h-5 w-5 text-muted" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted">{t("Overview.vaultSecure")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Encryption Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 text-white relative overflow-hidden group shadow-xl">
            <div className="absolute -top-4 -right-4 h-24 w-24 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all" />
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform">
              <ShieldCheck size={50} className="text-emerald-400" />
            </div>
            
            <div className="relative space-y-4">
              <div className="inline-flex px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm border border-white/10">
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">{t("Settings.tabSecurity")}</p>
              </div>
              <h4 className="text-sm font-black tracking-tight leading-tight">{t("Settings.encryptionPolicy")}</h4>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full w-[85%] bg-gradient-to-r from-emerald-500 to-accent animate-in slide-in-from-left duration-1000" />
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/40">
                  <span>AES-256</span>
                  <span>{t("Overview.securePercent")}</span>
                </div>
              </div>
              <p className="text-[11px] text-white/60 font-medium leading-relaxed">
                {t("Settings.encryptionDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const storiesPromise = getStories();

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
        <OverviewContent storiesPromise={storiesPromise} />
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

