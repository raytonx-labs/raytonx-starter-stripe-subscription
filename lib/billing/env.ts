import { getSupabaseServerEnv } from "@/lib/supabase/env";

export const BILLING_INTERVALS = ["month", "year"] as const;

export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export function getStripeSecretKey() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing Stripe environment variable. Set STRIPE_SECRET_KEY in .env.local.");
  }

  return stripeSecretKey;
}

export function getStripeCheckoutEnv() {
  const stripeSecretKey = getStripeSecretKey();
  const stripePriceMonthly = process.env.STRIPE_PRICE_MONTHLY;
  const stripePriceYearly = process.env.STRIPE_PRICE_YEARLY;

  if (!stripeSecretKey || !stripePriceMonthly || !stripePriceYearly) {
    throw new Error(
      "Missing Stripe environment variables. Set STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, and STRIPE_PRICE_YEARLY in .env.local.",
    );
  }

  const { appUrl } = getSupabaseServerEnv();

  return {
    appUrl,
    stripeSecretKey,
    stripePriceMonthly,
    stripePriceYearly,
  };
}

export function getStripePortalEnv() {
  const { appUrl } = getSupabaseServerEnv();

  return {
    appUrl,
  };
}

export function getStripeWebhookEnv() {
  const stripeSecretKey = getStripeSecretKey();
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !stripeWebhookSecret) {
    throw new Error(
      "Missing Stripe webhook environment variables. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env.local.",
    );
  }

  return {
    stripeSecretKey,
    stripeWebhookSecret,
  };
}

export function getStripePriceId(interval: BillingInterval, prices = getStripeCheckoutEnv()) {
  const { stripePriceMonthly, stripePriceYearly } = prices;

  return interval === "month" ? stripePriceMonthly : stripePriceYearly;
}
