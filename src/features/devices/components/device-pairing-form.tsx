"use client";

import { useActionState, useEffect } from "react";
import { verifyDeviceCodeAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function DevicePairingForm() {
  const t = useTranslations("Devices");
  const [state, formAction, isPending] = useActionState(verifyDeviceCodeAction, {
    status: "idle",
    message: null,
  });

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="card ambient-ring p-8 bg-canvas border-line">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <Link2 className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h3 className="display text-xl text-ink">{t("tableDevice")}</h3>
          <p className="text-sm text-muted">{t("pairDesc")}</p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="code" className="text-[10px] font-bold eyebrow text-muted uppercase tracking-wider">
              {t("pairingCodeLabel")}
            </label>
            <span className="text-[10px] text-muted italic">{t("pairingCodeDesc")}</span>
          </div>
          <Input
            id="code"
            name="code"
            type="text"
            placeholder="000-000"
            required
            maxLength={7}
            className="h-14 text-center text-3xl font-mono tracking-widest bg-canvas-depth border-line focus:ring-2 focus:ring-accent/10 text-ink"
            autoComplete="off"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-ink hover:bg-ink/90 text-white h-12 font-semibold transition-all shadow-md rounded-xl"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            t("establishConnection")
          )}
        </Button>
      </form>

      <p className="mt-6 text-[10px] text-center text-muted uppercase tracking-[0.05em] leading-relaxed font-medium">
        {t("pairingFooter")}
      </p>
    </div>
  );
}
