import { cn } from "@transcriptioneer/ui";
import { navItems } from "./nav-items";

export function MobileNav({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        "flex w-full items-center justify-between border-t border-border bg-surface px-2 py-2 shadow-[0_-1px_0_0_var(--color-border)]",
        className,
      )}
    >
      {navItems.slice(0, 4).map(({ label, href, icon: Icon }, index) => (
        <a
          key={label}
          href={href}
          aria-current={index === 0 ? "page" : undefined}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-[11px] font-medium transition-colors duration-(--duration-fast)",
            index === 0 ? "text-accent" : "text-text-subtle hover:text-text",
          )}
        >
          <Icon className="size-5" aria-hidden />
          {label}
        </a>
      ))}
    </nav>
  );
}
