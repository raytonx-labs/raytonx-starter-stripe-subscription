import { createClient } from "@supabase/supabase-js";
import "server-only";

import type { Database } from "@/lib/supabase/database";
import { getSupabaseServerEnv } from "@/lib/supabase/env";

export function createAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServerEnv();

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
