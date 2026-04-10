"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createFamilyInviteAction,
  type FamilyInviteActionState,
} from "../actions";

import { useTranslations } from "next-intl";

const initialState: FamilyInviteActionState = {
  status: "idle",
  message: null,
  inviteToken: null,
};

function SubmitButton() {
  const t = useTranslations("Family");
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-line-strong bg-accent px-5 py-2 text-sm font-medium text-black transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? t("issuing") : t("inviteFormTitle")}
    </button>
  );
}

export function FamilyInviteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations("Family");
  const [state, formAction] = useActionState(createFamilyInviteAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <div className="rounded-[1.5rem] border border-line bg-black/10 p-5">
      <p className="eyebrow">{t("inviteFormTitle")}</p>
      <form ref={formRef} action={formAction} className="mt-4 space-y-4">
        <input
          type="email"
          name="email"
          placeholder={t("invitePlaceholder")}
          className="w-full rounded-[1.25rem] border border-line bg-black/10 px-4 py-3 text-sm text-ink outline-none transition focus:border-line-strong"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={`text-sm ${
              state.status === "error" ? "text-danger" : "text-muted"
            }`}
          >
            {state.message ?? t("inviteHelpText")}
          </p>
          <SubmitButton />
        </div>
      </form>
      {state.inviteToken ? (
        <div className="mt-4 rounded-[1.25rem] border border-accent/20 bg-accent/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-strong">
            {t("inviteToken")}
          </p>
          <p className="mt-2 break-all font-mono text-sm text-ink">
            {state.inviteToken}
          </p>
        </div>
      ) : null}
    </div>
  );
}
