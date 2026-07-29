import { Badge, Card, CardContent, CardHeader, CardTitle } from "@transcriptioneer/ui";
import { FileText } from "lucide-react";
import { FileStateBadge } from "../file-state/file-state-badge";
import type { MockDocument } from "@/lib/mock-data";

const stageToVisual = {
  uploaded: "uploaded",
  validating: "queued",
  queued: "queued",
  processing: "processing",
  extracting: "extracting",
  transcribing: "transcribing",
  analyzing: "analyzing",
  indexing: "indexing",
  completed: "completed",
  failed: "failed",
} as const;

export function DocumentCard({ document }: { document: MockDocument }) {
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex items-start gap-2.5">
          <FileText className="mt-0.5 size-4 shrink-0 text-text-subtle" aria-hidden />
          <div className="flex flex-col gap-0.5">
            <CardTitle>{document.title}</CardTitle>
            <p className="text-xs text-text-subtle">
              {document.durationOrPages} · {document.updatedAt}
            </p>
          </div>
        </div>
        <FileStateBadge state={stageToVisual[document.stage]} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-text-muted">
          {document.summary || "Summary will appear once processing completes."}
        </p>
        <Badge variant="accent" className="w-fit">
          {document.project}
        </Badge>
      </CardContent>
    </Card>
  );
}
