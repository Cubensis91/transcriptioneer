import * as React from "react";
import { cn } from "../cn";

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
      {...props}
    >
      {icon && <div className="text-text-subtle">{icon}</div>}
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-medium text-text">{title}</p>
        {description && <p className="max-w-sm text-sm text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
