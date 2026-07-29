import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "../cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
    "transition-colors duration-(--duration-fast) ease-(--ease-out-token) disabled:pointer-events-none disabled:opacity-50 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Gradient fill + evolved (bevelled) shadow gives the "physical
        // button" read; the active: pair simulates a press by inverting to
        // an inset-only shadow and nudging the button down one pixel.
        primary:
          "bg-accent-solid bg-[image:var(--surface-gradient-accent)] text-text-on-accent shadow-md " +
          "hover:bg-accent-solid-hover active:translate-y-px active:shadow-[inset_0_2px_4px_rgb(0_0_0/0.3)]",
        secondary:
          "bg-surface bg-[image:var(--surface-gradient-raised)] text-text border border-border-strong shadow-md " +
          "hover:bg-surface-raised hover:border-border-strong active:translate-y-px active:bg-[image:var(--surface-gradient-pressed)] active:shadow-[inset_0_2px_4px_rgb(0_0_0/0.12)]",
        // Tertiary/ghost are deliberately de-emphasized actions — full
        // bevel at rest would flatten the hierarchy the tactile treatment
        // is meant to create, so they only pick up a bevel on hover/focus.
        tertiary: "bg-accent-subtle text-accent hover:bg-accent-subtle-border/40 hover:shadow-sm",
        ghost: "text-text-muted hover:bg-surface-raised hover:text-text hover:shadow-sm",
        destructive:
          "bg-error bg-[image:linear-gradient(180deg,var(--error-500),var(--color-error))] text-text-on-accent shadow-md " +
          "hover:opacity-90 active:translate-y-px active:shadow-[inset_0_2px_4px_rgb(0_0_0/0.3)]",
      },
      size: {
        sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
        md: "h-10 px-4 [&_svg]:size-4",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, children, ...props }, ref) => {
    // Slot (asChild) requires exactly one element child to clone props onto,
    // so the loading spinner — which only makes sense for a real <button>
    // anyway — is only added in the non-asChild branch.
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
