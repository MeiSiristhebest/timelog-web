"use client";

import { useActionState } from "react";
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

  const inputClasses = "w-full rounded-2xl border border-line bg-glass px-4 py-4 text-base text-ink outline-none transition focus:border-line-strong focus:bg-panel placeholder:text-muted";

  if (state.success) {
    return (
      <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6 relative">
          <Mail className="h-10 w-10 text-accent animate-pulse" />
          <div className="absolute -top-1 -right-1 bg-canvas rounded-full p-1 border border-line">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
        </div>
        
        <h2 className="display text-2xl text-ink mb-4">Check Your Inbox</h2>
        
        <p className="text-muted leading-relaxed mb-8">
          We've sent a magical link to your email. Please click it to verify your account and begin preserving your family's heritage.
        </p>

        <div className="panel bg-accent/5 p-4 rounded-2xl border border-accent/10 mb-8 inline-block w-full">
          <p className="text-xs text-muted">
            <span className="font-semibold text-accent">Tip:</span> If you don't see the email within 2 minutes, please check your <span className="underline decoration-accent/30 decoration-2">spam or junk folder</span>.
          </p>
        </div>

        <Link
          href={routes.login}
          className="text-accent underline-offset-4 hover:underline font-medium block"
        >
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="displayName" className="eyebrow block">
          Display Name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          placeholder="e.g. Grandma Rose or Son John"
          required
          autoComplete="name"
          className={inputClasses}
        />
        <p className="text-xs text-muted/70 mt-1.5 px-1 leading-relaxed">
          How you want to be identified in your family circle.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="eyebrow block">
          {t("Login.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="your@family-email.com"
          required
          autoComplete="email"
          className={inputClasses}
        />
        <p className="text-xs text-muted/70 mt-1.5 px-1 leading-relaxed">
          Used for secure login and staying updated with new family stories.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" senior-accessible="true" className="eyebrow block">
          {t("Login.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          className={inputClasses}
        />
        <p className="text-xs text-muted/70 mt-1.5 px-1 leading-relaxed">
          Must be at least 6 characters. Use something memorable.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="eyebrow block">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          required
          autoComplete="new-password"
          className={inputClasses}
        />
      </div>

      {state.error && (
        <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-danger shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
          {state.error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-accent hover:bg-accent-strong text-white h-14 text-lg shadow-lg shadow-accent/20 transition-all font-bold tracking-tight"
        disabled={isPending}
      >
        {isPending ? (
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Creating Archive...</span>
          </div>
        ) : (
          "Create Family Archive"
        )}
      </Button>
    </form>
  );
}
