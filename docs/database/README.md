# `docs/database/`

This folder contains SQL and database notes that support the application modules.

## Files

### `supabase-auth-schema.sql`

- Creates `public.user_profiles`.
- Adds `role` support for app-level authorization.
- Enables RLS and base self-read/self-update policies.
- Adds the `updated_at` trigger.

## Usage

Run these SQL files in the Supabase SQL editor before testing protected routes that depend on app profile data.

## Notes for future work

- Subscription tables, Stripe customer mappings, and webhook event logs should be added here as separate SQL files once billing work starts.
