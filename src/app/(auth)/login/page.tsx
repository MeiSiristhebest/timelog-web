"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { routes } from "@/lib/routes";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { Badge } from "@/components/ui/badge";
import { LoginForm } from "./login-form";
import { useTranslation } from "@/lib/hooks/use-translation";
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
    <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="panel-strong ambient-ring story-glow p-8 md:p-12 animate-fade-in">
        <p className="eyebrow">TimeLog Family Archive</p>
        <h1 className="display mt-5 max-w-xl text-5xl text-ink md:text-7xl">
          {t("Login.subtitle")}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted md:text-lg">
          {t("Login.description")}
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <p className="eyebrow mt-4">
              {t("Login.protectedPlayback")}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/80">
              {t("Login.protectedPlaybackDesc")}
            </p>
          </div>
          <div className="card p-5">
            <KeyRound className="h-5 w-5 text-accent" />
            <p className="eyebrow mt-4">
              {t("Login.familyControls")}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/80">
              {t("Login.familyControlsDesc")}
            </p>
          </div>
        </div>
      </section>

      <section className="panel ambient-ring p-8 md:p-10 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">{t("Login.signIn")}</p>
            <h2 className="display mt-3 text-3xl text-ink md:text-4xl">
              {t("Login.familyConsoleAccess")}
            </h2>
          </div>
          <Badge variant={isConfigured ? "default" : "destructive"}>
            {isConfigured ? "Connected" : "Preview"}
          </Badge>
        </div>

        <LoginForm next={next} />

        <div className="relative z-[999] mt-12 text-center isolate">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/register';
            }}
            className="inline-flex items-center justify-center w-full rounded-2xl bg-accent text-white h-14 text-lg shadow-lg hover:bg-accent-strong uppercase tracking-[0.18em] font-bold transition-all cursor-pointer"
          >
            Create Your Family Archive
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center text-sm text-muted">
          <span>{t("Login.needAccess")}</span>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--glass),transparent_60%)]" />
      <Suspense fallback={<LoginSkeleton />}>
        <div className="relative z-10 w-full max-w-6xl">
          <LoginContent searchParams={searchParams} />
        </div>
      </Suspense>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] opacity-50">
      <div className="panel-strong h-[600px] animate-pulse" />
      <div className="panel h-[600px] animate-pulse" />
    </div>
  );
}
