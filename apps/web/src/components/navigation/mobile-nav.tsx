"use client";

import { cn } from "@transcriptioneer/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const items = navItems.slice(0, 5);

  return (
    <nav
      aria-label="Principal"
      className={cn(
        "flex w-full items-center justify-between border-t border-border bg-surface px-2 py-2 shadow-[0_-1px_0_0_var(--color-border)]",
        "bg-[image:var(--surface-gradient-raised)] ring-1 ring-inset ring-[var(--ring-inset)]",
        className,
      )}
    >
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
        return (
          <Link
            key={label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-[11px] font-medium transition-colors duration-(--duration-fast)",
              isActive ? "text-accent" : "text-text-subtle hover:text-text",
            )}
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
