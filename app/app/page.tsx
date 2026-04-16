import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { SubscribeButton } from "@/components/billing/subscribe-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import {
  type BillingStatusTone,
  formatBillingDate,
  getBillingPlanLabel,
  getBillingStatusView,
  getBillingSubscription,
} from "@/lib/billing/subscription";

function getStatusBadgeClassName(tone: BillingStatusTone) {
  switch (tone) {
    case "success":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    case "warning":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "destructive":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "outline":
      return "border-border bg-transparent text-foreground";
    case "secondary":
    default:
      return "border-border bg-secondary text-secondary-foreground";
  }
}

export default async function AppPage() {
  const auth = await requireUser("/app");
  const subscription = await getBillingSubscription(auth.user.id);
  const billingStatus = getBillingStatusView(subscription);
  const hasActiveSubscription = billingStatus.isActive;
  const planLabel = subscription ? getBillingPlanLabel(subscription.interval) : "未订阅";

  return (
    <main className="flex min-h-screen bg-background px-6 py-20 text-foreground">
      <Card className="mx-auto w-full max-w-6xl backdrop-blur">
        <CardHeader className="items-start gap-3">
          <Badge className={getStatusBadgeClassName(billingStatus.tone)}>
            {billingStatus.label}
          </Badge>
          <CardTitle className="text-4xl">订阅中心</CardTitle>
          <CardDescription>{billingStatus.description}</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border bg-muted/40 shadow-none">
            <CardHeader>
              <CardDescription>当前用户</CardDescription>
              <CardTitle className="text-xl">{auth.user.email}</CardTitle>
              <CardDescription>头像和账户菜单位于右上角。</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-muted/40 shadow-none">
            <CardHeader>
              <CardDescription>订阅详情</CardDescription>
              <CardTitle className="text-xl">{planLabel}</CardTitle>
              <CardDescription>Stripe 状态：{subscription?.status ?? "none"}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-4">
                <span>当前周期结束</span>
                <span className="text-foreground">
                  {formatBillingDate(subscription?.current_period_end)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>试用结束</span>
                <span className="text-foreground">
                  {formatBillingDate(subscription?.trial_end)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>到期后取消</span>
                <span className="text-foreground">
                  {subscription?.cancel_at_period_end ? "是" : "否"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/40 shadow-none">
            <CardHeader>
              <CardDescription>{hasActiveSubscription ? "管理订阅" : "订阅入口"}</CardDescription>
              <CardTitle className="text-xl">
                {hasActiveSubscription ? "Stripe Customer Portal" : "选择月付或年付"}
              </CardTitle>
              <CardDescription>
                {hasActiveSubscription
                  ? "可在 Stripe 中取消订阅、更新付款方式和查看账单。"
                  : "订阅后可在 Stripe Customer Portal 中管理付款方式与账单。"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasActiveSubscription ? (
                <ManageBillingButton variant="secondary" className="w-full">
                  管理订阅
                </ManageBillingButton>
              ) : (
                <div className="grid gap-3">
                  <SubscribeButton
                    interval="month"
                    label="按月订阅"
                    variant="secondary"
                    className="w-full"
                  />
                  <SubscribeButton
                    interval="year"
                    label="按年订阅"
                    variant="outline"
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </main>
  );
}
