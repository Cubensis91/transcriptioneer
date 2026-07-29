import { Card, CardContent, cn } from "@transcriptioneer/ui";
import { CheckCircle2, Lightbulb, Link2, ListTodo } from "lucide-react";
import { PanelChromeHeader } from "@/components/chrome/panel-chrome-header";
import { mockDecisions, mockFacts, mockTasks, mockTopics } from "@/lib/mock-data";

const stats = [
  { label: "ideas found", value: mockFacts.length, icon: Lightbulb },
  { label: "decisions", value: mockDecisions.length, icon: CheckCircle2 },
  { label: "connections", value: mockTopics.length, icon: Link2 },
  { label: "tasks suggested", value: mockTasks.filter((task) => !task.done).length, icon: ListTodo },
];

export function QuickInsightsPanel({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <PanelChromeHeader title="Quick insights" />
      <CardContent className="grid grid-cols-2 gap-3 pt-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface-raised bg-[image:var(--surface-gradient-raised)] p-3 shadow-sm"
          >
            <Icon className="size-4 text-accent" aria-hidden />
            <span className="font-display text-2xl font-medium text-text">{value}</span>
            <span className="text-xs text-text-subtle">{label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
