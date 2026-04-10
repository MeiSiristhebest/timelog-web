"use client";

import { useActionState, useEffect, useState } from "react";
import { sendFamilyQuestionAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MessageSquarePlus, User } from "lucide-react";
import type { SeniorView } from "@/features/family/queries";
import { useTranslations } from "next-intl";

interface QuestionFormProps {
  seniors: SeniorView[];
}

export function QuestionForm({ seniors }: QuestionFormProps) {
  const t = useTranslations("Interactions");
  const [selectedSeniorId, setSelectedSeniorId] = useState<string>(
    seniors.length === 1 ? seniors[0].id : ""
  );

  const [state, formAction, isPending] = useActionState(sendFamilyQuestionAction, {
    status: "idle",
    message: null,
  });

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      // Optional: clear form
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  if (seniors.length === 0) {
    return (
      <div className="card p-8 border-dashed flex flex-col items-center justify-center text-center bg-canvas-depth/50">
        <User className="h-10 w-10 text-muted mb-4 opacity-20" />
        <p className="text-sm text-muted font-medium">{t("noStorytellerTitle")}</p>
        <p className="text-xs text-muted/60 mt-2 italic">{t("noStorytellerDesc")}</p>
      </div>
    );
  }

  return (
    <div className="card p-6 md:p-8 ambient-ring shadow-sm bg-canvas-depth/30">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <MessageSquarePlus className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h3 className="display text-xl text-ink">{t("formTitle")}</h3>
          <p className="text-sm text-muted">{t("formSubtitle")}</p>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Senior Selector */}
        {seniors.length > 1 && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold eyebrow text-muted uppercase tracking-wider">{t("selectStoryteller")}</label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {seniors.map((senior) => (
                <button
                  key={senior.id}
                  type="button"
                  onClick={() => setSelectedSeniorId(senior.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    selectedSeniorId === senior.id
                      ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                      : "border-line bg-canvas hover:border-line-strong"
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-canvas-depth flex items-center justify-center overflow-hidden border border-line">
                    {senior.avatarUrl ? (
                      <img src={senior.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-muted" />
                    )}
                  </div>
                  <span className={`text-xs font-semibold truncate ${
                    selectedSeniorId === senior.id ? "text-accent" : "text-ink"
                  }`}>
                    {senior.displayName}
                  </span>
                </button>
              ))}
            </div>
            <input type="hidden" name="seniorId" value={selectedSeniorId} />
          </div>
        )}

        {seniors.length === 1 && (
          <input type="hidden" name="seniorId" value={seniors[0].id} />
        )}

        {/* Question Text */}
        <div className="space-y-2">
          <label htmlFor="questionText" className="text-[10px] font-bold eyebrow text-muted uppercase tracking-wider">
            {t("yourPrompt")}
          </label>
          <Textarea
            id="questionText"
            name="questionText"
            placeholder={t("placeholder")}
            required
            className="min-h-[120px] bg-canvas/80 border-line focus:border-accent resize-none text-base italic leading-relaxed selection:bg-accent/20"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending || (seniors.length > 1 && !selectedSeniorId)}
          className="w-full h-12 bg-ink hover:bg-ink/90 text-white font-semibold transition-all shadow-sm rounded-xl"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("sending")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </form>
    </div>
  );
}
