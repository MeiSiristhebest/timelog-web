"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Clock, Play, CheckCircle2, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { storyRoute } from "@/lib/routes";
import type { FamilyQuestionView } from "../queries";

interface PromptsTrackerProps {
  questions: FamilyQuestionView[];
}

export function PromptsTracker({ questions }: PromptsTrackerProps) {
  const t = useTranslations("Interactions");

  return (
    <Card doubleBezel className="overflow-hidden flex flex-col mt-8">
      <div className="p-6 border-b border-line">
        <h3 className="text-lg font-bold text-ink tracking-tight">
          {t("promptsHistory")}
        </h3>
        <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-[0.15em]">
          {t("promptsHistoryDesc")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-canvas-elevated">
              <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted">
                {t("yourPrompt")}
              </th>
              <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted">
                {t("tableRecipient")}
              </th>
              <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted">
                {t("tableStatus")}
              </th>
              <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted">
                {t("tableDateSent")}
              </th>
              <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted text-right">
                {t("tableAction")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {questions.map((q) => {
              const isAnswered = !!q.recordingId;
              return (
                <tr key={q.id} className="group hover:bg-accent/[0.01] transition-colors">
                  {/* Prompt Text */}
                  <td className="px-6 py-4 max-w-sm">
                    <p className="text-sm font-bold text-ink leading-relaxed">
                      &ldquo;{q.questionText}&rdquo;
                    </p>
                    <span className="inline-flex mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-canvas-depth text-muted border border-line">
                      {q.category}
                    </span>
                  </td>
                  
                  {/* Senior Name */}
                  <td className="px-6 py-4 text-xs font-semibold text-ink">
                    {q.seniorName}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    {isAnswered ? (
                      <Badge variant="success" className="text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("statusAnswered")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                        {t("statusPending")}
                      </Badge>
                    )}
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4 text-xs text-muted font-bold">
                    {q.createdAtLabel}
                  </td>

                  {/* Play Link / Action */}
                  <td className="px-6 py-4 text-right">
                    {isAnswered && q.recordingId ? (
                      <Link
                        href={storyRoute(q.recordingId)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-strong transition-all px-3 py-1.5 rounded-full bg-accent/5 hover:bg-accent/10 cursor-pointer"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        {t("listenToAnswer")}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted px-3 py-1.5 rounded-full bg-canvas-depth cursor-not-allowed">
                        <Clock className="h-3 w-3" />
                        {t("statusAwaitingVoice")}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {questions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-16 text-center text-muted italic font-bold">
                  <div className="h-10 w-10 rounded-xl border border-dashed border-muted flex items-center justify-center mx-auto mb-4 opacity-40">
                    <HelpCircle className="h-5 w-5 text-muted" />
                  </div>
                  {t("noPrompts")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
