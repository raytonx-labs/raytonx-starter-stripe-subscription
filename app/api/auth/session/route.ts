import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/auth/session";

export async function GET() {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        profile: null,
      },
      {
        status: 401,
      },
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: auth.user,
    profile: auth.profile,
  });
}
