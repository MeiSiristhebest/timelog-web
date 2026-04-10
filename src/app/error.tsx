"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, ShieldAlert } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
      <div className="relative mb-12 flex flex-col items-center">
        <div className="absolute inset-0 bg-danger/10 blur-[100px] rounded-full" />
        <div className="relative text-[16vw] md:text-[180px] font-black leading-none text-danger tracking-tighter opacity-10 select-none">
          ERR
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-3xl bg-canvas-elevated border border-danger/30 shadow-2xl flex items-center justify-center -rotate-12 transition-transform hover:rotate-0 duration-500">
          <ShieldAlert size={80} className="text-danger/40" />
        </div>
      </div>

      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-black text-ink tracking-tight italic">System Interference Detected</h1>
        <p className="text-sm text-muted font-bold uppercase tracking-widest leading-relaxed">
          An unexpected anomaly occurred during archival processing. The connection to the heritage vault was momentarily interrupted.
        </p>
        
        <div className="p-4 bg-danger/5 border border-danger/10 rounded-2xl">
           <p className="text-[10px] font-black text-danger uppercase tracking-tight font-mono truncate">
              ID: {error.digest || "CORE_SYNC_FATAL_0x1"}
           </p>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => reset()}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCcw size={14} />
            Attempt Recovery
          </button>
          
          <button 
            onClick={() => window.location.href = '/overview'}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-canvas-elevated border border-line text-ink rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-canvas-depth transition-all"
          >
            Emergency Exit
          </button>
        </div>
      </div>

      <div className="mt-32 text-[10px] font-black text-muted uppercase tracking-widest opacity-20 italic">
         System logs have been dispatched to central governance for analysis.
      </div>
    </div>
  );
}
