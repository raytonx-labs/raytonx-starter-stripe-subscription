# `docs/database/`

This folder contains SQL and database notes that support the application modules.

## Files

### `supabase-auth-schema.sql`

- Creates `public.user_profiles`.
- Adds `role` support for app-level authorization.
- Enables RLS and base self-read/self-update policies.
- Adds the `updated_at` trigger.

### `supabase-stripe-schema.sql`

- Creates `public.stripe_customers`.
- Creates `public.stripe_subscriptions`.
- Creates `public.stripe_billing_events`.
- Adds RLS and self-read policies for user-owned billing records.
- Adds update timestamp triggers for the mapped Stripe tables.

### `stripe-subscriptions-fields.zh-CN.md`

- Documents the `public.stripe_subscriptions` mirror table fields in Chinese.
- Clarifies cancellation fields such as `cancel_at`, `canceled_at`, `ended_at`, and `cancel_at_period_end`.

### `lib/supabase/database.ts`

- Generate the Supabase types with `npx supabase gen types typescript --project-id your-project-id > lib/supabase/database.ts`.
- Regenerate this file whenever the schema changes.

## Usage

Run `supabase-auth-schema.sql` first, then `supabase-stripe-schema.sql` in the Supabase SQL editor before testing protected routes or billing flows.

## Notes for future work

- After running the Stripe schema, regenerate Supabase types with `pnpx supabase gen types typescript` so the billing tables are available in `lib/supabase/database.ts`.
- Keep subscription mirror tables read-only from the app side; service-role writes should stay in server-only billing helpers and webhook handlers.
- The step-by-step billing flow and Stripe event mapping live in `docs/billing/README.md`.
