"use client";

import { useActionState, useState } from "react";
import { useTranslation } from "@/lib/hooks/use-translation";
import { registerAction, type RegisterActionState } from "./actions";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

const initialState: RegisterActionState = {
  error: null,
  success: false,
};

export function RegisterForm() {
  const { t } = useTranslation();
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [clientError, setClientError] = useState<string | null>(null);

  const inputClasses = "w-full rounded-2xl border border-line bg-canvas/40 px-4 py-4 text-base text-ink outline-none transition duration-300 focus:border-accent hover:border-line-strong focus:bg-canvas/80 focus:ring-4 focus:ring-accent/5 placeholder:text-muted";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError(null);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      e.preventDefault();
      setClientError(t("Register.passwordsDoNotMatch"));
    }
  };

  if (state.success) {
    return (
      <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6 relative">
          <Mail className="h-10 w-10 text-accent animate-pulse" />
          <div className="absolute -top-1 -right-1 bg-canvas rounded-full p-1 border border-line">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
        </div>
        
        <h2 className="display text-2xl text-ink font-bold mb-4">{t("Register.checkInbox")}</h2>
        
        <p className="text-muted text-sm leading-relaxed mb-8">
          {t("Register.checkInboxDesc")}
        </p>

        <div className="panel bg-accent/5 p-4 rounded-2xl border border-accent/10 mb-8 inline-block w-full">
          <p className="text-xs text-muted leading-relaxed font-medium">
            <span className="font-semibold text-accent">Tip:</span> {t("Register.checkInboxTip")}
          </p>
        </div>

        <Link
          href={routes.login}
          className="text-accent hover:text-accent-strong underline-offset-4 hover:underline font-bold text-sm uppercase tracking-wider block transition-all"
        >
          {t("Register.returnToSignIn")}
        </Link>
      </div>
    );
  }

  const activeError = clientError || state.error;

  return (
    <form onSubmit={handleSubmit} action={formAction} className="space-y-6">
      {/* Display Name */}
      <div className="space-y-2">
        <label htmlFor="displayName" className="text-[10px] font-black eyebrow text-muted uppercase tracking-widest block">
          {t("Register.displayName")}
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          placeholder={t("Register.displayNamePlaceholder")}
          required
          autoComplete="name"
          className={inputClasses}
        />
        <p className="text-xs text-muted/70 px-1 leading-relaxed font-medium">
          {t("Register.displayNameHelp")}
        </p>
      </div>

      {/* Email Address */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-[10px] font-black eyebrow text-muted uppercase tracking-widest block">
          {t("Register.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder={t("Register.emailPlaceholder")}
          required
          autoComplete="email"
          className={inputClasses}
        />
        <p className="text-xs text-muted/70 px-1 leading-relaxed font-medium">
          {t("Register.emailHelp")}
        </p>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-[10px] font-black eyebrow text-muted uppercase tracking-widest block">
          {t("Register.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder={t("Register.passwordPlaceholder")}
          required
          autoComplete="new-password"
          className={inputClasses}
        />
        <p className="text-xs text-muted/70 px-1 leading-relaxed font-medium">
          {t("Register.passwordHelp")}
        </p>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-[10px] font-black eyebrow text-muted uppercase tracking-widest block">
          {t("Register.confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder={t("Register.confirmPasswordPlaceholder")}
          required
          autoComplete="new-password"
          className={inputClasses}
        />
      </div>

      {activeError && (
        <div className="p-4 rounded-2xl bg-danger/5 border border-danger/20 text-danger text-sm animate-in fade-in slide-in-from-top-2 flex items-center gap-3 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-danger shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
          {activeError}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-accent hover:bg-accent-strong text-white h-14 text-sm shadow-lg shadow-accent/10 hover:shadow-accent/25 transition-all font-black uppercase tracking-[0.2em] rounded-2xl"
        disabled={isPending}
      >
        {isPending ? (
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("Register.creating")}</span>
          </div>
        ) : (
          t("Register.submit")
        )}
      </Button>
    </form>
  );
}

