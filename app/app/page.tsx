import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";

export default async function AppPage() {
  const auth = await requireUser("/app");

  return (
    <main className="flex min-h-screen bg-background px-6 py-20 text-foreground">
      <Card className="mx-auto w-full max-w-4xl backdrop-blur">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="secondary">应用区</Badge>
            <CardTitle className="text-4xl">已登录</CardTitle>
            <CardDescription>这里是受保护的应用页面。</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <Card className="border-border bg-muted/40 shadow-none">
            <CardHeader>
              <CardDescription>当前用户</CardDescription>
              <CardTitle className="text-xl">{auth.user.email}</CardTitle>
              <CardDescription>头像和账户菜单位于右上角。</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border bg-muted/40 shadow-none">
            <CardHeader>
              <CardDescription>角色</CardDescription>
              <CardTitle className="text-xl">{auth.profile.role}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border bg-muted/40 shadow-none">
            <CardHeader>
              <CardDescription>订阅管理</CardDescription>
              <CardTitle className="text-xl">Stripe Customer Portal</CardTitle>
              <CardDescription>可在 Stripe 中取消订阅、更新付款方式和查看账单。</CardDescription>
            </CardHeader>
            <CardContent>
              <ManageBillingButton variant="secondary" className="w-full sm:w-auto">
                管理订阅
              </ManageBillingButton>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </main>
  );
}
