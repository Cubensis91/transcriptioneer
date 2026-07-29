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
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-raised shadow-[inset_0_1px_2px_rgb(var(--shadow-color)/0.12)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-accent-solid bg-[image:var(--surface-gradient-accent)] transition-[width]",
          "shadow-[inset_0_1px_0_0_var(--bevel-highlight)] duration-(--duration-slow) ease-(--ease-out-token)",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
