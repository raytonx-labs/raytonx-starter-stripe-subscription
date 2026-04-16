"use client";

import type { BillingInterval } from "@/lib/billing/env";

type BillingPortalResponse = {
  portalUrl: string;
  sessionId: string;
};

type BillingCheckoutResponse = {
  checkoutUrl: string;
  sessionId: string;
};

async function parseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string } | null;
    if (payload && typeof payload.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }
  } catch {
    // Ignore JSON parse failures and fall back to a generic message.
  }

  return "Failed to open customer portal";
}

export async function openBillingPortal() {
  const response = await fetch("/api/billing/portal", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as Partial<BillingPortalResponse>;

  if (!payload.portalUrl) {
    throw new Error("Stripe customer portal did not return a URL");
  }

  return {
    portalUrl: payload.portalUrl,
    sessionId: payload.sessionId ?? "",
  };
}

export async function openBillingCheckout(interval: BillingInterval) {
  const response = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ interval }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as Partial<BillingCheckoutResponse>;

  if (!payload.checkoutUrl) {
    throw new Error("Stripe checkout did not return a URL");
  }

  return {
    checkoutUrl: payload.checkoutUrl,
    sessionId: payload.sessionId ?? "",
  };
}
