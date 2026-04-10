import Link from "next/link";
import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { RealtimeRefresh } from "@/features/realtime/components/realtime-refresh";
import { getInteractionsOverview } from "@/features/interactions/queries";
import { getLinkedSeniors } from "@/features/family/queries";
import { QuestionForm } from "@/features/interactions/components/question-form";
import { buildInteractionRealtimeTargets } from "@/features/realtime/subscriptions";
import { storyRoute } from "@/lib/routes";
import { getTranslations } from "next-intl/server";

export default async function InteractionsPage() {
  const t = await getTranslations("Interactions");
  const [overview, seniors] = await Promise.all([
    getInteractionsOverview(),
    getLinkedSeniors(),
  ]);

  return (
    <SectionPlaceholder
      eyebrow={t("eyebrow")}
      title={t("pageTitle")}
      description={t("pageDescription")}
    >
      <div className="mb-10 lg:w-2/3">
        <QuestionForm seniors={seniors} />
      </div>

      <RealtimeRefresh
        channelName="interactions-inbox-refresh"
        targets={buildInteractionRealtimeTargets()}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-line bg-canvas-elevated p-5">
          <p className="eyebrow">{t("metricsComments")}</p>
          <p className="display mt-4 text-4xl text-ink">{overview.metrics.commentCount}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("metricsCommentsDesc")}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-line bg-canvas-elevated p-5">
          <p className="eyebrow">{t("metricsReactions")}</p>
          <p className="display mt-4 text-4xl text-ink">{overview.metrics.reactionCount}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("metricsReactionsDesc")}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-line bg-canvas-elevated p-5">
          <p className="eyebrow">{t("metricsStoriesTouched")}</p>
          <p className="display mt-4 text-4xl text-ink">{overview.metrics.storiesTouched}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("metricsStoriesTouchedDesc")}
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-4">
        {overview.items.length > 0 ? (
          overview.items.map((item) => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={storyRoute(item.storyId)}
              className="rounded-[1.5rem] border border-line bg-canvas-elevated p-5 transition hover:border-line-strong hover:bg-canvas-depth"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{item.kind}</p>
                  <h2 className="display mt-3 text-2xl text-ink">{item.storyTitle}</h2>
                  <p className="mt-3 text-sm uppercase tracking-[0.18em] text-accent-strong">
                    {item.actorLabel}
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  {item.timestampLabel}
                </p>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-ink">
                {item.body}
              </p>
            </Link>
          ))
        ) : (
          <article className="rounded-[1.5rem] border border-line bg-canvas-elevated p-5 text-sm leading-7 text-muted">
            {t("emptyState")}
          </article>
        )}
      </div>
    </SectionPlaceholder>
  );
}
