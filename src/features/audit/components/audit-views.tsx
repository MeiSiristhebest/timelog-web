"use client";

import Link from "next/link";
import { getAuditOverview, type AuditOverview, type AuditEventView } from "@/features/audit/queries";
import { storyRoute } from "@/lib/routes";
import { History, Activity, MessageSquare, Clock } from "lucide-react";
import { useTranslation } from "@/lib/hooks/use-translation";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function AuditMetrics({ overview }: { overview: AuditOverview }) {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <motion.article variants={itemVariants} className="panel p-6 bg-accent/5 border-accent/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/10 rounded-lg text-accent-strong">
            <MessageSquare className="h-4 w-4" />
          </div>
          <p className="eyebrow text-accent-strong">{t("Audit.metrics.unread")}</p>
        </div>
        <p className="display text-5xl text-ink tracking-tighter">{overview.metrics.unreadSignals}</p>
        <p className="mt-3 text-[10px] text-muted leading-relaxed font-bold uppercase tracking-widest opacity-60">
          {t("Audit.metrics.unreadDesc")}
        </p>
      </motion.article>

      <motion.article variants={itemVariants} className="panel p-6">
        <div className="flex items-center gap-3 mb-4 text-muted">
          <History className="h-4 w-4" />
          <p className="eyebrow">{t("Audit.metrics.invites")}</p>
        </div>
        <p className="display text-5xl text-ink tracking-tighter">{overview.metrics.pendingInvites}</p>
        <p className="mt-3 text-[10px] text-muted leading-relaxed font-bold uppercase tracking-widest opacity-60">
          {t("Audit.metrics.invitesDesc")}
        </p>
      </motion.article>

      <motion.article variants={itemVariants} className="panel p-6">
        <div className="flex items-center gap-3 mb-4 text-muted">
          <Clock className="h-4 w-4" />
          <p className="eyebrow">{t("Audit.metrics.recent")}</p>
        </div>
        <p className="display text-5xl text-ink tracking-tighter">{overview.metrics.recentEvents}</p>
        <p className="mt-3 text-[10px] text-muted leading-relaxed font-bold uppercase tracking-widest opacity-60">
          {t("Audit.metrics.recentDesc")}
        </p>
      </motion.article>

      <motion.article variants={itemVariants} className="panel p-6 bg-canvas-elevated">
        <div className="flex items-center gap-3 mb-4 text-muted">
          <Activity className="h-4 w-4" />
          <p className="eyebrow">{t("Audit.metrics.security")}</p>
        </div>
        <p className="display text-5xl text-ink tracking-tighter">{overview.metrics.revokedDevices}</p>
        <p className="mt-3 text-[10px] text-muted leading-relaxed font-bold uppercase tracking-widest opacity-60">
          {t("Audit.metrics.securityDesc")}
        </p>
      </motion.article>
    </motion.div>
  );
}

export function ActivityTimeline({ overview }: { overview: AuditOverview }) {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mt-12 relative"
    >
      <div className="absolute left-6 top-0 bottom-0 w-px bg-line hidden md:block" />

      <div className="space-y-8">
        {overview.items.length > 0 ? (
          overview.items.map((item: AuditEventView, i: number) => {
            const content = (
              <motion.div variants={itemVariants} className="relative pl-0 md:pl-16">
                <div className="absolute left-4 top-4 h-4 w-4 rounded-full border-4 border-panel bg-accent shadow-sm hidden md:block" />
                
                <div className={item.storyId ? "group hover:transform hover:translate-x-1 transition-all duration-300" : ""}>
                  <div className={`p-8 rounded-[2rem] border transition-all duration-500 hover:shadow-xl ${
                    item.status === "unread" 
                      ? "bg-accent/5 border-accent/20 shadow-md shadow-accent/5" 
                      : "bg-panel border-line shadow-sm hover:shadow-line/20"
                  }`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="eyebrow text-[10px] py-1 px-3 bg-ink rounded-full text-canvas font-black tracking-widest uppercase">
                            {item.kind}
                          </span>
                          {item.status === "unread" && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/20">
                               <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                               <span className="text-[9px] font-black text-accent-strong uppercase tracking-[0.1em]">{t("Audit.activeSignal")}</span>
                            </div>
                          )}
                        </div>
                        <h2 className="display text-3xl text-ink leading-tight tracking-tight">{item.summary}</h2>
                        <div className="flex items-center gap-4 mt-6">
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-accent-strong">
                            {item.actorLabel}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-line" />
                          <span className="text-[11px] font-bold text-muted flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            {item.timestampLabel}
                          </span>
                        </div>
                      </div>
 
                      {item.status === "unread" && (
                        <div className="badge border-accent/30 bg-accent text-canvas font-black uppercase tracking-widest text-[9px] shadow-lg shadow-accent/20 px-3 py-1">
                          {t("Audit.newBadge")}
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-6 text-sm leading-8 text-muted max-w-2xl bg-canvas-depth p-6 rounded-2xl italic border border-line/30 font-medium">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </motion.div>
            );

            const safeKey = item.id || `audit-item-${i}`;

            if (item.storyId) {
              return (
                <Link key={safeKey} href={storyRoute(item.storyId)} className="block">
                  {content}
                </Link>
              );
            }

            return <article key={safeKey}>{content}</article>;
          })
        ) : (
          <motion.div variants={itemVariants} className="pl-0 md:pl-16 relative">
             <div className="absolute left-4 top-4 h-4 w-4 rounded-full border-4 border-panel bg-line shadow-sm hidden md:block" />
             <article className="panel p-16 text-center bg-canvas-elevated/30 border-dashed">
               <p className="text-sm italic text-muted font-bold">{t("Audit.emptyNote")}</p>
             </article>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
