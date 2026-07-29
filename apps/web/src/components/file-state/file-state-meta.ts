import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileSearch,
  FileText,
  Loader2,
  MicVocal,
  Sparkles,
  Upload,
  UploadCloud,
} from "lucide-react";
import type { BadgeProps } from "@transcriptioneer/ui";
import type { ProcessingStage } from "@/lib/mock-data";

export type FileVisualState =
  | "selected"
  | "uploading"
  | "uploaded"
  | "queued"
  | "processing"
  | "extracting"
  | "transcribing"
  | "analyzing"
  | "indexing"
  | "completed"
  | "failed";

/**
 * `ProcessingStage` (lib/mock-data.ts, mirrors the real pipeline states) and
 * `FileVisualState` (this file, what components actually render) overlap
 * almost entirely — this bridges the one gap ("validating" has no dedicated
 * visual state yet, it reads as "queued"). Shared so document-card.tsx and
 * the homepage's process panel don't each redefine the same mapping.
 */
export function processingStageToVisualState(stage: ProcessingStage): FileVisualState {
  return stage === "validating" ? "queued" : stage;
}

export const fileStateMeta: Record<
  FileVisualState,
  { label: string; icon: typeof Upload; badgeVariant: NonNullable<BadgeProps["variant"]>; animated?: boolean }
> = {
  selected: { label: "Selected", icon: FileText, badgeVariant: "neutral" },
  uploading: { label: "Uploading", icon: UploadCloud, badgeVariant: "info", animated: true },
  uploaded: { label: "Uploaded", icon: Upload, badgeVariant: "neutral" },
  queued: { label: "Queued", icon: Clock, badgeVariant: "neutral" },
  processing: { label: "Processing", icon: Loader2, badgeVariant: "info", animated: true },
  extracting: { label: "Extracting", icon: FileSearch, badgeVariant: "info", animated: true },
  transcribing: { label: "Transcribing", icon: MicVocal, badgeVariant: "info", animated: true },
  analyzing: { label: "Analyzing", icon: Sparkles, badgeVariant: "info", animated: true },
  indexing: { label: "Indexing", icon: Loader2, badgeVariant: "info", animated: true },
  completed: { label: "Completed", icon: CheckCircle2, badgeVariant: "success" },
  failed: { label: "Failed", icon: AlertCircle, badgeVariant: "error" },
};
