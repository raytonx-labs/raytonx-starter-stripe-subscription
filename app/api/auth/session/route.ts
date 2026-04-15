import { requireApiUser } from "@/lib/api/auth";

export async function GET() {
  const auth = await requireApiUser();

  if (!auth.ok) {
    return auth.response;
  }

  return Response.json({
    authenticated: true,
    user: auth.auth.user,
    profile: auth.auth.profile,
  });
}
