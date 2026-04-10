import { DevicePairingForm } from "@/features/devices/components/device-pairing-form";
import { DevicesDataTable } from "@/features/devices/components/devices-data-table";
import { getDevices } from "@/features/devices/queries";
import { Radio, RefreshCw, Cpu } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function DevicesPage() {
  const t = await getTranslations();
  const devices = await getDevices();
  const activeCount = devices.filter((device) => device.status === "active").length;
  const revokedCount = devices.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
         <div>
            <h1 className="text-3xl font-bold text-ink tracking-tight">{t("Devices.recordingConsole")}</h1>
            <p className="text-sm text-muted mt-1">{t("Devices.subtitle")}</p>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <span className="text-2xl font-bold text-ink">{activeCount}</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted">{t("Devices.statusConnected")}</span>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="flex items-center gap-2">
               <span className="text-2xl font-bold text-muted">{revokedCount}</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted">{t("Audit.metrics.security")}</span>
            </div>
         </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Device Table */}
        <div className="space-y-6">
           <DevicesDataTable devices={devices} />
        </div>

        {/* Pairing Sidebar */}
        <div className="space-y-6">
          <div className="bg-[var(--canvas-elevated)] border border-[var(--line)] rounded-2xl p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-6 text-accent">
                <RefreshCw size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest">{t("Devices.pairNew")}</h3>
             </div>
             <DevicePairingForm />
             <div className="mt-6 pt-6 border-t border-line">
                <p className="text-[10px] leading-relaxed text-muted font-bold italic">
                  {t("Devices.pairingNote")}
                </p>
             </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cpu size={60} />
            </div>
            <h4 className="text-sm font-bold mb-2">{t("Devices.v2Api")}</h4>
            <p className="text-xs text-white/80 leading-relaxed font-medium mb-4">
              {t("Devices.audioStreamDesc")}
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 w-fit">
               <Radio size={12} className="text-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest">{t("Devices.protocolActive")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
