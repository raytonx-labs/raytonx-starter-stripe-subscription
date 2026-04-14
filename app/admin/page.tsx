import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminPage() {
  const auth = await requireAdmin("/admin");

  return (
    <main className="flex min-h-screen bg-neutral-100 px-6 py-20 text-zinc-950">
      <Card className="mx-auto w-full max-w-4xl border-black/10 bg-white shadow-xl shadow-black/5">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="outline" className="border-black/15 text-zinc-700">
              管理后台
            </Badge>
            <CardTitle className="text-4xl">已登录管理员</CardTitle>
            <CardDescription className="text-zinc-600">这里是管理员页面。</CardDescription>
          </div>

          <SignOutButton label="退出登录" variant="secondary" />
        </CardHeader>

        <CardContent>
          <Card className="border-black/10 bg-zinc-50 shadow-none">
            <CardHeader>
              <CardDescription className="text-zinc-500">当前管理员</CardDescription>
              <CardTitle className="text-xl">{auth.user.email}</CardTitle>
            </CardHeader>
          </Card>
        </CardContent>
      </Card>
    </main>
  );
}
