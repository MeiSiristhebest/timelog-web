import Link from "next/link";
import { getAuditOverview } from "@/features/audit/queries";
import { getDevices } from "@/features/devices/queries";
import { getMemberCount } from "@/features/family/queries";
import { getInteractionsOverview } from "@/features/interactions/queries";
import { getStoryCount } from "@/features/stories/queries";
import { routes } from "@/lib/routes";
import { 
  Activity,
  UserCheck,
  Smartphone,
  MessageSquare,
  Eye
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { getTranslations } from "next-intl/server";

export async function SettingsMonitoring() {
  const t = await getTranslations("Settings");

  const [syncedStories, acceptedMembers, devices, interactions, audit] = await Promise.all([
    getStoryCount(),
    getMemberCount(),
    getDevices(),
    getInteractionsOverview(),
    getAuditOverview(),
  ]);

  const activeDevices = devices.filter((device) => device.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label={t("Monitoring.syncHealth")} 
          value={`${syncedStories}`}
          description={t("Monitoring.syncHealthDesc")}
          icon={Activity}
        />
        <StatCard 
          label={t("Monitoring.guardians")} 
          value={acceptedMembers}
          description={t("Monitoring.guardiansDesc")}
          icon={UserCheck}
        />
        <StatCard 
          label={t("Monitoring.captureNodes")} 
          value={activeDevices}
          description={t("Monitoring.captureNodesDesc")}
          icon={Smartphone}
        />
        <StatCard 
          label={t("Monitoring.heartSignals")} 
          value={interactions.metrics.commentCount}
          description={t("Monitoring.heartSignalsDesc")}
          icon={MessageSquare}
        />
      </div>

      <div className="bg-canvas-elevated border border-line rounded-2xl p-8 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-lg font-bold text-ink">{t("Audit.title")}</h3>
               <p className="text-sm text-muted mt-1">{t("Audit.subtitle")}</p>
            </div>
            <Link 
              href={routes.audit}
              className="px-4 py-2 rounded-xl bg-canvas border border-line text-xs font-bold text-ink hover:bg-canvas-elevated transition-all flex items-center gap-2"
            >
               <Eye size={14} />
               {t("Audit.openLog")}
            </Link>
         </div>
         
         <div className="p-6 rounded-2xl bg-canvas-depth border border-line flex items-center justify-between shadow-inner">
            <div>
               <p className="text-xl font-black text-ink">{audit.metrics.unreadSignals}</p>
               <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-1">{t("unreadSignals")}</p>
            </div>
            <div className="h-10 w-10 rounded-full border border-dashed border-line-strong flex items-center justify-center">
               <div className="h-2 w-2 rounded-full bg-accent animate-ping" />
            </div>
         </div>
      </div>
    </div>
  );
}
