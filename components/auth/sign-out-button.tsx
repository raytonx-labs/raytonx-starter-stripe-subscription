"use client";

import { useRouter } from "next/navigation";

import { Button, type ButtonProps } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/client";

type SignOutButtonProps = {
  label?: string;
} & Pick<ButtonProps, "variant" | "size" | "className">;

export function SignOutButton({
  className,
  label = "退出登录",
  variant = "outline",
  size = "sm",
}: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace(APP_ROUTES.home);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleSignOut}
      className={className}
    >
      {label}
    </Button>
  );
}
