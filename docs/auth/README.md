# `lib/auth/` Module

This module is the application-level auth layer that sits on top of Supabase Auth.

## Responsibilities

- Load the current user on the server.
- Ensure every authenticated user has an application profile row.
- Expose normalized auth state to the rest of the app.
- Provide route guards for authenticated and admin-only pages.

## Files

### `lib/auth/config.ts`

- Central auth-related route constants.
- Defines the redirect query key used when a user is sent back to the landing page before login UI exists.

### `lib/auth/types.ts`

- Defines `AppRole`, `UserProfile`, and `AuthContext`.
- Keeps auth-facing types separate from raw Supabase SDK responses.

### `lib/auth/session.ts`

- Main server-side auth orchestration layer.
- Uses the server Supabase client to fetch the current user.
- Uses the admin Supabase client to upsert `user_profiles`.
- Exposes:
  - `getAuthContext()`
  - `requireUser()`
  - `requireAdmin()`

### `components/auth/auth-dialog.tsx`

- Client-side login/register modal.
- Supports email/password and GitHub/Google OAuth entry points.
- Redirects authenticated users to the requested app route.

### `components/auth/sign-out-button.tsx`

- Minimal client-side logout control.
- Reused in authenticated app/admin shells for quick verification.

## Role model

- Roles live in `public.user_profiles.role`.
- Current roles:
  - `user`
  - `admin`
- New authenticated users are expected to default to `user`.
- Admin access is determined by database state, not hardcoded emails or JWT custom claims.

## Redirect behavior

- Unauthenticated access to protected pages redirects to `/`.
- The original target path is preserved in the `next` query param for future login redirect support.
- Non-admin authenticated users trying to access `/admin` are redirected to `/app`.
- OAuth login returns through `/auth/callback` and then forwards to the requested route.

## Notes for future work

- Login/signup actions and OAuth initiation should reuse this module rather than introducing a second auth abstraction.
- Billing and admin features should consume `AuthContext` instead of directly reading Supabase in every page.
