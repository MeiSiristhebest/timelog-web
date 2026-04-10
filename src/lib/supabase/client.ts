import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, hasSupabaseEnv } from "./env";

export function createClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const { supabaseUrl, supabaseKey } = getSupabaseEnv();
  return createBrowserClient(supabaseUrl, supabaseKey);
}
