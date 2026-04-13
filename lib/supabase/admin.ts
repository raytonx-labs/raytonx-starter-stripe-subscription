import { createClient } from "@supabase/supabase-js";
import "server-only";

import { getSupabaseServerEnv } from "@/lib/supabase/env";

export function createAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseServerEnv();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
