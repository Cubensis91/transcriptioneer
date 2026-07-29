import { cn } from "@transcriptioneer/ui";
import type { LucideIcon } from "lucide-react";

export function BulletedList({
  icon: Icon,
  items,
  iconClassName,
}: {
  icon: LucideIcon;
  items: string[];
  iconClassName?: string;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2.5 text-sm text-text">
          <Icon className={cn("mt-0.5 size-4 shrink-0 text-text-subtle", iconClassName)} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
