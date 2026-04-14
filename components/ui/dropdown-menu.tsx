"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export function DropdownMenuContent({
  className = "",
  sideOffset = 8,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={[
          "z-50 min-w-56 overflow-hidden rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-2xl shadow-black/40",
          className,
        ].join(" ")}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={[
        "relative flex cursor-default select-none items-center rounded-xl px-3 py-2 text-sm outline-none transition hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={["-mx-1 my-1 h-px bg-border", className].join(" ")}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={[
        "px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function DropdownMenuItemIndicator({
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.ItemIndicator>) {
  return <DropdownMenuPrimitive.ItemIndicator className={className} {...props} />;
}
