import { type NextRequest, NextResponse } from "next/server";

import { APP_ROUTES, getSafeInternalPath } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeInternalPath(requestUrl.searchParams.get("next"), APP_ROUTES.app);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, request.url));
    }
  }

  return NextResponse.redirect(new URL(APP_ROUTES.home, request.url));
}
