"use client";

import { Button, cn } from "@transcriptioneer/ui";
import { Lock } from "lucide-react";
import { useRef, useState } from "react";
import type { FileVisualState } from "@/components/file-state/file-state-meta";
import { ScribeMark } from "@/components/scribe-mark";
import type { MockDocument } from "@/lib/mock-data";
import { FileTypeIndicator } from "./file-type-indicator";

const SUPPORTED_KINDS: MockDocument["kind"][] = ["audio", "pdf", "docx", "txt", "md"];

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
  className,
}: {
  state?: FileVisualState;
  onFilesSelected?: (files: FileList) => void;
  className?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) onFilesSelected?.(files);
  };

  return (
    <div
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
      className={cn(
        "relative flex flex-col items-center gap-4 overflow-hidden rounded-xl px-8 py-14 text-center",
        "shadow-lg ring-1 ring-inset ring-white/10 transition-[background-color,box-shadow] duration-(--duration-base)",
        isDragging
          ? "bg-[image:var(--surface-gradient-pressed)] shadow-[inset_0_4px_12px_rgb(0_0_0/0.3)]"
          : "bg-[image:var(--hero-gradient-cosmic)]",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <ScribeMark state={state} className="size-20 drop-shadow-[0_8px_24px_rgb(0_0_0/0.4)]" />

      <div className="flex flex-col gap-1.5">
        <p className="font-display text-xl font-medium text-white">Drag your file here</p>
        <p className="text-sm text-white/70">or click below — I&apos;ll take it from there.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {SUPPORTED_KINDS.map((kind) => (
          <FileTypeIndicator key={kind} kind={kind} className="bg-white/10 text-white/80" />
        ))}
      </div>

      <Button variant="primary" size="lg" type="button" className="mt-2" onClick={() => inputRef.current?.click()}>
        Browse files
      </Button>

      <p className="flex items-center gap-1.5 text-xs text-white/50">
        <Lock className="size-3" aria-hidden />
        Secure, private, yours only.
      </p>
    </div>
  );
}
