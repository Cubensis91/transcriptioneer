import { Sparkles } from "lucide-react";

export function AiInsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-accent-subtle-border bg-accent-subtle px-4 py-3.5">
      <div className="flex items-center gap-2 text-xs font-medium text-accent">
        <Sparkles className="size-3.5" aria-hidden />
        AI insight
      </div>
      <p className="mt-1.5 text-sm font-medium text-text">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{body}</p>
    </div>
  );
}
