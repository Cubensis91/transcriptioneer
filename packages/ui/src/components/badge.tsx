import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../cn";

// A light touch of tactility only — full bevels would be noisy at chip
// scale and hurt scannability where many badges render inline (e.g. the
// 11 file-processing states). A thin top highlight plus a faint gradient
// on top of each variant's flat subtle-color base is enough to avoid pure
// flat fill without overpowering the content.
const badgeBevel = "shadow-[inset_0_1px_0_0_var(--bevel-highlight)]";

export const badgeVariants = cva(
  `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${badgeBevel}`,
  {
    variants: {
      variant: {
        neutral: "bg-surface-raised text-text-muted border border-border",
        accent: "bg-accent-subtle bg-[image:linear-gradient(180deg,color-mix(in_srgb,var(--color-accent-subtle)_100%,white_6%),var(--color-accent-subtle))] text-accent border border-accent-subtle-border",
        success: "bg-success-subtle bg-[image:linear-gradient(180deg,color-mix(in_srgb,var(--color-success-subtle)_100%,white_6%),var(--color-success-subtle))] text-success border border-success-border",
        warning: "bg-warning-subtle bg-[image:linear-gradient(180deg,color-mix(in_srgb,var(--color-warning-subtle)_100%,white_6%),var(--color-warning-subtle))] text-warning border border-warning-border",
        error: "bg-error-subtle bg-[image:linear-gradient(180deg,color-mix(in_srgb,var(--color-error-subtle)_100%,white_6%),var(--color-error-subtle))] text-error border border-error-border",
        info: "bg-info-subtle bg-[image:linear-gradient(180deg,color-mix(in_srgb,var(--color-info-subtle)_100%,white_6%),var(--color-info-subtle))] text-info border border-info-border",
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
