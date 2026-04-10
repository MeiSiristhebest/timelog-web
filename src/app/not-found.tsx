"use client";

import Link from "next/link";
import { MoveLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
      <div className="relative mb-12 flex flex-col items-center">
        <div className="absolute inset-0 bg-accent/10 blur-[100px] rounded-full" />
        <div className="relative text-[16vw] md:text-[200px] font-black leading-none text-ink tracking-tighter opacity-10 select-none">
          404
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-3xl bg-canvas-elevated border border-line shadow-2xl flex items-center justify-center rotate-12 transition-transform hover:rotate-0 duration-500">
          <HelpCircle size={80} className="text-accent/40" />
        </div>
      </div>

      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-black text-ink tracking-tight italic">Memory Lost in Space</h1>
        <p className="text-sm text-muted font-bold uppercase tracking-widest leading-relaxed">
          The archive you are searching for does not currently exist or has been relocated within the heritage vault.
        </p>
        
        <div className="pt-8">
          <Link 
            href="/overview"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
          >
            <MoveLeft size={14} />
            Return to Overview
          </Link>
        </div>
      </div>

      <div className="mt-32 text-[10px] font-black text-muted uppercase tracking-widest opacity-20 italic">
        TimeLog Heritage Archive Management System v2.0
      </div>
    </div>
  );
}
