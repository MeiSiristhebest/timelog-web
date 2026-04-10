import { createServerSupabaseClient } from "@/lib/supabase/server";
import SettingsClient from "./settings-client";
import { SettingsMonitoring } from "@/features/settings/components/settings-views";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function MonitoringSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="panel p-6 bg-panel border-line">
             <Skeleton className="h-4 w-24 mb-4" />
             <Skeleton className="h-10 w-16 mb-2" />
             <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
      <div className="bg-panel border border-line rounded-2xl p-8 h-[200px]">
        <Skeleton className="h-6 w-32 mb-8" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  let userDisplayName = "";
  
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();
      userDisplayName = profile?.display_name ?? "";
    }
  }

  return (
    <SettingsClient 
      userDisplayName={userDisplayName} 
      monitoringContent={
        <Suspense fallback={<MonitoringSkeleton />}>
          <SettingsMonitoring />
        </Suspense>
      }
    />
  );
}
