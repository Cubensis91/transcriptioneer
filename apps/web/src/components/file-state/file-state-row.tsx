import { Button, Progress, cn } from "@transcriptioneer/ui";
import { FileAudio, FileText, RotateCw } from "lucide-react";
import { FileStateBadge } from "./file-state-badge";
import type { FileVisualState } from "./file-state-meta";

export type FileStateRowProps = {
  name: string;
  meta: string;
  kind: "audio" | "document";
  state: FileVisualState;
  progress?: number;
  onRetry?: () => void;
  className?: string;
};

export function FileStateRow({ name, meta, kind, state, progress, onRetry, className }: FileStateRowProps) {
  const Icon = kind === "audio" ? FileAudio : FileText;
  const showProgress = typeof progress === "number" && state !== "completed" && state !== "failed";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3",
        className,
      )}
    >
      <Icon className="size-5 shrink-0 text-text-subtle" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-text">{name}</p>
          <FileStateBadge state={state} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs text-text-subtle">{meta}</p>
          {showProgress && (
            <Progress value={progress} className="h-1.5 max-w-32 flex-1" />
          )}
        </div>
      </div>
      {state === "failed" && onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <RotateCw className="size-3.5" aria-hidden />
          Retry
        </Button>
      )}
    </div>
  );
}
