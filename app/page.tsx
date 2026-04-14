import Link from "next/link";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/auth/config";
import { getAuthContext } from "@/lib/auth/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function Home() {
  const isReady = hasSupabaseEnv();
  const auth = await getAuthContext();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-muted px-6 py-20 text-foreground">
      <Card className="w-full max-w-xl backdrop-blur">
        <CardHeader className="items-center text-center">
          <Badge variant={isReady ? "secondary" : "outline"}>
            {isReady ? "环境变量已配置" : "等待环境变量配置"}
          </Badge>
          <CardTitle className="text-4xl">
            {isReady ? "环境变量已配置" : "等待环境变量配置"}
          </CardTitle>
          <CardDescription>
            {isReady
              ? "Supabase 相关环境变量已就绪。"
              : "请先配置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY。"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            {auth.isAuthenticated ? (
              <Button asChild variant="outline" className="rounded-full px-5">
                <Link href={APP_ROUTES.app}>进入应用</Link>
              </Button>
            ) : (
              <AuthDialog
                defaultNextPath={APP_ROUTES.app}
                triggerLabel="进入应用"
                triggerVariant="outline"
                triggerClassName="px-5"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
