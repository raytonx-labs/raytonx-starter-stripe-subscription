import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";

export default async function AppPage() {
  const auth = await requireUser("/app");

  return (
    <main className="flex min-h-screen bg-zinc-950 px-6 py-20 text-zinc-50">
      <Card className="mx-auto w-full max-w-4xl backdrop-blur">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="secondary">应用区</Badge>
            <CardTitle className="text-4xl">已登录</CardTitle>
            <CardDescription>这里是受保护的应用页面。</CardDescription>
          </div>

          <SignOutButton label="退出登录" />
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <Card className="border-white/10 bg-black/20 shadow-none">
            <CardHeader>
              <CardDescription>当前用户</CardDescription>
              <CardTitle className="text-xl">{auth.user.email}</CardTitle>
              <CardDescription>用户 ID：{auth.user.id}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-white/10 bg-black/20 shadow-none">
            <CardHeader>
              <CardDescription>角色</CardDescription>
              <CardTitle className="text-xl">{auth.profile.role}</CardTitle>
            </CardHeader>
          </Card>
        </CardContent>
      </Card>
    </main>
  );
}
