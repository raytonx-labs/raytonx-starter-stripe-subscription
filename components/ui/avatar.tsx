import * as React from "react";

type AvatarProps = React.HTMLAttributes<HTMLDivElement>;

export function Avatar({ className = "", ...props }: AvatarProps) {
  return (
    <div
      className={["relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className].join(
        " ",
      )}
      {...props}
    />
  );
}

export function AvatarImage({
  className = "",
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img className={["h-full w-full object-cover", className].join(" ")} {...props} />;
}

export function AvatarFallback({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={[
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
