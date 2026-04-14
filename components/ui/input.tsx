import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={[
          "flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-50 outline-none transition placeholder:text-zinc-500 focus:border-white/30",
          className,
        ].join(" ")}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
