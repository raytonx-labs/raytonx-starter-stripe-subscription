import Link from "next/link";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { AccountMenu } from "@/components/layout/account-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/auth/config";
import { getAuthContext } from "@/lib/auth/session";

export async function SiteHeader() {
  const auth = await getAuthContext();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <Card className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-none border-0 bg-transparent px-6 py-4 shadow-none">
        <div className="flex items-center gap-3">
          <Link href={APP_ROUTES.home} className="text-sm font-medium text-foreground">
            RaytonX
          </Link>
          <Badge variant="outline" className="text-muted-foreground">
            Stripe Subscription
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {auth.isAuthenticated ? (
            <AccountMenu auth={auth} />
          ) : (
            <AuthDialog
              defaultNextPath={APP_ROUTES.app}
              triggerLabel="进入应用"
              triggerVariant="outline"
              triggerSize="sm"
              triggerClassName="rounded-full"
            />
          )}
        </div>
      </Card>
    </header>
  );
}
