import * as React from "react";
import { cn } from "../cn";

export type AvatarProps = React.HTMLAttributes<HTMLSpanElement> & {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
};

const palette = [
  "bg-accent-100 text-accent-800",
  "bg-neutral-200 text-neutral-800",
  "bg-success-subtle text-success",
  "bg-info-subtle text-info",
  "bg-warning-subtle text-warning",
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function paletteIndexOf(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash % palette.length;
}

export function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium",
        sizeClasses[size],
        !src && palette[paletteIndexOf(name)],
        className,
      )}
      role="img"
      aria-label={name}
      {...props}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initialsOf(name)}</span>
      )}
    </span>
  );
}
