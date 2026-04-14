import * as React from "react";

type BadgeVariant = "default" | "secondary" | "outline";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-white text-zinc-950",
  secondary: "bg-emerald-400/10 text-emerald-200 border border-emerald-400/20",
  outline: "border border-white/15 bg-transparent text-zinc-100",
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
