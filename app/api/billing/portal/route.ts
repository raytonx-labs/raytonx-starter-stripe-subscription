import { requireApiUser } from "@/lib/api/auth";
import { badGateway, internalServerError } from "@/lib/api/responses";
import { getStripePortalEnv } from "@/lib/billing/env";
import { createStripeCustomerPortalSession } from "@/lib/billing/stripe";

export async function POST() {
  const apiAuth = await requireApiUser();

  if (!apiAuth.ok) {
    return apiAuth.response;
  }

  try {
    const { appUrl } = getStripePortalEnv();
    const portalSession = await createStripeCustomerPortalSession({
      userId: apiAuth.auth.user.id,
      email: apiAuth.auth.user.email,
      fullName: apiAuth.auth.profile.full_name,
      returnUrl: new URL("/app?billing=portal", appUrl).toString(),
    });

    if (!portalSession.url) {
      return badGateway("Stripe customer portal session did not return a URL");
    }

    return Response.json({
      portalUrl: portalSession.url,
      sessionId: portalSession.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create customer portal session";

    return internalServerError(message);
  }
}
