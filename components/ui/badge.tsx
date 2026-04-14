import * as React from "react";

type BadgeVariant = "default" | "secondary" | "outline";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "border border-border bg-secondary text-secondary-foreground",
  outline: "border border-border bg-transparent text-foreground",
};

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
