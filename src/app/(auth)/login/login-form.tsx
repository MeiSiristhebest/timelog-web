"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
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
      className="w-full justify-between"
      disabled={pending}
      aria-busy={pending}
    >
      <span>{pending ? t("Login.enteringArchive") : t("Login.continue")}</span>
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </Button>
  );
}

export function LoginForm({ next = "/overview" }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);
  const { t } = useTranslation();

  return (
    <form action={formAction} className="mt-10 space-y-5" aria-label="Sign in to your family account">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <label htmlFor="email" className="eyebrow block">
          {t("Login.email")}
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="family@example.com"
          autoComplete="email"
          required
          className="w-full rounded-2xl border border-line bg-glass px-4 py-4 text-base text-ink outline-none transition focus:border-line-strong"
          aria-required="true"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="eyebrow block">
          {t("Login.password")}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-line bg-glass px-4 py-4 text-base text-ink outline-none transition focus:border-line-strong"
          aria-required="true"
        />
      </div>
      {state.error ? (
        <p
          id="login-error"
          role="alert"
          className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger"
        >
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
