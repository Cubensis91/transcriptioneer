"use client";

import { Button, cn } from "@transcriptioneer/ui";
import { UploadCloud } from "lucide-react";
import { useState } from "react";

export function UploadDropzone() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl px-6 py-14 text-center shadow-sm ring-1 ring-inset transition-[background-color,box-shadow] duration-(--duration-base)",
        isDragging
          ? "bg-[image:var(--surface-gradient-pressed)] shadow-[inset_0_4px_12px_rgb(0_0_0/0.15)] ring-accent-solid"
          : "bg-[image:var(--surface-gradient-raised)] ring-[var(--ring-inset)]",
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-accent-subtle shadow-sm ring-1 ring-inset ring-[var(--ring-inset)]">
        <UploadCloud className="size-5 text-accent" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-medium text-text">
          Bring me audio or documents
        </p>
        <p className="text-sm text-text-muted">
          MP3, WAV, M4A, AAC, MP4, PDF, DOCX, TXT, Markdown, or images — up to 25 files at once.
        </p>
      </div>
      <Button variant="secondary" size="sm" type="button">
        Browse files
      </Button>
    </div>
  );
}
