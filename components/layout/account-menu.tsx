"use client";

import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_ROUTES } from "@/lib/auth/config";
import type { AuthContext } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/client";

type AccountMenuProps = {
  auth: Extract<AuthContext, { isAuthenticated: true }>;
};

export function AccountMenu({ auth }: AccountMenuProps) {
  const router = useRouter();
  const displayName = auth.profile.full_name ?? auth.user.email;
  const avatarFallback = (displayName || auth.user.email).trim().slice(0, 1).toUpperCase();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace(APP_ROUTES.home);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="打开账户菜单"
          className="rounded-full outline-none ring-0 transition focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <Avatar className="h-10 w-10 border border-border">
            {auth.profile.avatar_url ? (
              <AvatarImage src={auth.profile.avatar_url} alt={displayName} />
            ) : null}
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="normal-case tracking-normal text-muted-foreground">
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">{auth.user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={() => {
            void handleSignOut();
          }}
        >
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
