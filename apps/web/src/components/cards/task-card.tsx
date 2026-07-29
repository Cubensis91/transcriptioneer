import { Badge, Checkbox } from "@transcriptioneer/ui";
import { cn } from "@transcriptioneer/ui";
import type { MockTask } from "@/lib/mock-data";

export function TaskCard({ task }: { task: MockTask }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <Checkbox defaultChecked={task.done} aria-label={`Mark "${task.title}" as ${task.done ? "not done" : "done"}`} />
      <p className={cn("flex-1 text-sm", task.done ? "text-text-subtle line-through" : "text-text")}>
        {task.title}
      </p>
      {task.due && <span className="text-xs text-text-subtle">Due {task.due}</span>}
      <Badge variant="neutral">{task.project}</Badge>
    </div>
  );
}
