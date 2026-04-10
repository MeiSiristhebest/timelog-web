"use client";

import { motion } from "framer-motion";
import { Database } from "lucide-react";
import { ExportArchiveButton } from "@/features/stories/components/export-archive-button";
import { useTranslation } from "@/lib/hooks/use-translation";

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
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function SovereigntyTab() {
  const { t } = useTranslation();

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-canvas-elevated border border-line rounded-3xl p-10 shadow-sm border-dashed">
        <div className="flex items-center gap-6 mb-10">
          <div className="h-16 w-16 rounded-2xl bg-canvas flex items-center justify-center shadow-lg border border-line">
            <Database className="text-accent" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-ink tracking-tight">{t("Settings.exportTitle")}</h3>
            <p className="text-base text-muted mt-1 font-medium">{t("Settings.exportSubtitle")}</p>
          </div>
        </div>
        
        <div className="p-8 rounded-[2rem] border border-line bg-panel shadow-inner max-w-2xl">
          <p className="text-base text-muted leading-relaxed mb-8 italic font-bold opacity-80">
            {t("Settings.exportBody")}
          </p>
          <ExportArchiveButton />
          <p className="text-[10px] text-muted mt-6 uppercase tracking-widest font-black opacity-50">
            {t("Settings.formatNote")}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
         <motion.div variants={itemVariants} className="p-8 rounded-3xl bg-canvas-elevated text-ink border border-line shadow-2xl shadow-line/10">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-4">{t("Settings.retentionPolicy")}</h4>
            <p className="text-sm text-muted leading-relaxed font-medium">
              {t("Settings.retentionDesc")}
            </p>
         </motion.div>
         <motion.div variants={itemVariants} className="p-8 rounded-3xl bg-canvas-elevated border border-line hover:shadow-md transition-all">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted mb-4 opacity-60">{t("Settings.encryptionPolicy")}</h4>
            <p className="text-sm text-muted leading-relaxed font-medium">
              {t("Settings.encryptionDesc")}
            </p>
         </motion.div>
      </div>
    </motion.div>
  );
}
