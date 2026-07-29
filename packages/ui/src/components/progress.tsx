import * as React from "react";
import { cn } from "../cn";

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
};

export function Progress({ value, max = 100, className, ...props }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-raised", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-accent-solid transition-[width] duration-(--duration-slow) ease-(--ease-out-token)"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
