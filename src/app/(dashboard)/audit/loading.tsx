import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { ActivitySkeleton } from "@/features/audit/components/activity-skeleton";
import { getTranslations } from "next-intl/server";

export default async function AuditLoading() {
  const t = await getTranslations("Audit");

  return (
    <SectionPlaceholder
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <ActivitySkeleton />
    </SectionPlaceholder>
  );
}
