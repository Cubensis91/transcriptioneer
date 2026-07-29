import { Badge } from "@transcriptioneer/ui";
import { GitCommitHorizontal } from "lucide-react";
import type { MockDecision } from "@/lib/mock-data";

export function DecisionCard({ decision }: { decision: MockDecision }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <GitCommitHorizontal className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-sm text-text">{decision.text}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-subtle">{decision.date}</span>
          <Badge variant="neutral">{decision.project}</Badge>
        </div>
      </div>
    </div>
  );
}
