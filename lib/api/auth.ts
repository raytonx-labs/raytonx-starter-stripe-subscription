import "server-only";

import { forbidden, unauthorized } from "@/lib/api/responses";
import { getAuthContext } from "@/lib/auth/session";

type ApiUserAuthResult =
  | {
      ok: false;
      response: Response;
    }
  | {
      ok: true;
      auth: Awaited<ReturnType<typeof getAuthContext>>;
    };

export async function requireApiUser() {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated) {
    return {
      ok: false as const,
      response: unauthorized({
        authenticated: false,
        user: null,
        profile: null,
      }),
    };
  }

  return {
    ok: true as const,
    auth,
  };
}

export async function requireApiAdmin(): Promise<ApiUserAuthResult> {
  const apiAuth = await requireApiUser();

  if (!apiAuth.ok) {
    return apiAuth;
  }

  if (!apiAuth.auth.isAdmin) {
    return {
      ok: false as const,
      response: forbidden(),
    };
  }

  return apiAuth;
}
