import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-surface-raised text-text-muted border border-border",
        accent: "bg-accent-subtle text-accent border border-accent-subtle-border",
        success: "bg-success-subtle text-success border border-success-border",
        warning: "bg-warning-subtle text-warning border border-warning-border",
        error: "bg-error-subtle text-error border border-error-border",
        info: "bg-info-subtle text-info border border-info-border",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
