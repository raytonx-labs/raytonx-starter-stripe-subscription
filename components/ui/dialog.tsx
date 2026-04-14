"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

type DialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export function DialogOverlay({ className = "", ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={["fixed inset-0 z-50 bg-black/60 backdrop-blur-sm", className].join(" ")}
      {...props}
    />
  );
}

export function DialogContent({ className = "", children, ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={[
          "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-popover p-6 text-popover-foreground shadow-2xl shadow-black/40 outline-none",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}

export function DialogTitle({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={className} {...props} />;
}
