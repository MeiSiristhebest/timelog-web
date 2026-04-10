import { createServerSupabaseClient } from "@/lib/supabase/server";

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

const previewDevices: DeviceView[] = [
  {
    id: "device-preview-1",
    deviceName: "Grandma iPhone",
    createdAt: "Linked April 4, 2026",
    lastSeenAt: "Seen 9 minutes ago",
    status: "active",
  },
  {
    id: "device-preview-2",
    deviceName: "Family iPad",
    createdAt: "Linked April 1, 2026",
    lastSeenAt: "Seen yesterday",
    status: "active",
  },
  {
    id: "device-preview-3",
    deviceName: "Old Android Tablet",
    createdAt: "Linked March 18, 2026",
    lastSeenAt: "Revoked April 6, 2026",
    status: "revoked",
  },
];

function formatAbsolute(input: string | null, prefix: string): string {
  if (!input) return `${prefix} unavailable`;

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return `${prefix} unavailable`;

  return `${prefix} ${new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)}`;
}

export async function getDevices(): Promise<DeviceView[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return previewDevices;
  }

  const { data, error } = await supabase.rpc("list_family_devices");
  if (error || !data) {
    return previewDevices;
  }

  return (data as DeviceRow[]).map((row) => ({
    id: row.id,
    deviceName: row.device_name?.trim() || "Unnamed device",
    createdAt: formatAbsolute(row.created_at, "Linked"),
    lastSeenAt: row.revoked_at
      ? formatAbsolute(row.revoked_at, "Revoked")
      : formatAbsolute(row.last_seen_at, "Seen"),
    status: row.revoked_at ? "revoked" : "active",
  }));
}
