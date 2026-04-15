create extension if not exists "pgcrypto";

create table if not exists public.stripe_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  stripe_customer_id text not null unique,
  email text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.stripe_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  stripe_customer_id text not null references public.stripe_customers (stripe_customer_id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_price_id text not null,
  status text not null check (
    status in (
      'incomplete',
      'incomplete_expired',
      'trialing',
      'active',
      'past_due',
      'canceled',
      'unpaid',
      'paused'
    )
  ),
  interval text not null check (interval in ('month', 'year')),
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.stripe_billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  user_id uuid references auth.users (id) on delete set null,
  payload jsonb not null,
  processed_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now())
);

drop trigger if exists set_stripe_customers_updated_at on public.stripe_customers;
create trigger set_stripe_customers_updated_at
before update on public.stripe_customers
for each row
execute procedure public.set_current_timestamp_updated_at();

drop trigger if exists set_stripe_subscriptions_updated_at on public.stripe_subscriptions;
create trigger set_stripe_subscriptions_updated_at
before update on public.stripe_subscriptions
for each row
execute procedure public.set_current_timestamp_updated_at();

alter table public.stripe_customers enable row level security;
alter table public.stripe_subscriptions enable row level security;
alter table public.stripe_billing_events enable row level security;

drop policy if exists "Users can read their own stripe customer" on public.stripe_customers;
create policy "Users can read their own stripe customer"
on public.stripe_customers
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their own stripe subscription" on public.stripe_subscriptions;
create policy "Users can read their own stripe subscription"
on public.stripe_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their own billing events" on public.stripe_billing_events;
create policy "Users can read their own billing events"
on public.stripe_billing_events
for select
to authenticated
using (auth.uid() = user_id);

comment on table public.stripe_customers is 'Maps an application user to a Stripe customer.';
comment on table public.stripe_subscriptions is 'Mirrors the latest Stripe subscription snapshot for app reads.';
comment on table public.stripe_billing_events is 'Stores Stripe webhook events for audit and debugging.';
