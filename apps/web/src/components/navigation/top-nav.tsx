"use client";

import { Avatar, SearchInput, ThemeToggleButton, cn } from "@transcriptioneer/ui";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function TopNav({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes' own documented pattern for avoiding a hydration mismatch:
  // `resolvedTheme` is unknown during SSR, so the real value is only safe to
  // read after mount. A single one-shot flip on mount, not a subscription.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header
      className={cn(
        "flex items-center gap-4 border-b border-border bg-surface px-4 py-3 sm:px-6",
        "bg-[image:var(--surface-gradient-raised)] shadow-sm ring-1 ring-inset ring-[var(--ring-inset)]",
        className,
      )}
    >
      <div className="max-w-md flex-1">
        <SearchInput placeholder="Search your knowledge base…" aria-label="Search" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggleButton
          isDark={isDark}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        />
        <Avatar name="Elena Marsh" size="sm" />
      </div>
    </header>
  );
}
