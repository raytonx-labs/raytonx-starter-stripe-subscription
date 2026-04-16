import "server-only";
import Stripe from "stripe";

import { getStripeClient } from "@/lib/billing/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json, TablesInsert } from "@/lib/supabase/database";

function toIsoDateTime(value?: number | null) {
  return value ? new Date(value * 1000).toISOString() : null;
}

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
) {
  if (!customer) {
    return null;
  }

  return typeof customer === "string" ? customer : customer.id;
}

function getSubscriptionId(subscription: string | Stripe.Subscription | null | undefined) {
  if (!subscription) {
    return null;
  }

  return typeof subscription === "string" ? subscription : subscription.id;
}

function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  },
) {
  const legacySubscriptionId = getSubscriptionId(invoice.subscription);

  if (legacySubscriptionId) {
    return legacySubscriptionId;
  }

  return getSubscriptionId(invoice.parent?.subscription_details?.subscription);
}

function getSubscriptionPrice(subscription: Stripe.Subscription) {
  const item = getPrimarySubscriptionItem(subscription);
  const price = item.price;

  if (!price || typeof price === "string") {
    throw new Error(`Missing expanded price on subscription ${subscription.id}`);
  }

  return price;
}

function getPrimarySubscriptionItem(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];

  if (!item) {
    throw new Error(`Missing subscription item on subscription ${subscription.id}`);
  }

  return item;
}

function getSubscriptionInterval(subscription: Stripe.Subscription) {
  const price = getSubscriptionPrice(subscription);
  const interval = price.recurring?.interval;

  if (interval !== "month" && interval !== "year") {
    throw new Error(`Unsupported subscription interval on subscription ${subscription.id}`);
  }

  return interval;
}

async function getExpandedSubscription(subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price;

  if (price && typeof price !== "string") {
    return subscription;
  }

  const stripe = getStripeClient();

  try {
    return await stripe.subscriptions.retrieve(subscription.id, {
      expand: ["items.data.price"],
    });
  } catch {
    return subscription;
  }
}

async function syncStripeCustomerFromStripeCustomerId(stripeCustomerId: string) {
  const admin = createAdminClient();
  const stripe = getStripeClient();

  const { data: existingCustomer, error: lookupError } = await admin
    .from("stripe_customers")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Failed to load Stripe customer mapping: ${lookupError.message}`);
  }

  if (existingCustomer) {
    return existingCustomer;
  }

  const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);

  if (stripeCustomer.deleted) {
    return null;
  }

  const userId = stripeCustomer.metadata?.user_id;

  if (!userId) {
    return null;
  }

  const { data: savedCustomer, error: saveError } = await admin
    .from("stripe_customers")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: stripeCustomer.id,
        email: stripeCustomer.email ?? "",
      },
      {
        onConflict: "user_id",
      },
    )
    .select("*")
    .single();

  if (saveError) {
    throw new Error(`Failed to save Stripe customer mapping from webhook: ${saveError.message}`);
  }

  return savedCustomer;
}

async function syncStripeSubscription(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const expandedSubscription = await getExpandedSubscription(subscription);
  console.log(JSON.stringify(expandedSubscription, null, 2));
  const subscriptionItem = getPrimarySubscriptionItem(expandedSubscription);
  const stripeCustomerId = getCustomerId(expandedSubscription.customer);

  if (!stripeCustomerId) {
    throw new Error(`Missing Stripe customer on subscription ${expandedSubscription.id}`);
  }

  const customer = await syncStripeCustomerFromStripeCustomerId(stripeCustomerId);

  if (!customer) {
    throw new Error(`Unable to resolve user for Stripe customer ${stripeCustomerId}`);
  }

  const price = getSubscriptionPrice(expandedSubscription);
  const interval = getSubscriptionInterval(expandedSubscription);
  const payload: TablesInsert<"stripe_subscriptions"> = {
    user_id: customer.user_id,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: expandedSubscription.id,
    stripe_price_id: price.id,
    status: expandedSubscription.status,
    interval,
    cancel_at_period_end: expandedSubscription.cancel_at_period_end,
    current_period_start: toIsoDateTime(subscriptionItem.current_period_start),
    current_period_end: toIsoDateTime(subscriptionItem.current_period_end),
    trial_end: toIsoDateTime(expandedSubscription.trial_end),
    canceled_at: toIsoDateTime(expandedSubscription.canceled_at),
    ended_at: toIsoDateTime(expandedSubscription.ended_at),
    metadata: expandedSubscription.metadata as Json,
  };

  const { data, error } = await admin
    .from("stripe_subscriptions")
    .upsert(payload, {
      onConflict: "user_id",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to sync Stripe subscription: ${error.message}`);
  }

  return data;
}

async function recordStripeBillingEvent(event: Stripe.Event, userId: string | null) {
  const admin = createAdminClient();
  const stripeEventObject =
    typeof event.data.object === "object" && event.data.object !== null
      ? (event.data.object as unknown as Record<string, unknown>)
      : null;
  const stripeCustomerId =
    stripeEventObject && "customer" in stripeEventObject
      ? getCustomerId(
          stripeEventObject.customer as
            | string
            | Stripe.Customer
            | Stripe.DeletedCustomer
            | null
            | undefined,
        )
      : null;
  const stripeSubscriptionId = getEventSubscriptionId(event);

  const payload: TablesInsert<"stripe_billing_events"> = {
    stripe_event_id: event.id,
    event_type: event.type,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    user_id: userId,
    payload: event as unknown as Json,
  };

  const { error } = await admin.from("stripe_billing_events").upsert(payload, {
    onConflict: "stripe_event_id",
  });

  if (error) {
    throw new Error(`Failed to record Stripe webhook event: ${error.message}`);
  }
}

async function syncSubscriptionById(subscriptionId: string) {
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  return syncStripeSubscription(subscription);
}

function getEventSubscriptionId(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      return getSubscriptionId(session.subscription);
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.resumed":
    case "customer.subscription.paused":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      return subscription.id;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      };

      return getInvoiceSubscriptionId(invoice);
    }
    default:
      return null;
  }
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  let userId: string | null = null;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "subscription" && session.subscription) {
        const stripeSubscriptionId = getSubscriptionId(session.subscription);

        if (!stripeSubscriptionId) {
          break;
        }

        const subscription = await syncSubscriptionById(stripeSubscriptionId);
        userId = subscription.user_id;
      }

      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.resumed":
    case "customer.subscription.paused":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const syncedSubscription = await syncSubscriptionById(subscription.id);
      userId = syncedSubscription.user_id;
      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      };
      const subscriptionId = getInvoiceSubscriptionId(invoice);

      if (subscriptionId) {
        const subscription = await syncSubscriptionById(subscriptionId);
        userId = subscription.user_id;
      }

      break;
    }
    default:
      break;
  }

  await recordStripeBillingEvent(event, userId);

  return {
    received: true as const,
  };
}
