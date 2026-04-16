# Project Docs

This documentation follows the project structure so each module can be understood close to where it lives in the codebase.

## Structure

- `docs/app/README.md`: App Router pages, route handlers, and page responsibilities.
- `docs/auth/README.md`: authentication model, session flow, guards, and roles.
- `docs/billing/README.md`: Stripe billing flow, event mapping, and state transitions.
- `docs/supabase/README.md`: Supabase clients, env variables, and request-time session refresh.
- `docs/database/`: SQL schema and database-oriented notes.
- `docs/database/stripe-subscriptions-fields.zh-CN.md`: Chinese field guide for the Supabase Stripe subscription mirror table.

## Reading order

If you are new to the project, read in this order:

1. `docs/app/README.md`
2. `docs/auth/README.md`
3. `docs/billing/README.md`
4. `docs/supabase/README.md`
5. `docs/database/supabase-auth-schema.sql`
6. `docs/database/supabase-stripe-schema.sql`
7. `docs/database/stripe-subscriptions-fields.zh-CN.md`

## Current focus

The codebase is currently centered on:

- Supabase auth and role-based access
- Stripe Checkout and Customer Portal
- mirrored Stripe subscription state in Supabase
- an admin billing dashboard for internal review
