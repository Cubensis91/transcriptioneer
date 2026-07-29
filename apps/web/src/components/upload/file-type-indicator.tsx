import { cn } from "@transcriptioneer/ui";
import { FileAudio, FileText, FileType } from "lucide-react";
import type { MockDocument } from "@/lib/mock-data";

const kindMeta: Record<MockDocument["kind"], { label: string; icon: typeof FileText }> = {
  audio: { label: "Audio", icon: FileAudio },
  pdf: { label: "PDF", icon: FileText },
  docx: { label: "DOCX", icon: FileText },
  txt: { label: "TXT", icon: FileType },
  md: { label: "Markdown", icon: FileType },
};

export function FileTypeIndicator({ kind, className }: { kind: MockDocument["kind"]; className?: string }) {
  const { label, icon: Icon } = kindMeta[kind];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-surface-raised px-2 py-1 text-xs font-medium text-text-muted",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
