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
  selected: { label: "Seleccionado", icon: FileText, badgeVariant: "neutral" },
  uploading: { label: "Subiendo", icon: UploadCloud, badgeVariant: "info", animated: true },
  uploaded: { label: "Subido", icon: Upload, badgeVariant: "neutral" },
  queued: { label: "En cola", icon: Clock, badgeVariant: "neutral" },
  processing: { label: "Procesando", icon: Loader2, badgeVariant: "info", animated: true },
  extracting: { label: "Extrayendo", icon: FileSearch, badgeVariant: "info", animated: true },
  transcribing: { label: "Transcribiendo", icon: MicVocal, badgeVariant: "info", animated: true },
  analyzing: { label: "Analizando", icon: Sparkles, badgeVariant: "info", animated: true },
  indexing: { label: "Indexando", icon: Loader2, badgeVariant: "info", animated: true },
  completed: { label: "Completado", icon: CheckCircle2, badgeVariant: "success" },
  failed: { label: "Fallido", icon: AlertCircle, badgeVariant: "error" },
};
