import "server-only";

import {
  type BillingSubscription,
  getBillingPlanLabel,
  getBillingStatusView,
} from "@/lib/billing/subscription";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminBillingFilter = {
  query: string;
  status: string;
  interval: string;
  userId: string;
};

export type AdminBillingRow = {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  customer: {
    stripeCustomerId: string | null;
  } | null;
  subscription: BillingSubscription | null;
  searchText: string;
};

export type AdminBillingSummary = {
  totalUsers: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  noSubscriptionUsers: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
};

export type AdminBillingDashboard = {
  filters: AdminBillingFilter;
  rows: AdminBillingRow[];
  selectedRow: AdminBillingRow | null;
  summary: AdminBillingSummary;
};

function normalizeQueryParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function buildSearchText(parts: Array<string | null | undefined>) {
  return parts
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .map((part) => part.toLowerCase())
    .join(" ");
}

function matchesFilter(row: AdminBillingRow, filters: AdminBillingFilter) {
  const query = filters.query.trim().toLowerCase();
  const matchesQuery = query.length === 0 || row.searchText.includes(query);
  const matchesStatus =
    filters.status === "all" ||
    (filters.status === "none"
      ? row.subscription === null
      : row.subscription?.status === filters.status);
  const matchesInterval =
    filters.interval === "all" ||
    (filters.interval === "none"
      ? row.subscription === null
      : row.subscription?.interval === filters.interval);

  return matchesQuery && matchesStatus && matchesInterval;
}

export async function getAdminBillingDashboard(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const filters: AdminBillingFilter = {
    query: normalizeQueryParam(searchParams.query),
    status: normalizeQueryParam(searchParams.status) || "all",
    interval: normalizeQueryParam(searchParams.interval) || "all",
    userId: normalizeQueryParam(searchParams.user) || "",
  };

  const admin = createAdminClient();
  const [
    { data: profiles, error: profilesError },
    { data: customers, error: customersError },
    { data: subscriptions, error: subscriptionsError },
  ] = await Promise.all([
    admin.from("user_profiles").select("*").order("created_at", { ascending: false }),
    admin.from("stripe_customers").select("*"),
    admin.from("stripe_subscriptions").select("*"),
  ]);

  if (profilesError) {
    throw new Error(`Failed to load user profiles: ${profilesError.message}`);
  }

  if (customersError) {
    throw new Error(`Failed to load Stripe customers: ${customersError.message}`);
  }

  if (subscriptionsError) {
    throw new Error(`Failed to load Stripe subscriptions: ${subscriptionsError.message}`);
  }

  const customerByUserId = new Map(
    customers?.map((customer) => [customer.user_id, customer]) ?? [],
  );
  const subscriptionByUserId = new Map(
    subscriptions?.map((subscription) => [subscription.user_id, subscription]) ?? [],
  );

  const rows: AdminBillingRow[] =
    profiles?.map((profile) => {
      const customer = customerByUserId.get(profile.id) ?? null;
      const subscription = subscriptionByUserId.get(profile.id) ?? null;

      return {
        userId: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        role: profile.role,
        customer: customer ? { stripeCustomerId: customer.stripe_customer_id } : null,
        subscription,
        searchText: buildSearchText([
          profile.email,
          profile.full_name,
          profile.role,
          customer?.stripe_customer_id,
          subscription?.stripe_subscription_id,
          subscription?.stripe_price_id,
          subscription?.status,
          subscription?.interval,
        ]),
      };
    }) ?? [];

  const filteredRows = rows.filter((row) => matchesFilter(row, filters));
  const selectedRow =
    filteredRows.find((row) => row.userId === filters.userId) ?? filteredRows[0] ?? rows[0] ?? null;

  const summary: AdminBillingSummary = {
    totalUsers: rows.length,
    activeSubscriptions: rows.filter((row) => getBillingStatusView(row.subscription).isActive)
      .length,
    inactiveSubscriptions: rows.filter(
      (row) => row.subscription !== null && !getBillingStatusView(row.subscription).isActive,
    ).length,
    noSubscriptionUsers: rows.filter((row) => row.subscription === null).length,
    trialingSubscriptions: rows.filter((row) => row.subscription?.status === "trialing").length,
    pastDueSubscriptions: rows.filter((row) => row.subscription?.status === "past_due").length,
  };

  return {
    filters,
    rows: filteredRows,
    selectedRow,
    summary,
  } satisfies AdminBillingDashboard;
}

export function getAdminBillingStatusLabel(subscription: BillingSubscription | null) {
  const statusView = getBillingStatusView(subscription);

  return statusView.label;
}

export function getAdminBillingPlanLabel(subscription: BillingSubscription | null) {
  if (!subscription) {
    return "未订阅";
  }

  return getBillingPlanLabel(subscription.interval);
}
