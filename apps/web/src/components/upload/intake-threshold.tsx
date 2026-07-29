"use client";

import { Button, cn } from "@transcriptioneer/ui";
import { motion, useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";
import { useRef, useState } from "react";
import type { FileVisualState } from "@/components/file-state/file-state-meta";
import { ScribeMark } from "@/components/scribe-mark";
import type { MockDocument } from "@/lib/mock-data";
import { FileTypeIndicator } from "./file-type-indicator";

const SUPPORTED_KINDS: MockDocument["kind"][] = ["audio", "video", "pdf", "docx", "txt", "md", "image"];

// Fixed positions/delays (not random) so server and client render the same
// markup — Math.random() here would be a hydration mismatch.
const PARTICLES = [
  { left: "12%", top: "22%", delay: 0 },
  { left: "84%", top: "18%", delay: 0.7 },
  { left: "22%", top: "80%", delay: 1.4 },
  { left: "72%", top: "74%", delay: 2.1 },
  { left: "48%", top: "12%", delay: 2.8 },
] as const;

/**
 * The signature intake experience (VISUAL_IDENTITY.md §3) — "a threshold,
 * not a button." The drop region itself isn't a focusable control (drag
 * events fire on any element); the visible "Browse files" button is the
 * single real keyboard/click entry point, so this never nests one
 * interactive control inside another.
 */
export function IntakeThreshold({
  state,
  onFilesSelected,
  size = "default",
  className,
}: {
  state?: FileVisualState;
  onFilesSelected?: (files: FileList) => void;
  /** "hero" is the enlarged homepage centerpiece treatment. */
  size?: "default" | "hero";
  className?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  const hero = size === "hero";

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) onFilesSelected?.(files);
  };

  return (
    <motion.div
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      whileHover={reduceMotion ? undefined : { scale: 1.006 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col items-center gap-4 overflow-hidden rounded-xl text-center",
        hero ? "gap-5 px-10 py-20" : "px-8 py-14",
        "shadow-lg ring-1 ring-inset ring-white/10 transition-[background-color,box-shadow] duration-(--duration-base)",
        isDragging
          ? "bg-[image:var(--surface-gradient-pressed)] shadow-[inset_0_4px_12px_rgb(0_0_0/0.3)]"
          : "bg-[image:var(--hero-gradient-cosmic)]",
        className,
      )}
    >
      {/* Soft breathing glow — an ambient "alive" cue, never a hard flash;
          skipped entirely under reduced motion rather than just slowed. */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 35%, rgb(255 255 255 / 0.14), transparent 60%)" }}
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Slow-drifting particle dots — decoration only, kept low-opacity
          and never overlapping the button/text below. */}
      {!reduceMotion &&
        PARTICLES.map((p) => (
          <motion.span
            key={p.left + p.top}
            aria-hidden
            className="pointer-events-none absolute size-1 rounded-full bg-white/40"
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -10, 0], opacity: [0.15, 0.55, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}

      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <ScribeMark
        state={state}
        className={cn("relative drop-shadow-[0_8px_24px_rgb(0_0_0/0.4)]", hero ? "size-28" : "size-20")}
      />

      <div className="relative flex flex-col gap-1.5">
        <p className={cn("font-display font-medium text-white", hero ? "text-2xl" : "text-xl")}>
          Bring me something to understand
        </p>
        <p className={cn("text-white/70", hero ? "text-base" : "text-sm")}>
          Drop it here, or click below — I&apos;ll take it from there.
        </p>
      </div>

      <div className="relative flex flex-wrap justify-center gap-2">
        {SUPPORTED_KINDS.map((kind) => (
          <FileTypeIndicator key={kind} kind={kind} className="bg-white/10 text-white/80" />
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        type="button"
        className="relative mt-2"
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </Button>

      <p className="relative flex items-center gap-1.5 text-xs text-white/50">
        <Lock className="size-3" aria-hidden />
        Secure, private, yours only.
      </p>
    </motion.div>
  );
}
