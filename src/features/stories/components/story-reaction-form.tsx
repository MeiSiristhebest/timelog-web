"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import {
  toggleStoryReactionAction,
  type StoryActionState,
} from "../actions";

const initialState: StoryActionState = {
  status: "idle",
  message: null,
};

function ReactionButton({ active }: { active: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations("Stories");

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full border px-4 py-2 text-sm uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-accent/40 bg-accent/10 text-accent-strong hover:border-accent"
          : "border-line bg-black/10 text-muted hover:border-line-strong hover:text-ink"
      }`}
    >
      {pending ? t("reactionSaving") : active ? t("reactionRemove") : t("reactionSend")}
    </button>
  );
}

export function StoryReactionForm({
  storyId,
  hasHearted,
}: {
  storyId: string;
  hasHearted: boolean;
}) {
  const [state, formAction] = useActionState(toggleStoryReactionAction, initialState);
  const t = useTranslations("Stories");

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="storyId" value={storyId} />
      <input type="hidden" name="reactionType" value="heart" />
      <ReactionButton active={hasHearted} />
      <p
        className={`text-sm ${
          state.status === "error" ? "text-danger" : "text-muted"
        }`}
      >
        {state.message ?? t("reactionLimit")}
      </p>
    </form>
  );
}
