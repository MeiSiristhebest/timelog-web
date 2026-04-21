import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTranslations, getLocale } from "next-intl/server";
import { mockAuditEvents } from "@/lib/mock-data";

const shouldUseMock = () => {
  const isMockFlag = process.env.NEXT_PUBLIC_USE_MOCK === "true";
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return isMockFlag || !hasSupabase;
};

type TFunction = Awaited<ReturnType<typeof getTranslations>>;

type ActivityEventRow = {
  id: string;
  type: string | null;
  story_id: string | null;
  metadata: {
    actorName?: string;
    storyTitle?: string;
    reactionType?: string;
    commentText?: string;
  } | null;
  created_at: string;
  read_at: number | null;
};

type FamilyStatusRow = {
  status: string | null;
};

type DeviceRow = {
  revoked_at: string | null;
};

export type AuditEventView = {
  id: string;
  kind: string;
  actorLabel: string;
  summary: string;
  detail: string;
  timestampLabel: string;
  status: "read" | "unread";
  storyId: string | null;
};

export type AuditOverview = {
  metrics: {
    unreadSignals: number;
    pendingInvites: number;
    revokedDevices: number;
    recentEvents: number;
  };
  items: AuditEventView[];
};

async function getPreviewAuditOverview(): Promise<AuditOverview> {
  return {
    metrics: {
      unreadSignals: mockAuditEvents.filter(e => e.status === "unread").length,
      pendingInvites: 1,
      revokedDevices: 1,
      recentEvents: mockAuditEvents.length,
    },
    items: mockAuditEvents,
  };
}

async function formatDateLabel(input: string, locale: string): Promise<string> {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    const t = await getTranslations("Common");
    return t("recently") || "Recently";
  }

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toAuditSummary(row: ActivityEventRow, t: TFunction): string {
  const storyTitle = row.metadata?.storyTitle?.trim() || t("untitledStory");

  if (row.type === "comment") {
    return t("summaryComment", { title: storyTitle });
  }

  if (row.type === "reaction") {
    return t("summaryReaction", { title: storyTitle });
  }

  return t("summaryActivity", { title: storyTitle });
}

function toAuditDetail(row: ActivityEventRow, t: TFunction): string {
  if (row.type === "comment") {
    return row.metadata?.commentText?.trim() || t("previewDetail") || "No comment preview was stored.";
  }

  if (row.type === "reaction") {
    return t("detailReaction", { type: row.metadata?.reactionType?.trim() || "unknown" });
  }

  return t("detailUnknown") || "Operational signal captured in the family activity stream.";
}

async function mapAuditEvent(row: ActivityEventRow, t: TFunction, locale: string): Promise<AuditEventView> {
  const kindKey = row.type ? row.type : "activity";
  const kind = t(`kinds.${kindKey}`);
  
  return {
    id: row.id,
    kind,
    actorLabel: row.metadata?.actorName?.trim() || t("actorPlaceholder"),
    summary: toAuditSummary(row, t),
    detail: toAuditDetail(row, t),
    timestampLabel: await formatDateLabel(row.created_at, locale),
    status: row.read_at ? "read" : "unread",
    storyId: row.story_id ?? null,
  };
}

export async function getAuditOverview(): Promise<AuditOverview> {
  if (shouldUseMock()) {
    return getPreviewAuditOverview();
  }

  const supabase = await createServerSupabaseClient();
  const t = await getTranslations("Audit");
  const locale = await getLocale();

  if (!supabase) {
    return getPreviewAuditOverview();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return getPreviewAuditOverview();
  }

  const [eventsResponse, familyResponse, devicesResponse] = await Promise.all([
    supabase
      .from("activity_events")
      .select("id, type, story_id, metadata, created_at, read_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("family_members").select("status"),
    supabase.rpc("list_family_devices"),
  ]);

  if (eventsResponse.error || familyResponse.error || devicesResponse.error) {
    return getPreviewAuditOverview();
  }

  const eventRows = (eventsResponse.data ?? []) as ActivityEventRow[];
  const familyRows = (familyResponse.data ?? []) as FamilyStatusRow[];
  const deviceRows = (devicesResponse.data ?? []) as DeviceRow[];

  const items = await Promise.all(
    eventRows.map((row) => mapAuditEvent(row, t, locale))
  );

  return {
    metrics: {
      unreadSignals: eventRows.filter((row) => row.read_at == null).length,
      pendingInvites: familyRows.filter((row) => row.status !== "accepted").length,
      revokedDevices: deviceRows.filter((row) => row.revoked_at != null).length,
      recentEvents: eventRows.length,
    },
    items,
  };
}
