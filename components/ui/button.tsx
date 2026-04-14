import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

type ButtonVariant = "default" | "outline" | "ghost" | "icon" | "secondary";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-white text-zinc-950 hover:bg-zinc-200",
  outline: "border border-white/15 bg-transparent text-zinc-50 hover:bg-white/10",
  ghost: "bg-transparent text-zinc-50 hover:bg-white/10",
  icon: "bg-transparent text-zinc-50 hover:bg-white/10",
  secondary: "bg-zinc-100 text-zinc-950 hover:bg-zinc-200",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5 py-3",
  sm: "h-9 px-4 py-2 text-sm",
  lg: "h-12 px-6 py-3",
  icon: "h-10 w-10 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      type = "button",
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={[
          "inline-flex items-center justify-center rounded-full text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
