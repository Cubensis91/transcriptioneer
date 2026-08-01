"use client";

import { Avatar, cn } from "@transcriptioneer/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "../brand-mark";
import { navItems } from "./nav-items";

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface p-4",
        "bg-[image:var(--surface-gradient-raised)] shadow-sm ring-1 ring-inset ring-[var(--ring-inset)]",
        className,
      )}
    >
      <BrandLockup className="px-2 py-2" />

      <nav className="mt-6 flex flex-col gap-0.5" aria-label="Primary">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-(--duration-fast)",
                isActive
                  ? "bg-accent-subtle text-accent"
                  : "text-text-muted hover:bg-surface-raised hover:text-text",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 rounded-md px-2 py-2">
        <Avatar name="Elena Marsh" size="sm" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-text">Elena Marsh</span>
          <span className="truncate text-xs text-text-subtle">Respira Labs</span>
        </div>
      </div>
    </aside>
  );
}
