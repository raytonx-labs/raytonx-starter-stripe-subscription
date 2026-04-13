# `lib/supabase/` Module

This module contains the Supabase client setup used by the browser, server components, route handlers, and privileged server-only operations.

## Files

### `lib/supabase/env.ts`

- Centralizes Supabase environment variable access.
- Exposes:
  - browser-safe env lookup
  - server-only env lookup for privileged operations
- Current required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL`

### `lib/supabase/client.ts`

- Browser client factory.
- Intended for future client-side auth UI and post-login interactions.

### `lib/supabase/server.ts`

- Server client factory using `cookies()` from `next/headers`.
- Used in server components and route handlers that need the current user session.

### `lib/supabase/admin.ts`

- Server-only privileged client using the service role key.
- Used for operations that should bypass end-user RLS, such as ensuring app profile rows exist.
- Must never be imported into client components.

### `lib/supabase/proxy.ts`

- Handles request-time session refresh using `@supabase/ssr`.
- Runs before rendering through the root-level `proxy.ts`.
- Keeps cookie-based sessions synchronized for server rendering.

## Root proxy

- `proxy.ts`
  - Connects Next.js Proxy to `lib/supabase/proxy.ts`.
  - Runs for application requests except static asset paths.

## Notes for future work

- Stripe integration should not use the browser or standard server client for privileged writes; keep privileged writes in server-only modules.
- If more domain-specific Supabase helpers are added later, group them by feature under `lib/`.
