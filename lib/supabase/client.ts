import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
