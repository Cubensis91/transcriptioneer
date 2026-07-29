import { ChevronRight } from "lucide-react";
import * as React from "react";
import { cn } from "../cn";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = React.HTMLAttributes<HTMLElement> & {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items, className, ...props }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm", className)} {...props}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <a href={item.href} className="text-text-muted transition-colors hover:text-text">
                  {item.label}
                </a>
              ) : (
                <span
                  className={isLast ? "font-medium text-text" : "text-text-muted"}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3.5 text-text-subtle" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
