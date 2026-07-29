import { cn } from "@transcriptioneer/ui";

/**
 * Original mark: an arched doorway/portal on a rounded tile — the visual
 * motif every reference mockup uses, and a literal echo of VISUAL_IDENTITY.md
 * §3's framing of the intake experience as "a threshold, not a button."
 * The inner step line reads as the doorway's threshold at small sizes
 * without adding detail that would blur out at favicon scale.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      role="img"
      aria-label="Transcriptioneer"
    >
      <rect width="32" height="32" rx="9" className="fill-accent-solid" />
      <path d="M10 25 L10 14 A6 6 0 0 1 22 14 L22 25 Z" className="fill-white/95" />
      <rect x="10" y="21.5" width="12" height="1.6" className="fill-accent-solid/40" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-lg font-medium tracking-tight text-text", className)}>
      Transcriptioneer
    </span>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <Wordmark />
    </div>
  );
}
