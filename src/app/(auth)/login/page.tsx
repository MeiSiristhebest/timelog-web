"use client";

import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";
import { routes } from "@/lib/routes";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { Badge } from "@/components/ui/badge";
import { LoginForm } from "./login-form";
import { useTranslation } from "@/lib/hooks/use-translation";
import { LanguageSelector } from "@/components/layout/language-selector";
import { use, Suspense } from "react";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

function LoginContent({ searchParams }: LoginPageProps) {
  const { t } = useTranslation();
  const isConfigured = hasSupabaseEnv();
  const resolvedSearchParams = use(searchParams as Promise<{ next?: string }>);
  const next = resolvedSearchParams?.next ?? routes.overview;

  return (
    <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
      {/* Left Feature Panel: Warm Heritage Storybook Vibe */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-line bg-gradient-to-br from-panel-strong/60 to-canvas-depth p-8 md:p-14 shadow-2xl backdrop-blur-md animate-fade-in group min-h-[600px] flex flex-col justify-between">
        {/* Soft heritage background glow */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-accent/10 blur-3xl transition-all duration-1000 group-hover:bg-accent/25" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-accent/5 blur-3xl transition-all duration-1000 group-hover:bg-accent/15" />

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-strong">
              TimeLog Family Archive
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-ink font-semibold leading-tight tracking-tight">
            {t("Login.subtitle")}
          </h1>
          <p className="max-w-xl text-sm md:text-base leading-relaxed text-muted font-medium">
            {t("Login.description")}
          </p>
        </div>

        <div className="relative mt-12 grid gap-6 md:grid-cols-2">
          {/* Card 1 */}
          <div className="rounded-[1.75rem] border border-line bg-canvas/40 p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-line-strong hover:bg-canvas/80 hover:shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-ink mt-5">
              {t("Login.protectedPlayback")}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted font-medium">
              {t("Login.protectedPlaybackDesc")}
            </p>
          </div>
          {/* Card 2 */}
          <div className="rounded-[1.75rem] border border-line bg-canvas/40 p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-line-strong hover:bg-canvas/80 hover:shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10">
              <KeyRound className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-ink mt-5">
              {t("Login.familyControls")}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted font-medium">
              {t("Login.familyControlsDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* Right Login Panel */}
      <section className="relative rounded-[2.5rem] border border-line bg-panel/75 p-8 md:p-12 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col justify-between min-h-[600px]">
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow tracking-widest">{t("Login.signIn")}</p>
              <h2 className="display mt-3 text-3xl text-ink font-bold tracking-tight">
                {t("Login.familyConsoleAccess")}
              </h2>
            </div>
            <Badge variant={isConfigured ? "default" : "destructive"} className="px-3 py-1 font-bold text-[10px] tracking-wider uppercase">
              {isConfigured ? "Connected" : "Preview"}
            </Badge>
          </div>

          <LoginForm next={next} />
        </div>

        <div className="mt-12 space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <span className="relative bg-panel px-3 text-[10px] font-black uppercase tracking-widest text-muted">
              Or
            </span>
          </div>

          <Link 
            href="/register"
            className="flex items-center justify-center w-full rounded-2xl bg-accent hover:bg-accent-strong text-white h-14 text-sm shadow-lg shadow-accent/10 hover:shadow-accent/25 uppercase tracking-[0.2em] font-black transition-all cursor-pointer"
          >
            {t("Login.createAccount")}
          </Link>

          <div className="text-center text-xs text-muted font-medium">
            <span>{t("Login.needAccess")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 bg-canvas">
      {/* Floating Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Radiant warm light source */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--glass),transparent_60%)]" />
      <div className="pointer-events-none absolute -right-[20%] -top-[20%] h-[60%] w-[60%] rounded-full bg-accent/5 blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-6xl">
        <Suspense fallback={<LoginSkeleton />}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] opacity-50">
      <div className="rounded-[2.5rem] border border-line bg-canvas-elevated h-[600px] animate-pulse" />
      <div className="rounded-[2.5rem] border border-line bg-canvas h-[600px] animate-pulse" />
    </div>
  );
}

