import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/supabase/database";

export type BillingSubscription = Tables<"stripe_subscriptions">;

export type BillingStatusTone = "success" | "warning" | "destructive" | "secondary" | "outline";

export type BillingStatusView = {
  label: string;
  tone: BillingStatusTone;
  description: string;
  isActive: boolean;
};

const BILLING_STATUS_VIEWS: Record<string, BillingStatusView> = {
  active: {
    label: "已订阅",
    tone: "success",
    description: "当前订阅正常生效中。",
    isActive: true,
  },
  trialing: {
    label: "试用中",
    tone: "secondary",
    description: "当前订阅处于试用期。",
    isActive: true,
  },
  past_due: {
    label: "支付失败",
    tone: "warning",
    description: "订阅仍保留，但付款需要处理。",
    isActive: false,
  },
  paused: {
    label: "已暂停",
    tone: "outline",
    description: "订阅已暂停，需要重新激活。",
    isActive: false,
  },
  canceled: {
    label: "已取消",
    tone: "destructive",
    description: "订阅已取消，当前不再计费。",
    isActive: false,
  },
  unpaid: {
    label: "未付款",
    tone: "warning",
    description: "当前订阅存在未完成付款。",
    isActive: false,
  },
  incomplete: {
    label: "待完成支付",
    tone: "warning",
    description: "订阅还没有完成首次支付。",
    isActive: false,
  },
  incomplete_expired: {
    label: "支付已过期",
    tone: "destructive",
    description: "订阅会话已过期，需要重新订阅。",
    isActive: false,
  },
};

export async function getBillingSubscription(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("stripe_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load billing subscription: ${error.message}`);
  }

  return data;
}

export function getBillingStatusView(subscription: BillingSubscription | null): BillingStatusView {
  if (!subscription) {
    return {
      label: "未订阅",
      tone: "outline",
      description: "当前账号还没有有效订阅。",
      isActive: false,
    };
  }

  return (
    BILLING_STATUS_VIEWS[subscription.status] ?? {
      label: "状态未知",
      tone: "outline",
      description: "当前订阅状态无法识别。",
      isActive: false,
    }
  );
}

export function getBillingPlanLabel(interval?: string | null) {
  if (interval === "month") {
    return "月付";
  }

  if (interval === "year") {
    return "年付";
  }

  return "未指定";
}

export function formatBillingDate(value?: string | null) {
  if (!value) {
    return "暂无";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
