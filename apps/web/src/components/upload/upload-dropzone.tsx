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
        "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-(--duration-base)",
        isDragging ? "border-accent-solid bg-accent-subtle" : "border-border-strong bg-surface",
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-accent-subtle">
        <UploadCloud className="size-5 text-accent" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-medium text-text">
          Drag audio or documents here
        </p>
        <p className="text-sm text-text-muted">
          MP3, WAV, M4A, AAC, PDF, DOCX, TXT, or Markdown — up to 25 files at once.
        </p>
      </div>
      <Button variant="secondary" size="sm" type="button">
        Browse files
      </Button>
    </div>
  );
}
