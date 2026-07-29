import { Badge, cn } from "@transcriptioneer/ui";
import { fileStateMeta, type FileVisualState } from "./file-state-meta";

export function FileStateBadge({ state, className }: { state: FileVisualState; className?: string }) {
  const { label, icon: Icon, badgeVariant, animated } = fileStateMeta[state];

  return (
    <Badge variant={badgeVariant} className={className}>
      <Icon className={cn("size-3", animated && "animate-spin")} aria-hidden />
      {label}
    </Badge>
  );
}
