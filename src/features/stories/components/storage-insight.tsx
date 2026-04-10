"use client";

import { Database, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface StorageInsightProps {
  usedMs: number;
  totalHoursLimit?: number;
}

export function StorageInsight({ usedMs, totalHoursLimit = 100 }: StorageInsightProps) {
  const t = useTranslations("Stories");
  
  // Calculate hours with 100h as the visual base (per user decision)
  const usedHours = Math.round((usedMs / (1000 * 60 * 60)) * 10) / 10;
  const percentage = Math.min(Math.round((usedHours / totalHoursLimit) * 100), 100);

  return (
    <article className="card p-8 bg-ink text-white border-line-strong/5 relative overflow-hidden group shadow-2xl shadow-ink/40">
      {/* Decorative background design (Heritage Echo) */}
      <Database className="absolute -bottom-6 -right-6 h-40 w-40 text-white/5 rotate-12 transition-all group-hover:scale-110 group-hover:rotate-0 group-hover:text-accent/10 duration-1000" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-accent/40 transition-colors duration-500">
            <Clock className="h-6 w-6 text-accent animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <p className="eyebrow text-accent/60 tracking-[0.3em] font-black">{t("storageDesc")}</p>
            <h3 className="display text-2xl text-white mt-1">{t("storageTitle")}</h3>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div className="flex items-baseline gap-2">
            <span className="display text-6xl md:text-7xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{usedHours}</span>
            <div className="flex flex-col mb-2">
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Quota</span>
               <span className="text-sm font-bold text-white/30 uppercase tracking-widest leading-none">
                 / {totalHoursLimit} {t("totalHours", { defaultValue: "Hours" })}
               </span>
            </div>
          </div>
          <div className="text-right pb-2">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-black mb-1">
              ARCHIVE INTEGRITY
            </p>
            <p className="display text-3xl text-white/10 leading-none">{percentage}%</p>
          </div>
        </div>

        {/* Liquid Memory Bar */}
        <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent via-accent-strong to-accent transition-all duration-1000 ease-out flex items-center justify-end"
            style={{ width: `${percentage}%` }}
          >
             <div className="w-1.5 h-full bg-white/40 blur-[2px] animate-pulse" />
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
           <p className="text-xs text-white/40 italic max-w-xs leading-relaxed">
             {t("capacity", { used: usedHours, total: totalHoursLimit })}
           </p>
           <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[9px] font-black text-accent uppercase tracking-widest">Active Preserve</span>
           </div>
        </div>
      </div>
    </article>
  );
}
