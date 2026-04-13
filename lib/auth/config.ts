export const AUTH_REDIRECT_QUERY_KEY = "next";

export const APP_ROUTES = {
  home: "/",
  app: "/app",
  admin: "/admin",
  apiSession: "/api/auth/session",
  authRedirect(nextPath?: string) {
    if (!nextPath) {
      return this.home;
    }

    const searchParams = new URLSearchParams({
      [AUTH_REDIRECT_QUERY_KEY]: nextPath,
    });

    return `${this.home}?${searchParams.toString()}`;
  },
  adminUserDetail(userId: string) {
    return `${this.admin}/users/${userId}`;
  },
} as const;
