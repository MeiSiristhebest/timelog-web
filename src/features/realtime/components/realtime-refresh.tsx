"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeTarget } from "../subscriptions";

export function RealtimeRefresh({
  channelName,
  targets,
}: {
  channelName: string;
  targets: RealtimeTarget[];
}) {
  const router = useRouter();
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase || targets.length === 0) {
      return;
    }

    const channel = targets.reduce((currentChannel, target) => {
      return currentChannel.on(
        "postgres_changes",
        {
          event: target.event,
          schema: target.schema,
          table: target.table,
          filter: target.filter,
        },
        () => {
          if (refreshTimerRef.current !== null) {
            window.clearTimeout(refreshTimerRef.current);
          }

          refreshTimerRef.current = window.setTimeout(() => {
            router.refresh();
          }, 250);
        }
      );
    }, supabase.channel(channelName));

    channel.subscribe();

    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [channelName, router, targets]);

  return null;
}
