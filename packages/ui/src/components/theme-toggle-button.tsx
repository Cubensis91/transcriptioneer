import { Moon, Sun } from "lucide-react";
import * as React from "react";
import { cn } from "../cn";

export type ThemeToggleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isDark: boolean;
};

/** Presentational only — the app wires `isDark`/`onClick` to its own theme provider (see apps/web's next-themes setup). */
export const ThemeToggleButton = React.forwardRef<HTMLButtonElement, ThemeToggleButtonProps>(
  ({ isDark, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md text-text-muted transition-colors duration-(--duration-fast)",
        "hover:bg-surface-raised hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      {...props}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  ),
);
ThemeToggleButton.displayName = "ThemeToggleButton";
