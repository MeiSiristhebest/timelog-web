import {
  buildStoryPlayback,
  PLAYBACK_SIGNED_URL_TTL_SECONDS,
  type StoryPlayback,
} from "./playback";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

type SupabaseStorageClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (
        path: string,
        expiresInSeconds: number
      ) => Promise<{
        data: { signedUrl?: string | null } | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export async function createSignedStoryPlayback(
  supabase: SupabaseStorageClient,
  filePath: string | null,
  nowEpochMs?: number
): Promise<StoryPlayback> {
  const isRemote = filePath && !filePath.startsWith("file://") && filePath !== "OFFLOADED" && filePath.includes("/");

  const fallback: StoryPlayback = {
    sourcePath: isRemote ? filePath : null,
    signedUrl: null,
    expiresLabel: null,
    expiresAtEpochMs: null,
    isReady: false,
  };

  if (!isRemote || !filePath) {
    return fallback;
  }

  // Use admin client to bypass RLS for family member viewing storyteller recordings
  const adminClient = getAdminSupabaseClient();
  const storageClient = adminClient || supabase;

  const { data, error } = await storageClient.storage
    .from("audio-recordings")
    .createSignedUrl(filePath, PLAYBACK_SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    console.warn(
      `[createSignedStoryPlayback] Failed to create signed URL for path="${filePath}"`,
      error?.message ?? "no signedUrl returned"
    );
    return fallback;
  }

  return buildStoryPlayback({
    filePath: filePath,
    signedUrl: data.signedUrl,
    expiresInSeconds: PLAYBACK_SIGNED_URL_TTL_SECONDS,
    nowEpochMs,
  });
}

