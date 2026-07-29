import * as React from "react";
import { cn } from "../cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-24 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-text",
          "shadow-[inset_0_1px_2px_rgb(var(--shadow-color)/0.1),inset_0_1px_0_0_var(--bevel-lowlight)]",
          "placeholder:text-text-subtle transition-colors duration-(--duration-fast)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-error focus-visible:ring-error",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
