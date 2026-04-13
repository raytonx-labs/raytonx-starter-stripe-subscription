import { redirect } from "next/navigation";
import "server-only";

import { APP_ROUTES, AUTH_REDIRECT_QUERY_KEY } from "@/lib/auth/config";
import type { AuthContext, UserProfile } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function buildRedirectTarget(pathname: string) {
  const searchParams = new URLSearchParams({
    [AUTH_REDIRECT_QUERY_KEY]: pathname,
  });

  return `${APP_ROUTES.home}?${searchParams.toString()}`;
}

async function upsertUserProfile(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  const { data, error } = await admin
    .from("user_profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: fullName,
        avatar_url: avatarUrl,
      },
      {
        onConflict: "id",
      },
    )
    .select("*")
    .single<UserProfile>();

  if (error) {
    throw new Error(`Failed to upsert user profile: ${error.message}`);
  }

  return data;
}

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      user: null,
      profile: null,
      isAuthenticated: false,
      isAdmin: false,
    };
  }

  const profile = await upsertUserProfile(user);

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    isAuthenticated: true,
    isAdmin: profile.role === "admin",
  };
}

export async function requireUser(pathname: string = APP_ROUTES.app) {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated) {
    redirect(buildRedirectTarget(pathname));
  }

  return auth;
}

export async function requireAdmin(pathname: string = APP_ROUTES.admin) {
  const auth = await requireUser(pathname);

  if (!auth.isAdmin) {
    redirect(APP_ROUTES.app);
  }

  return auth;
}
