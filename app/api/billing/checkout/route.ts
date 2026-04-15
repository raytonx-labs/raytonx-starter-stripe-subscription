import { z } from "zod";

import { requireApiUser } from "@/lib/api/auth";
import { badGateway, badRequest, internalServerError } from "@/lib/api/responses";
import { createStripeCheckoutSession } from "@/lib/billing/stripe";

const checkoutSchema = z.object({
  interval: z.enum(["month", "year"]),
});

export async function POST(request: Request) {
  const apiAuth = await requireApiUser();

  if (!apiAuth.ok) {
    return apiAuth.response;
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = checkoutSchema.safeParse(payload);

  if (!parsed.success) {
    return badRequest("Invalid billing interval");
  }

  try {
    const checkoutSession = await createStripeCheckoutSession({
      userId: apiAuth.auth.user.id,
      email: apiAuth.auth.user.email,
      interval: parsed.data.interval,
    });

    if (!checkoutSession.url) {
      return badGateway("Stripe checkout session did not return a URL");
    }

    return Response.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session";

    return internalServerError(message);
  }
}
