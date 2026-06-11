import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";

export type DeviceView = {
  id: string;
  deviceName: string;
  createdAt: string;
  lastSeenAt: string;
  status: "active" | "revoked";
};

type DeviceRow = {
  id: string;
  device_name: string | null;
  created_at: string;
  last_seen_at: string | null;
  revoked_at: string | null;
};

function formatAbsolute(input: string | null, prefix: string, locale: string, fallbackSuffix: string): string {
  if (!input) return `${prefix} ${fallbackSuffix}`;

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return `${prefix} ${fallbackSuffix}`;

  return `${prefix} ${new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)}`;
}

export async function getDevices(): Promise<DeviceView[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return [];
  }
  const t = await getTranslations("Devices");
  const locale = await getLocale();

  const { data, error } = await supabase.rpc("list_family_devices");
  if (error || !data || data.length === 0) {
    return [];
  }

  const fallbackSuffix = t("unavailable");

  return (data as DeviceRow[]).map((row) => ({
    id: row.id,
    deviceName: row.device_name?.trim() || t("unnamedDevice"),
    createdAt: formatAbsolute(row.created_at, t("linked"), locale, fallbackSuffix),
    lastSeenAt: row.revoked_at
      ? formatAbsolute(row.revoked_at, t("revoked"), locale, fallbackSuffix)
      : formatAbsolute(row.last_seen_at, t("seen"), locale, fallbackSuffix),
    status: row.revoked_at ? "revoked" : "active",
  }));
}
