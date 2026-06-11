"use client";

import { ReactNode, useState, useEffect } from "react";
import { ArchiveNameForm } from "@/features/family/components/archive-name-form";
import { 
  Settings as SettingsIcon, 
  ShieldCheck
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/hooks/use-translation";
import { SovereigntyTab } from "./sovereignty-tab";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  const [pushEnabled, setPushEnabled] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPushEnabled(localStorage.getItem("settings_push_enabled") === "true");
      setAiEnabled(localStorage.getItem("settings_ai_enabled") !== "false");
    }
  }, []);

  const togglePush = () => {
    const newVal = !pushEnabled;
    setPushEnabled(newVal);
    localStorage.setItem("settings_push_enabled", String(newVal));
    toast.success(t("Settings.preferenceUpdated"));
  };

  const toggleAi = () => {
    const newVal = !aiEnabled;
    setAiEnabled(newVal);
    localStorage.setItem("settings_ai_enabled", String(newVal));
    toast.success(t("Settings.preferenceUpdated"));
  };

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
                         <div 
                           onClick={togglePush}
                           className="group flex items-center justify-between p-5 rounded-[1.5rem] bg-canvas-elevated border border-line shadow-sm hover:border-accent/20 transition-all cursor-pointer"
                         >
                            <div>
                               <p className="text-sm font-black text-ink">{t("Settings.pushNotifications")}</p>
                               <p className="text-xs text-muted font-medium mt-0.5">{t("Settings.pushNotificationsDesc")}</p>
                            </div>
                            <div className={cn(
                              "h-6 w-11 rounded-full p-1 transition-all duration-300 relative flex items-center shrink-0",
                              pushEnabled ? "bg-accent shadow-lg shadow-accent/20" : "bg-line"
                            )}>
                               <div className={cn(
                                 "h-4 w-4 rounded-full bg-panel shadow-sm transform transition-transform duration-300",
                                 pushEnabled ? "translate-x-5" : "translate-x-0"
                               )} />
                            </div>
                         </div>
                         <div 
                           onClick={toggleAi}
                           className="group flex items-center justify-between p-5 rounded-[1.5rem] bg-canvas-elevated border border-line shadow-sm hover:border-accent/40 transition-all cursor-pointer"
                         >
                            <div>
                               <p className="text-sm font-black text-ink">{t("Settings.aiGuidance")}</p>
                               <p className="text-xs text-muted font-medium mt-0.5">{t("Settings.aiGuidanceDesc")}</p>
                            </div>
                            <div className={cn(
                              "h-6 w-11 rounded-full p-1 transition-all duration-300 relative flex items-center shrink-0",
                              aiEnabled ? "bg-accent shadow-lg shadow-accent/20" : "bg-line"
                            )}>
                               <div className={cn(
                                 "h-4 w-4 rounded-full bg-panel shadow-sm transform transition-transform duration-300",
                                 aiEnabled ? "translate-x-5" : "translate-x-0"
                               )} />
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
