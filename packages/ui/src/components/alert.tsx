import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import * as React from "react";
import { cn } from "../cn";

export const alertVariants = cva("flex gap-3 rounded-lg border p-4 text-sm", {
  variants: {
    variant: {
      info: "bg-info-subtle border-info-border text-text",
      success: "bg-success-subtle border-success-border text-text",
      warning: "bg-warning-subtle border-warning-border text-text",
      error: "bg-error-subtle border-error-border text-text",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const iconColor = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    title?: string;
  };

export function Alert({ className, variant = "info", title, children, ...props }: AlertProps) {
  const Icon = icons[variant ?? "info"];

  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", iconColor[variant ?? "info"])} aria-hidden />
      <div className="flex flex-col gap-0.5">
        {title && <p className="font-medium text-text">{title}</p>}
        {children && <div className="text-text-muted">{children}</div>}
      </div>
    </div>
  );
}
