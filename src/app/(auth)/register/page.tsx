
"use client";

import Link from "next/link";
import { RegisterForm } from "./register-form";
import { routes } from "@/lib/routes";
import { useTranslation } from "@/lib/hooks/use-translation";
import { LanguageSelector } from "@/components/layout/language-selector";

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 bg-canvas">
      {/* Floating Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Background with warm Heritage vibes */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--glass),transparent_40%)]" />
      <div className="pointer-events-none absolute -left-[20%] -bottom-[20%] h-[60%] w-[60%] rounded-full bg-accent/5 blur-[120px]" />
      
      <div className="panel relative w-full max-w-lg p-8 md:p-12 z-10 animate-slide-up animate-fade-in rounded-[2.5rem] border border-line bg-panel/75 shadow-2xl backdrop-blur-md">
        <div className="mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-strong">
              {t("Register.eyebrow")}
            </p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-ink font-bold tracking-tight leading-tight">
            {t("Register.title")}
          </h1>
          <p className="text-sm text-muted leading-relaxed font-medium">
            {t("Register.subtitle")}
          </p>
        </div>

        <RegisterForm />

        <div className="mt-8 pt-8 border-t border-line text-center space-y-4">
          <p className="text-xs text-muted font-medium">{t("Register.alreadyHaveAccount")}</p>
          <Link
            href={routes.login}
            className="inline-flex items-center justify-center w-full rounded-2xl border border-line bg-canvas-depth/50 hover:bg-canvas-depth text-ink h-14 text-sm font-bold tracking-wider uppercase transition-all"
          >
            {t("Register.signInToArchive")}
          </Link>
        </div>
      </div>
    </main>
  );
}

