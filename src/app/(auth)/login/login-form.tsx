"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { loginAction, type LoginActionState } from "./actions";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Button } from "@/components/ui/button";

const initialState: LoginActionState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();

  return (
    <Button
      type="submit"
      className="w-full h-14 bg-ink hover:bg-ink/90 text-white font-semibold transition-all rounded-2xl flex items-center justify-between px-6 shadow-md shadow-ink/5 disabled:opacity-75"
      disabled={pending}
      aria-busy={pending}
    >
      <span>{pending ? t("Login.enteringArchive") : t("Login.continue")}</span>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
      )}
    </Button>
  );
}

export function LoginForm({ next = "/overview" }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const { t } = useTranslation();

  const inputClasses = "w-full rounded-2xl border border-line bg-canvas/40 px-4 py-4 text-base text-ink outline-none transition duration-300 focus:border-accent hover:border-line-strong focus:bg-canvas/80 focus:ring-4 focus:ring-accent/5 placeholder:text-muted";

  return (
    <form action={formAction} className="mt-10 space-y-6" aria-label="Sign in to your family account">
      <input type="hidden" name="next" value={next} />
      
      <div className="space-y-2">
        <label htmlFor="email" className="text-[10px] font-black eyebrow text-muted uppercase tracking-widest block">
          {t("Login.email")}
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder={t("Login.emailPlaceholder")}
          autoComplete="email"
          required
          className={inputClasses}
          aria-required="true"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-[10px] font-black eyebrow text-muted uppercase tracking-widest block">
          {t("Login.password")}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder={t("Login.passwordPlaceholder")}
          autoComplete="current-password"
          required
          className={inputClasses}
          aria-required="true"
        />
      </div>

      {state.error ? (
        <div
          id="login-error"
          role="alert"
          className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3.5 text-sm text-danger animate-in fade-in slide-in-from-top-2 flex items-center gap-3 font-medium"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-danger shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
          {state.error}
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}

