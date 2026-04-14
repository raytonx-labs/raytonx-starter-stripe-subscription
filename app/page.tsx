import Link from "next/link";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/auth/config";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const isReady = hasSupabaseEnv();
  const nextPath =
    typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-20 text-zinc-50">
      <Card className="w-full max-w-xl backdrop-blur">
        <CardHeader className="items-center text-center">
          <Badge variant={isReady ? "secondary" : "outline"}>
            {isReady ? "环境变量已配置" : "等待环境变量配置"}
          </Badge>
          <CardTitle className="text-4xl">
            {isReady ? "环境变量已配置" : "等待环境变量配置"}
          </CardTitle>
          <CardDescription className="text-zinc-300">
            {isReady
              ? "Supabase 相关环境变量已就绪。"
              : "请先配置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY。"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <AuthDialog defaultNextPath={nextPath} />
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href={APP_ROUTES.app}>进入应用</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
