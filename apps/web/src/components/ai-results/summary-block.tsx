import { Sparkles } from "lucide-react";

export function SummaryBlock({
  summary,
  detailedSummary,
}: {
  summary: string;
  detailedSummary: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2.5">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        <p className="font-display text-lg leading-snug text-text">{summary}</p>
      </div>
      <p className="border-l-2 border-border pl-4 text-sm leading-relaxed text-text-muted">
        {detailedSummary}
      </p>
    </div>
  );
}
