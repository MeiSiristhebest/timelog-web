"use client";

import { ReactNode, Suspense, useState } from "react";
import { ArchiveNameForm } from "@/features/family/components/archive-name-form";
import { 
  Settings as SettingsIcon, 
  ShieldCheck
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/hooks/use-translation";
import { SovereigntyTab } from "./sovereignty-tab";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
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

export default function SettingsClient({
  userDisplayName,
  monitoringContent
}: {
  userDisplayName: string;
  monitoringContent: ReactNode;
}) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("general");

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
         <div>
            <h1 className="text-4xl font-black text-ink tracking-tight">{t("Settings.title")}</h1>
            <p className="text-sm text-muted mt-1 font-medium">{t("Settings.subtitle")}</p>
         </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink text-canvas shadow-xl shadow-ink/10">
            <ShieldCheck size={14} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t("Settings.adminAuthorized")}</span>
          </div>
      </motion.div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="bg-[var(--canvas-elevated)] border border-[var(--line)] p-1 h-12">
          <TabsTrigger value="general" className="px-6 rounded-md data-[state=active]:bg-panel data-[state=active]:shadow-sm transition-all font-bold text-xs uppercase tracking-widest">{t("Settings.tabGeneral")}</TabsTrigger>
          <TabsTrigger value="sovereignty" className="px-6 rounded-md data-[state=active]:bg-panel data-[state=active]:shadow-sm transition-all font-bold text-xs uppercase tracking-widest">{t("Settings.tabSovereignty")}</TabsTrigger>
          <TabsTrigger value="monitoring" className="px-6 rounded-md data-[state=active]:bg-panel data-[state=active]:shadow-sm transition-all font-bold text-xs uppercase tracking-widest">{t("Settings.tabMonitoring")}</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === "general" && (
            <TabsContent key="general" value="general" className="mt-8 outline-none">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-6 xl:grid-cols-[1fr_340px]"
              >
                <div className="space-y-6">
                  <ArchiveNameForm initialName={userDisplayName} />
                  
                  <motion.div variants={itemVariants} className="bg-canvas-elevated border border-line rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-500">
                     <h4 className="text-[11px] font-black text-ink uppercase tracking-widest mb-8 flex items-center gap-2 opacity-60">
                        <SettingsIcon size={14} className="text-muted" />
                        {t("Settings.archivePrefs")}
                     </h4>
                     <div className="space-y-4">
                         <div className="group flex items-center justify-between p-5 rounded-[1.5rem] bg-canvas-elevated border border-line shadow-sm hover:border-accent/20 transition-all">
                            <div>
                               <p className="text-sm font-black text-ink">{t("Settings.pushNotifications")}</p>
                               <p className="text-xs text-muted font-medium mt-0.5">{t("Settings.pushNotificationsDesc")}</p>
                            </div>
                            <div className="h-6 w-11 rounded-full bg-line p-1 cursor-not-allowed opacity-50">
                               <div className="h-4 w-4 rounded-full bg-panel shadow-sm" />
                            </div>
                         </div>
                         <div className="group flex items-center justify-between p-5 rounded-[1.5rem] bg-canvas-elevated border border-line shadow-sm hover:border-accent/40 transition-all bg-accent/5">
                            <div>
                               <p className="text-sm font-black text-ink">{t("Settings.aiGuidance")}</p>
                               <p className="text-xs text-muted font-medium mt-0.5">{t("Settings.aiGuidanceDesc")}</p>
                            </div>
                            <div className="h-6 w-11 rounded-full bg-accent p-1 flex justify-end shadow-lg shadow-accent/20 cursor-pointer">
                               <div className="h-4 w-4 rounded-full bg-accent-foreground shadow-sm" />
                            </div>
                         </div>
                     </div>
                  </motion.div>
                </div>

                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="p-8 rounded-3xl bg-canvas-elevated border border-line shadow-2xl shadow-line/10">
                    <h4 className="text-[10px] font-black text-accent uppercase tracking-widest mb-6 opacity-80">{t("Settings.governanceSnapshot")}</h4>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted font-medium">{t("Settings.accountRole")}</span>
                        <span className="text-xs font-black text-accent">{t("Settings.roleAdmin")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted font-medium">{t("Settings.cloudSync")}</span>
                        <span className="text-xs font-black text-success">{t("Settings.statusActive")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted font-medium">{t("Settings.lastBackup")}</span>
                        <span className="text-xs font-black text-ink italic opacity-70">
                          {t("Settings.Backup.today")}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </TabsContent>
          )}

          {activeTab === "sovereignty" && (
            <TabsContent key="sovereignty" value="sovereignty" className="mt-8 outline-none">
              <SovereigntyTab />
            </TabsContent>
          )}

          {activeTab === "monitoring" && (
            <TabsContent key="monitoring" value="monitoring" className="mt-8 outline-none">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {monitoringContent}
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}
