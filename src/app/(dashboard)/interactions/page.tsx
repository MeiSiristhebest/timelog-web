export const dynamic = "force-dynamic";

import Link from "next/link";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { RealtimeRefresh } from "@/features/realtime/components/realtime-refresh";
import { getInteractionsOverview, getFamilyQuestions } from "@/features/interactions/queries";
import { getLinkedSeniors } from "@/features/family/queries";
import { QuestionForm } from "@/features/interactions/components/question-form";
import { PromptsTracker } from "@/features/interactions/components/prompts-tracker";
import { buildInteractionRealtimeTargets } from "@/features/realtime/subscriptions";
import { storyRoute } from "@/lib/routes";
import { getTranslations } from "next-intl/server";

export default async function InteractionsPage() {
  const t = await getTranslations("Interactions");
  const [overview, seniors, questions] = await Promise.all([
    getInteractionsOverview(),
    getLinkedSeniors(),
    getFamilyQuestions(),
  ]);

  return (
    <SectionPlaceholder
      eyebrow={t("eyebrow")}
      title={t("pageTitle")}
      description={t("pageDescription")}
    >
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
        {/* Left Column: Question input and Prompt status tracker */}
        <div className="space-y-6">
          <QuestionForm seniors={seniors} />
          <PromptsTracker questions={questions} />
        </div>

        {/* Right Column: Interaction Metrics and Recent comments feed */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <article className="rounded-[1.5rem] border border-line bg-canvas-elevated p-5 shadow-sm">
              <p className="eyebrow">{t("metricsComments")}</p>
              <p className="display mt-4 text-4xl text-ink font-bold">{overview.metrics.commentCount}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {t("metricsCommentsDesc")}
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-line bg-canvas-elevated p-5 shadow-sm">
              <p className="eyebrow">{t("metricsReactions")}</p>
              <p className="display mt-4 text-4xl text-ink font-bold">{overview.metrics.reactionCount}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {t("metricsReactionsDesc")}
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-line bg-canvas-elevated p-5 shadow-sm">
              <p className="eyebrow">{t("metricsStoriesTouched")}</p>
              <p className="display mt-4 text-4xl text-ink font-bold">{overview.metrics.storiesTouched}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {t("metricsStoriesTouchedDesc")}
              </p>
            </article>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted px-1">
              {overview.items.length === 0 ? "" : t("kinds.comment") + " & " + t("kinds.reaction") + " Feed"}
            </h4>
            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-1">
              {overview.items.length > 0 ? (
                overview.items.map((item) => (
                  <Link
                    key={`${item.kind}-${item.id}`}
                    href={storyRoute(item.storyId)}
                    className="block rounded-[1.5rem] border border-line bg-canvas-elevated p-5 transition-all duration-300 hover:border-line-strong hover:bg-canvas-depth shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent-strong border border-accent/20">
                          {item.kind}
                        </span>
                        <h2 className="display mt-3 text-lg font-bold text-ink leading-snug">{item.storyTitle}</h2>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] font-bold text-accent-strong">
                          {item.actorLabel}
                        </p>
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-muted">
                        {item.timestampLabel}
                      </p>
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-ink/80 italic line-clamp-3">
                      &ldquo;{item.body}&rdquo;
                    </p>
                  </Link>
                ))
              ) : (
                <article className="rounded-[1.5rem] border border-line bg-canvas-elevated p-6 text-xs text-center leading-relaxed text-muted shadow-sm">
                  {t("emptyState")}
                </article>
              )}
            </div>
          </div>
        </div>
      </div>

      <RealtimeRefresh
        channelName="interactions-inbox-refresh"
        targets={buildInteractionRealtimeTargets()}
      />
    </SectionPlaceholder>
  );
}
