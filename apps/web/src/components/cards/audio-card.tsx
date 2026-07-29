import { Card, CardContent, CardHeader, CardTitle } from "@transcriptioneer/ui";
import { FileStateBadge } from "../file-state/file-state-badge";
import type { FileVisualState } from "../file-state/file-state-meta";

const barHeights = [30, 55, 40, 70, 45, 60, 35, 50, 65, 40, 55, 30];

export function AudioCard({
  title,
  duration,
  updatedAt,
  state,
}: {
  title: string;
  duration: string;
  updatedAt: string;
  state: FileVisualState;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex flex-col gap-0.5">
          <CardTitle>{title}</CardTitle>
          <p className="text-xs text-text-subtle">
            {duration} · {updatedAt}
          </p>
        </div>
        <FileStateBadge state={state} />
      </CardHeader>
      <CardContent>
        <div className="flex h-10 items-end gap-0.5" aria-hidden>
          {barHeights.map((height, index) => (
            <span
              key={index}
              className="w-1 flex-1 rounded-full bg-accent-solid/50"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
