import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBillingDashboard } from "@/lib/billing/admin";
import {
  formatBillingDate,
  getBillingPlanLabel,
  getBillingStatusView,
} from "@/lib/billing/subscription";

type AdminPageProps = PageProps<"/admin">;

function buildAdminHref(filters: {
  query?: string;
  status?: string;
  interval?: string;
  user?: string;
}) {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("query", filters.query);
  }

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.interval && filters.interval !== "all") {
    params.set("interval", filters.interval);
  }

  if (filters.user) {
    params.set("user", filters.user);
  }

  const query = params.toString();

  return query.length > 0 ? `/admin?${query}` : "/admin";
}

function getStatusToneClassName(tone: ReturnType<typeof getBillingStatusView>["tone"]) {
  switch (tone) {
    case "success":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    case "warning":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "destructive":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "secondary":
      return "border-border bg-secondary text-secondary-foreground";
    case "outline":
    default:
      return "border-border bg-transparent text-foreground";
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const auth = await requireAdmin("/admin");
  const params = await searchParams;
  const dashboard = await getAdminBillingDashboard(params);
  const selectedRow = dashboard.selectedRow;
  const selectedStatusView = getBillingStatusView(selectedRow?.subscription ?? null);

  return (
    <main className="flex min-h-screen bg-background px-6 py-20 text-foreground">
      <Card className="mx-auto w-full max-w-7xl backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="outline">管理后台</Badge>
              <CardTitle className="text-4xl">订阅管理后台</CardTitle>
              <CardDescription>只读查看用户订阅状态、客户映射和 Stripe 订阅镜像。</CardDescription>
            </div>
            <Card className="border-border bg-muted/40 shadow-none">
              <CardHeader className="py-4">
                <CardDescription>当前管理员</CardDescription>
                <CardTitle className="text-lg">{auth.user.email}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Card className="border-border bg-muted/40 shadow-none">
              <CardHeader className="py-4">
                <CardDescription>用户总数</CardDescription>
                <CardTitle className="text-2xl">{dashboard.summary.totalUsers}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border bg-muted/40 shadow-none">
              <CardHeader className="py-4">
                <CardDescription>有效订阅</CardDescription>
                <CardTitle className="text-2xl">{dashboard.summary.activeSubscriptions}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border bg-muted/40 shadow-none">
              <CardHeader className="py-4">
                <CardDescription>试用中</CardDescription>
                <CardTitle className="text-2xl">
                  {dashboard.summary.trialingSubscriptions}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border bg-muted/40 shadow-none">
              <CardHeader className="py-4">
                <CardDescription>支付失败</CardDescription>
                <CardTitle className="text-2xl">{dashboard.summary.pastDueSubscriptions}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-border bg-muted/40 shadow-none">
              <CardHeader className="py-4">
                <CardDescription>无订阅</CardDescription>
                <CardTitle className="text-2xl">{dashboard.summary.noSubscriptionUsers}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <form className="grid gap-3 rounded-3xl border border-border bg-muted/30 p-4 xl:grid-cols-[1.5fr_1fr_1fr_auto]">
            <Input
              name="query"
              defaultValue={dashboard.filters.query}
              placeholder="搜索邮箱、客户 ID、订阅 ID、状态"
            />
            <select
              name="status"
              defaultValue={dashboard.filters.status}
              className="h-11 rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none"
            >
              <option value="all">全部状态</option>
              <option value="none">无订阅</option>
              <option value="active">active</option>
              <option value="trialing">trialing</option>
              <option value="past_due">past_due</option>
              <option value="canceled">canceled</option>
              <option value="unpaid">unpaid</option>
              <option value="paused">paused</option>
              <option value="incomplete">incomplete</option>
              <option value="incomplete_expired">incomplete_expired</option>
            </select>
            <select
              name="interval"
              defaultValue={dashboard.filters.interval}
              className="h-11 rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none"
            >
              <option value="all">全部周期</option>
              <option value="none">无周期</option>
              <option value="month">月付</option>
              <option value="year">年付</option>
            </select>
            <Button type="submit" variant="secondary" className="w-full xl:w-auto">
              筛选
            </Button>
          </form>
        </CardHeader>

        <CardContent className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <Card className="border-border bg-muted/30 shadow-none">
            <CardHeader>
              <CardDescription>订阅用户列表</CardDescription>
              <CardTitle className="text-2xl">用户与订阅状态</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {dashboard.rows.length > 0 ? (
                dashboard.rows.map((row) => {
                  const statusView = getBillingStatusView(row.subscription);
                  const isSelected = row.userId === selectedRow?.userId;

                  return (
                    <Link
                      key={row.userId}
                      href={buildAdminHref({
                        query: dashboard.filters.query,
                        status: dashboard.filters.status,
                        interval: dashboard.filters.interval,
                        user: row.userId,
                      })}
                      className={[
                        "grid gap-3 rounded-3xl border p-4 text-left transition",
                        isSelected
                          ? "border-primary/50 bg-primary/10"
                          : "border-border bg-background/60 hover:border-primary/30 hover:bg-muted/60",
                      ].join(" ")}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-11 w-11 border border-border">
                            {row.avatarUrl ? (
                              <AvatarImage src={row.avatarUrl} alt={row.email} />
                            ) : null}
                            <AvatarFallback>
                              {row.fullName?.trim().slice(0, 1).toUpperCase() ??
                                row.email.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-foreground">{row.email}</p>
                              <Badge variant="outline">{row.role}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {row.fullName ?? "未设置名称"}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusToneClassName(statusView.tone)}>
                          {statusView.label}
                        </Badge>
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                          <p>套餐</p>
                          <p className="mt-1 text-foreground">
                            {getBillingPlanLabel(row.subscription?.interval)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                          <p>客户 ID</p>
                          <p className="mt-1 truncate text-foreground">
                            {row.customer?.stripeCustomerId ?? "暂无"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
                          <p>订阅 ID</p>
                          <p className="mt-1 truncate text-foreground">
                            {row.subscription?.stripe_subscription_id ?? "暂无"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                  没有找到符合条件的用户。
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/30 shadow-none">
            <CardHeader>
              <CardDescription>用户详情</CardDescription>
              <CardTitle className="text-2xl">
                {selectedRow ? selectedRow.email : "未选择用户"}
              </CardTitle>
              <CardDescription>
                {selectedRow ? selectedStatusView.description : "从左侧列表选择一个用户查看详情。"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRow ? (
                <>
                  <Badge className={getStatusToneClassName(selectedStatusView.tone)}>
                    {selectedStatusView.label}
                  </Badge>

                  <div className="grid gap-3 text-sm">
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      <p className="text-muted-foreground">用户信息</p>
                      <div className="mt-3 space-y-2">
                        <p className="text-foreground">{selectedRow.email}</p>
                        <p className="text-muted-foreground">
                          {selectedRow.fullName ?? "未设置名称"} · {selectedRow.role}
                        </p>
                        <p className="break-all text-muted-foreground">
                          用户 ID: {selectedRow.userId}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      <p className="text-muted-foreground">Stripe 客户</p>
                      <div className="mt-3 space-y-2">
                        <p className="break-all text-foreground">
                          {selectedRow.customer?.stripeCustomerId ?? "暂无 Stripe customer"}
                        </p>
                        <p className="text-muted-foreground">
                          订阅周期：{getBillingPlanLabel(selectedRow.subscription?.interval)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      <p className="text-muted-foreground">Stripe 订阅</p>
                      <div className="mt-3 grid gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">订阅状态</span>
                          <span className="text-foreground">
                            {selectedRow.subscription?.status ?? "none"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">价格 ID</span>
                          <span className="break-all text-foreground">
                            {selectedRow.subscription?.stripe_price_id ?? "暂无"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">当前周期结束</span>
                          <span className="text-foreground">
                            {formatBillingDate(selectedRow.subscription?.current_period_end)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">取消时间</span>
                          <span className="text-foreground">
                            {formatBillingDate(selectedRow.subscription?.canceled_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">到期后取消</span>
                          <span className="text-foreground">
                            {selectedRow.subscription?.cancel_at_period_end ? "是" : "否"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                  当前没有可展示的用户详情。
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </main>
  );
}
