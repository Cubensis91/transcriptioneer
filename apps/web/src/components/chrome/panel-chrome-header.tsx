import { cn } from "@transcriptioneer/ui";
import type { ReactNode } from "react";

/**
 * Decorative macOS-style traffic-light header strip for major panels/cards
 * (VISUAL_IDENTITY.md — the "window chrome" direction). Purely decorative:
 * the dots never act as real window controls, so they're aria-hidden and
 * carry no click handlers implying close/minimize/zoom. `title` is the
 * panel's real accessible label, not the dots or color.
 *
 * Composed around Card rather than built into it, so a plain Card (e.g.
 * Design Lab's generic examples) never grows chrome it didn't ask for:
 *   <Card><PanelChromeHeader title="Recent documents" /><CardContent>…
 */
export function PanelChromeHeader({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-t-lg border-b border-border bg-[image:var(--surface-gradient-raised)] px-4 py-3",
        "shadow-[inset_0_1px_0_0_var(--bevel-highlight)]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="size-2.5 rounded-full bg-[var(--chrome-dot-red)] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.5),inset_0_-1px_1px_0_rgb(0_0_0/0.2)]" />
        <span className="size-2.5 rounded-full bg-[var(--chrome-dot-amber)] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.5),inset_0_-1px_1px_0_rgb(0_0_0/0.2)]" />
        <span className="size-2.5 rounded-full bg-[var(--chrome-dot-green)] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.5),inset_0_-1px_1px_0_rgb(0_0_0/0.2)]" />
      </div>
      <h3 className="flex-1 truncate text-sm font-semibold text-text">{title}</h3>
      {children}
    </div>
  );
}
