"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { openBillingCheckout } from "@/lib/billing/client";
import type { BillingInterval } from "@/lib/billing/env";

type SubscribeButtonProps = Omit<ButtonProps, "onClick"> & {
  interval: BillingInterval;
  label: string;
};

export function SubscribeButton({
  interval,
  label,
  children,
  disabled,
  ...props
}: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const { checkoutUrl } = await openBillingCheckout(interval);
      window.location.assign(checkoutUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "打开订阅流程失败";
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
