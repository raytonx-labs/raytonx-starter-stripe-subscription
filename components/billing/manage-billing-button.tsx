"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { openBillingPortal } from "@/lib/billing/client";

type ManageBillingButtonProps = Omit<ButtonProps, "onClick"> & {
  label?: string;
};

export function ManageBillingButton({
  label = "管理订阅",
  children,
  disabled,
  ...props
}: ManageBillingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const { portalUrl } = await openBillingPortal();
      window.location.assign(portalUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "打开订阅管理失败";
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={disabled ?? isLoading} {...props}>
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          处理中
        </span>
      ) : (
        (children ?? label)
      )}
    </Button>
  );
}
