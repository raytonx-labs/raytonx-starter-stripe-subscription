# `app/` Module

This folder contains the App Router entrypoints, protected pages, and route handlers.

## Current routes

### Public route

- `app/page.tsx`
  - Current landing page for the starter.
  - Explains the auth foundation status.
  - Links to the protected app shell and admin shell.

### Protected app routes

- `app/app/page.tsx`
  - Protected application shell.
  - Calls `requireUser("/app")` before rendering.
  - Displays the authenticated user and role information as a starter placeholder.

- `app/admin/page.tsx`
  - Admin-only shell.
  - Calls `requireAdmin("/admin")`.
  - Exists to validate that role-based gating works before admin features are added.

### API routes

- `app/api/auth/session/route.ts`
  - Returns the current authenticated session and profile snapshot.
  - Intended as the shared session endpoint for future auth UI and client-side bootstrap needs.

- `app/api/billing/checkout/route.ts`
  - Creates Stripe Checkout sessions for monthly and yearly subscriptions.

- `app/api/billing/portal/route.ts`
  - Creates Stripe Customer Portal sessions for billing management.

- `app/api/billing/webhook/route.ts`
  - Receives Stripe webhook events and syncs subscription state back to Supabase.

- `app/auth/callback/route.ts`
  - Exchanges the Supabase OAuth code for a session.
  - Redirects the user back to the protected destination after login.

## Layout files

- `app/layout.tsx`
  - Root layout for the app.
  - Defines the shared HTML/body frame and global metadata.

- `app/globals.css`
  - Global styles and theme tokens.

## Notes for future work

- Pricing, success/cancel, and any new billing views should continue to live under `app/`.
- Route protection should stay centralized in `lib/auth/session.ts`, not duplicated across pages.
