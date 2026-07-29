import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "../cn";

export type SpinnerProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: "sm" | "md" | "lg";
};

const sizeClasses = { sm: "size-4", md: "size-5", lg: "size-6" };

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <span role="status" aria-label="Loading" {...props}>
      <Loader2 className={cn("animate-spin text-text-subtle", sizeClasses[size], className)} aria-hidden />
    </span>
  );
}
