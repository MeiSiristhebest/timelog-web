import {
  buildStoryPlayback,
  PLAYBACK_SIGNED_URL_TTL_SECONDS,
  type StoryPlayback,
} from "./playback";

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
  const fallback = buildStoryPlayback({
    filePath,
    signedUrl: null,
    expiresInSeconds: PLAYBACK_SIGNED_URL_TTL_SECONDS,
    nowEpochMs,
  });

  if (!fallback.sourcePath) {
    return fallback;
  }

  const { data, error } = await supabase.storage
    .from("audio-recordings")
    .createSignedUrl(fallback.sourcePath, PLAYBACK_SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return fallback;
  }

  return buildStoryPlayback({
    filePath: fallback.sourcePath,
    signedUrl: data.signedUrl,
    expiresInSeconds: PLAYBACK_SIGNED_URL_TTL_SECONDS,
    nowEpochMs,
  });
}
