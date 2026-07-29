import { Progress } from "@transcriptioneer/ui";
import { FileStateBadge } from "../file-state/file-state-badge";
import { FileTypeIndicator } from "./file-type-indicator";
import type { UploadQueueItem as UploadQueueItemType } from "@/lib/mock-data";

const stageVisual = {
  uploaded: "uploaded",
  processing: "processing",
  queued: "queued",
  failed: "failed",
} as const;

export function UploadQueueItem({ item }: { item: UploadQueueItemType }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <FileTypeIndicator kind={item.kind} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-text">{item.name}</p>
          <FileStateBadge state={stageVisual[item.stage as keyof typeof stageVisual] ?? "queued"} />
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="shrink-0 text-xs text-text-subtle">{item.size}</span>
          <Progress value={item.progress} className="h-1.5 flex-1" />
          <span className="w-8 shrink-0 text-right text-xs tabular-nums text-text-subtle">
            {item.progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
