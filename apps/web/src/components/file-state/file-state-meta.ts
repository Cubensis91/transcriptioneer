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
