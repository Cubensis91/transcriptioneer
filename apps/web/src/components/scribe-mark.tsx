"use client";

import { cn } from "@transcriptioneer/ui";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { FileVisualState } from "./file-state/file-state-meta";

const ACTIVE_STATES: ReadonlySet<FileVisualState> = new Set([
  "processing",
  "extracting",
  "transcribing",
  "analyzing",
  "indexing",
]);

/** The product's scribe character — see references/final-logo-4k.png. */
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
    <motion.div
      className={cn("relative size-16", className)}
      aria-hidden
      animate={
        breathe
          ? { scale: [1, 1.03, 1] }
          : active
            ? { opacity: [0.75, 1, 0.75] }
            : undefined
      }
      transition={
        breathe || active ? { duration: breathe ? 4 : 1.6, repeat: Infinity, ease: "easeInOut" } : undefined
      }
    >
      <Image src="/brand/scribe-emblem.png" alt="" fill sizes="128px" className="rounded-full object-contain" />
    </motion.div>
  );
}
