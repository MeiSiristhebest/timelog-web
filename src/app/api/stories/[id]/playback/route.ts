import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSignedStoryPlayback } from "@/features/stories/playback.server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const [userRes, storyRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("audio_recordings")
      .select("id, file_path")
      .eq("id", id)
      .single(),
  ]);

  const user = userRes.data.user;
  const { data, error } = storyRes;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (error || !data) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const playback = await createSignedStoryPlayback(
    supabase,
    (data as { file_path: string | null }).file_path ?? null
  );

  if (!playback.isReady || !playback.signedUrl) {
    return NextResponse.json(
      { error: "Playback is unavailable for this story." },
      { status: 409 }
    );
  }

  return NextResponse.json({
    signedUrl: playback.signedUrl,
    expiresAtEpochMs: playback.expiresAtEpochMs,
    expiresLabel: playback.expiresLabel,
  });
}
