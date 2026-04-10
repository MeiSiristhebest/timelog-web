import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export type FamilyMemberView = {
  id: string;
  label: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
};

type FamilyMemberRow = {
  id: string;
  email: string | null;
  role: string | null;
  status: string | null;
  accepted_at: string | null;
  invited_at: string | null;
  user_id: string | null;
};

const previewMembers: FamilyMemberView[] = [
  {
    id: "family-preview-admin",
    label: "Archive Owner",
    email: "owner@preview.timelog",
    role: "admin",
    status: "accepted",
    joinedAt: "Accepted April 7, 2026",
  },
  {
    id: "family-preview-member",
    label: "Daughter Account",
    email: "daughter@preview.timelog",
    role: "member",
    status: "accepted",
    joinedAt: "Accepted April 5, 2026",
  },
  {
    id: "family-preview-pending",
    label: "Pending Invite",
    email: "cousin@preview.timelog",
    role: "member",
    status: "pending",
    joinedAt: "Invited April 7, 2026",
  },
];

async function formatMembershipDate(input: string | null, status: string | null): Promise<string> {
  const t = await getTranslations("Family");
  const fallback = status === "accepted" ? t("acceptedRecently") : t("invitePending");
  if (!input) return fallback;

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return fallback;

  const label = status === "accepted" ? t("accepted") : t("invited");
  return `${label} ${new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)}`;
}

async function deriveMemberLabel(row: FamilyMemberRow): Promise<string> {
  const t_common = await getTranslations("Common");
  const t_family = await getTranslations("Family");
  
  if (row.role === "admin") return t_common("owner");
  if (row.email) return row.email.split("@")[0].replace(/[._-]/g, " ");
  if (row.user_id) return `${t_common("speaker")} ${row.user_id.slice(0, 8)}`;
  return t_family("pendingMember");
}

export async function getFamilyMembers(): Promise<FamilyMemberView[]> {
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations("Family");
  const t_common = await getTranslations("Common");

  if (!supabase) {
    return [
      {
        id: "family-preview-admin",
        label: t_common("owner"),
        email: "owner@preview.timelog",
        role: "admin",
        status: "accepted",
        joinedAt: t("previewDesc"),
      },
      {
        id: "family-preview-member",
        label: t("previewMember"),
        email: "daughter@preview.timelog",
        role: "member",
        status: "accepted",
        joinedAt: t("previewDesc"),
      },
      {
        id: "family-preview-pending",
        label: t("previewPending"),
        email: "cousin@preview.timelog",
        role: "member",
        status: "pending",
        joinedAt: t("previewDesc"),
      },
    ];
  }

  const { data, error } = await supabase
    .from("family_members")
    .select("id, email, role, status, accepted_at, invited_at, user_id")
    .order("invited_at", { ascending: false });

  if (error || !data) {
    return [
      {
        id: "family-error-fallback",
        label: "Database Error",
        email: "service@timelog",
        role: "system",
        status: "error",
        joinedAt: "--",
      },
    ];
  }

  return Promise.all(
    (data as FamilyMemberRow[]).map(async (row) => ({
      id: row.id,
      label: await deriveMemberLabel(row),
      email: row.email ?? t("noEmail"),
      role: row.role ?? "member",
      status: row.status ?? "unknown",
      joinedAt: await formatMembershipDate(
        row.accepted_at ?? row.invited_at,
        row.status
      ),
    }))
  );
}

export type SeniorView = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

export async function getLinkedSeniors(): Promise<SeniorView[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  // Fetch connections first to identify which seniors are linked
  const { data: connections, error: connError } = await supabase
    .from("family_connections")
    .select("senior_id");

  if (connError || !connections) {
    console.error("Error fetching family connections:", connError);
    return [];
  }

  const seniorIds = connections.map((c) => c.senior_id);
  if (seniorIds.length === 0) {
    return [];
  }

  // Fetch profiles for the linked seniors
  const { data: profiles, error: profError } = await supabase
    .from("profiles")
    .select("id, display_name, full_name, avatar_url")
    .in("id", seniorIds);

  if (profError || !profiles) {
    console.error("Error fetching senior profiles:", profError);
    return [];
  }

  const t = await getTranslations("Family");
  return profiles.map((p) => ({
    id: p.id,
    displayName: p.display_name || p.full_name || t("unknownSenior"),
    avatarUrl: p.avatar_url,
  }));
}

export async function getMemberCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("family_members")
    .select("*", { count: "estimated", head: true });

  return count || 0;
}
