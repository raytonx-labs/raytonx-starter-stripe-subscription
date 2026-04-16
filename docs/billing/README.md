# `docs/billing/`

This document maps the Stripe billing user journey to Stripe events and the Supabase state changes we expect.

## Scope

The billing system in this project follows a simple rule:

- Stripe is the source of truth for payment and subscription state.
- Supabase stores a mirrored snapshot for the app and admin dashboard.
- Webhooks keep the mirror in sync.

## Billing flow

| Step | User action | Stripe event(s) | Supabase changes | Notes |
| --- | --- | --- | --- | --- |
| 1 | User clicks monthly/yearly subscribe | None yet | None yet | The app only creates a Checkout Session at this stage. |
| 2 | Server creates Checkout Session | None yet | `stripe_customers` may be created or reused | The session should carry the current Supabase user id and selected `price_id`. |
| 3 | User completes payment in Checkout | `checkout.session.completed` | `stripe_billing_events` gets the event log; `stripe_subscriptions` is synced from Stripe | This is the first moment we expect a subscription mirror row to exist or be updated. |
| 4 | Stripe finalizes the subscription | `customer.subscription.created` | `stripe_subscriptions` gets `status`, `cancel_at_period_end`, `cancel_at`, `current_period_start`, `current_period_end`, `trial_end`, `canceled_at`, `ended_at`, `metadata` | This is the most important subscription snapshot event. |
| 5 | Invoice is paid for the subscription | `invoice.paid` | `stripe_billing_events` logs the invoice; `stripe_subscriptions` may be re-synced | Useful for renewals and post-payment confirmation. |
| 6 | Invoice payment fails | `invoice.payment_failed` | `stripe_billing_events` logs the failure; `stripe_subscriptions` may move to `past_due` or `unpaid` | This is a billing health signal, not a user profile change. |
| 7 | User opens Customer Portal and chooses cancel | `customer.subscription.updated` | `cancel_at_period_end` becomes `true`; `status` may still stay `active` | Cancellation is often scheduled first, not immediate. |
| 8 | Subscription reaches the end of the current period | `customer.subscription.deleted` or a later `updated` event with `status = canceled` | `status` becomes `canceled`; `canceled_at` / `ended_at` should be populated when Stripe provides them | This is the point where the subscription is no longer active. |
| 9 | User changes billing details in Portal | `customer.subscription.updated` and sometimes `invoice.paid` | The mirrored subscription row is refreshed | Payment method changes usually do not mean the plan changed. |

## What to verify in each event

When you inspect webhook payloads, confirm these fields first:

- `status`
- `cancel_at_period_end`
- `cancel_at`
- `current_period_start`
- `current_period_end`
- `trial_end`
- `canceled_at`
- `ended_at`
- `stripe_customer_id`
- `stripe_subscription_id`
- `stripe_price_id`
- `interval`

## Suggested interpretation rules

- `status = active` and `cancel_at_period_end = true`
  - The subscription is still valid, but it will end at `cancel_at`, usually the current period boundary.
- `status = canceled`
  - The subscription has ended.
- `status = past_due`
  - Payment is failing and the user may need to update their card.
- `status = unpaid`
  - Stripe considers the subscription unpaid.
- `status = trialing`
  - The user has access, but the billing cycle has not started charging yet.

## Database impact summary

- `stripe_customers`
  - Stores the mapping between a Supabase user and a Stripe customer.
- `stripe_subscriptions`
  - Stores the latest subscription snapshot for app and admin reads.
- `stripe_billing_events`
  - Stores raw webhook events for audit and debugging.

## Reading order

If you are implementing billing logic, read this file together with:

- `docs/database/supabase-stripe-schema.sql`
- `lib/billing/webhook.ts`
- `app/api/billing/webhook/route.ts`
