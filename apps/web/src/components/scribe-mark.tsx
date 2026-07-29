"use client";

import { cn } from "@transcriptioneer/ui";
import { motion, useReducedMotion } from "framer-motion";
import type { FileVisualState } from "./file-state/file-state-meta";

const ACTIVE_STATES: ReadonlySet<FileVisualState> = new Set([
  "processing",
  "extracting",
  "transcribing",
  "analyzing",
  "indexing",
]);

/**
 * Original, non-mascot placeholder for the product's hooded-scribe
 * character (VISUAL_IDENTITY.md §1) — a simple geometric silhouette, not a
 * detailed illustration. Swap for real character art later; the shape,
 * glowing-eyes accent, and state-reactivity are what matter for now.
 */
export function ScribeMark({
  state,
  animate = true,
  className,
}: {
  state?: FileVisualState;
  /** Idle "breathing" loop when not actively processing. Off by default
   *  wherever the mark is purely decorative/small (e.g. sidebar). */
  animate?: boolean;
  className?: string;
}) {
  const active = state ? ACTIVE_STATES.has(state) : false;
  const reduceMotion = useReducedMotion();
  const breathe = animate && !active && !reduceMotion;

  return (
    <motion.svg
      viewBox="0 0 32 40"
      className={cn("size-16", className)}
      aria-hidden
      animate={breathe ? { scale: [1, 1.03, 1] } : undefined}
      transition={breathe ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {/* Hood / cloak silhouette — deep navy character material, fixed
          across light/dark themes like a brand mark rather than a themed
          surface color. */}
      <path
        d="M16 4C9.4 4 5 9.8 5 17.5V33.5C5 35.98 7.02 38 9.5 38H22.5C24.98 38 27 35.98 27 33.5V17.5C27 9.8 22.6 4 16 4Z"
        fill="#132b46"
      />
      {/* Headphone band + ear cups */}
      <path
        d="M8 15C8 9.48 11.58 5 16 5C20.42 5 24 9.48 24 15"
        fill="none"
        stroke="#8a97a8"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="6" y="14" width="3.4" height="7" rx="1.7" fill="#8a97a8" />
      <rect x="22.6" y="14" width="3.4" height="7" rx="1.7" fill="#8a97a8" />
      {/* Glowing eyes — the one recurring "alive" accent across every
          state; pulse gently while the pipeline is actively working, and
          breathe softly while idle — both respect prefers-reduced-motion
          (animate-pulse via the shared global CSS override, the idle
          breathing loop via framer-motion's useReducedMotion above). */}
      <circle cx="12.2" cy="19.5" r="1.7" className={cn("fill-accent-400", active && "animate-pulse")} />
      <circle cx="19.8" cy="19.5" r="1.7" className={cn("fill-accent-400", active && "animate-pulse")} />
    </motion.svg>
  );
}
