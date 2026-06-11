import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface DbRow {
  id: string;
  file_path: string | null;
  sync_status: string | null;
  transcription: string | null;
  duration_ms: number | null;
}

interface StorageFile {
  name: string;
  metadata?: {
    size?: number;
  } | null;
}

/**
 * Diagnostic endpoint: lists actual files in Supabase Storage
 * and compares with audio_recordings.file_path in the database.
 *
 * GET /api/debug/storage
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase client" }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. List files in user's Storage folder
  const { data: storageFiles, error: storageError } = await supabase.storage
    .from("audio-recordings")
    .list(user.id, { limit: 50 });

  // 2. Fetch DB rows for this user
  const { data: dbRows, error: dbError } = await supabase
    .from("audio_recordings")
    .select("id, file_path, sync_status, transcription, duration_ms")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("started_at", { ascending: false })
    .limit(25);

  const typedDbRows = (dbRows ?? []) as unknown as DbRow[];

  // 3. Try a signed URL for the first row that has a file_path
  const firstWithPath = typedDbRows.find((r) => r.file_path);
  let signedUrlTest: { path: string; result: string } | null = null;
  if (firstWithPath?.file_path) {
    const { data: urlData, error: urlError } = await supabase.storage
      .from("audio-recordings")
      .createSignedUrl(firstWithPath.file_path, 60);
    signedUrlTest = {
      path: firstWithPath.file_path,
      result: urlError ? `ERROR: ${urlError.message}` : `OK: ${urlData?.signedUrl?.slice(0, 80)}...`,
    };
  }

  return NextResponse.json({
    userId: user.id,
    storageFiles: storageError
      ? `ERROR: ${storageError.message}`
      : (storageFiles as unknown as StorageFile[] ?? []).map((f) => ({
          name: f.name,
          size: f.metadata?.size,
          fullPath: `${user.id}/${f.name}`,
        })),
    dbRows: dbError
      ? `ERROR: ${dbError.message}`
      : typedDbRows.map((r) => ({
          id: r.id,
          file_path: r.file_path,
          sync_status: r.sync_status,
          has_transcription: !!r.transcription,
          duration_ms: r.duration_ms,
        })),
    signedUrlTest,
  });
}
