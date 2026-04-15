import Stripe from "stripe";

import { badRequest, internalServerError } from "@/lib/api/responses";
import { getStripeWebhookEnv } from "@/lib/billing/env";
import { getStripeClient } from "@/lib/billing/stripe";
import { handleStripeWebhookEvent } from "@/lib/billing/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { stripeWebhookSecret } = getStripeWebhookEnv();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return badRequest("Missing Stripe signature header");
  }

  const payload = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook signature";

    return badRequest(message);
  }

  try {
    const result = await handleStripeWebhookEvent(event);

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process Stripe webhook";

    return internalServerError(message);
  }
}
