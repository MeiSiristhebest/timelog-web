"use client";

import { useState } from "react";
import { Download, Loader2, Database } from "lucide-react";
import { exportAllDataAction } from "../../admin/export-actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function ExportArchiveButton() {
  const t = useTranslations("Settings");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    toast.info("Aggregating family history memories...", { duration: 2000 });
    
    try {
      const result = await exportAllDataAction();
      
      if (result.status === "success" && result.data) {
        const jsonContent = JSON.stringify(result.data, null, 2);
        const fileName = `TimeLog_Archive_Backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const blob = new Blob([jsonContent], { type: "application/json" });
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        
        toast.success("Archive data successfully exported");
      } else {
        toast.error(result.message || "Export deviation occurred");
      }
    } catch (error) {
      console.error("Export failure:", error);
      toast.error("Export could not be completed due to system constraints.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-3 w-full px-6 py-4 rounded-2xl bg-ink text-canvas hover:bg-black transition-all disabled:opacity-50 group"
    >
      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
        {isExporting ? (
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        ) : (
          <Database className="h-5 w-5 text-accent" />
        )}
      </div>
      <div className="text-left">
        <p className="text-sm font-bold tracking-wide">{t("exportTitle")}</p>
        <p className="text-[10px] text-canvas/60 uppercase tracking-widest mt-0.5">
          {isExporting ? "Bundling total archive data..." : t("formatNote")}
        </p>
      </div>
      <Download className="h-5 w-5 ml-auto opacity-40 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
