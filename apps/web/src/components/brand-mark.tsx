import { cn } from "@transcriptioneer/ui";

/**
 * Placeholder original mark: a rounded tile holding three ascending bars —
 * a quiet nod to turning raw audio (waveform) into structured knowledge
 * (rising, ordered bars) rather than a literal microphone/sound-wave icon.
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
      <rect x="8" y="17" width="4" height="8" rx="1.5" className="fill-white/90" />
      <rect x="14" y="11" width="4" height="14" rx="1.5" className="fill-white" />
      <rect x="20" y="14" width="4" height="11" rx="1.5" className="fill-white/70" />
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
