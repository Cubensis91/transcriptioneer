import { cn } from "@transcriptioneer/ui";
import Image from "next/image";

/** The official scribe emblem — see references/final-logo-4k.png. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/scribe-emblem.png"
      alt="Transcriptioneer"
      width={64}
      height={64}
      className={cn("size-8 rounded-full", className)}
    />
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
