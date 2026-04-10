import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { getArchivedStories } from "@/features/stories/queries";
import { TrashList } from "@/features/stories/components/trash-list";
import { RealtimeRefresh } from "@/features/realtime/components/realtime-refresh";
import { buildStoriesRealtimeTargets } from "@/features/realtime/subscriptions";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Archive Drawer | Family Heritage Archive",
  description: "Manage temporarily archived stories before they vanish.",
};

export default async function TrashPage() {
  const t = await getTranslations("Archive");
  const archivedStories = await getArchivedStories();

  return (
    <SectionPlaceholder
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <RealtimeRefresh
        channelName="archive-trash-refresh"
        targets={buildStoriesRealtimeTargets()}
      />

      <div className="mt-8 max-w-4xl">
        <TrashList initialStories={archivedStories} />
      </div>

      <div className="mt-12 p-8 rounded-[2rem] bg-canvas-depth border border-line/60">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-3">{t("securityNote")}</h4>
        <p className="text-sm text-muted leading-relaxed italic font-medium">
          {t("securityDesc")}
        </p>
      </div>
    </SectionPlaceholder>
  );
}
