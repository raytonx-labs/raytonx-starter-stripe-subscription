export const AUTH_REDIRECT_QUERY_KEY = "next";

export function getSafeInternalPath(pathname: string | null | undefined, fallback: string) {
  if (!pathname) {
    return fallback;
  }

  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    return fallback;
  }

  return pathname;
}

export const APP_ROUTES = {
  home: "/",
  app: "/app",
  admin: "/admin",
  authCallback: "/auth/callback",
  apiSession: "/api/auth/session",
  authRedirect(nextPath?: string) {
    const safeNextPath = getSafeInternalPath(nextPath, this.home);
    const searchParams = new URLSearchParams({
      [AUTH_REDIRECT_QUERY_KEY]: safeNextPath,
    });

    return `${this.home}?${searchParams.toString()}`;
  },
  adminUserDetail(userId: string) {
    return `${this.admin}/users/${userId}`;
  },
} as const;
