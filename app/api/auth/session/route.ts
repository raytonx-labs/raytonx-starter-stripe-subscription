import { unauthorized } from "@/lib/api/responses";
import { getAuthContext } from "@/lib/auth/session";

export async function GET() {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated) {
    return unauthorized({
      authenticated: false,
      user: null,
      profile: null,
    });
  }

  return Response.json({
    authenticated: true,
    user: auth.user,
    profile: auth.profile,
  });
}
