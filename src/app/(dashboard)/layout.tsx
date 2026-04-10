// Dashboard Layout - Server Component
// Only handles data fetching. UI shell is delegated to DashboardShell (Client Component).

import type { ReactNode } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isConfigured = hasSupabaseEnv();
  const supabase = await createServerSupabaseClient();
  
  let userEmail: string | null = null;
  let userDisplayName: string | null = null;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userEmail = user.email ?? null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      userDisplayName = profile?.display_name ?? null;
    }
  }

  return (
    <DashboardShell
      isConfigured={isConfigured}
      userEmail={userEmail}
      userDisplayName={userDisplayName}
    >
      {children}
    </DashboardShell>
  );
}
