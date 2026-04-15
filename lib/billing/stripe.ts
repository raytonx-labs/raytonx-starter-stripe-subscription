import "server-only";
import Stripe from "stripe";

import { type BillingInterval, getStripeCheckoutEnv, getStripeSecretKey } from "@/lib/billing/env";
import { createAdminClient } from "@/lib/supabase/admin";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }

  const stripeSecretKey = getStripeSecretKey();
  stripeClient = new Stripe(stripeSecretKey);

  return stripeClient;
}

export async function getOrCreateStripeCustomer(input: {
  userId: string;
  email: string;
  fullName?: string | null;
}) {
  const { userId, email, fullName } = input;
  const admin = createAdminClient();

  const { data: existingCustomer, error: lookupError } = await admin
    .from("stripe_customers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Failed to load Stripe customer: ${lookupError.message}`);
  }

  if (existingCustomer) {
    return existingCustomer.stripe_customer_id;
  }

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email,
    name: fullName ?? undefined,
    metadata: {
      user_id: userId,
    },
  });

  const { data: savedCustomer, error: saveError } = await admin
    .from("stripe_customers")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customer.id,
        email,
      },
      {
        onConflict: "user_id",
      },
    )
    .select("*")
    .single();

  if (saveError) {
    throw new Error(`Failed to save Stripe customer mapping: ${saveError.message}`);
  }

  return savedCustomer.stripe_customer_id;
}

export async function createStripeCheckoutSession(input: {
  userId: string;
  email: string;
  fullName?: string | null;
  interval: BillingInterval;
}) {
  const { userId, email, fullName, interval } = input;
  const { appUrl, stripePriceMonthly, stripePriceYearly } = getStripeCheckoutEnv();
  const stripe = getStripeClient();
  const customerId = await getOrCreateStripeCustomer({
    userId,
    email,
    fullName,
  });
  const priceId = interval === "month" ? stripePriceMonthly : stripePriceYearly;

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/app?billing=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/app?billing=cancelled`,
    client_reference_id: userId,
    subscription_data: {
      metadata: {
        user_id: userId,
        email,
      },
    },
    metadata: {
      user_id: userId,
      email,
    },
  });
}
