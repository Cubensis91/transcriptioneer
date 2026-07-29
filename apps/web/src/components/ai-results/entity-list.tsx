import { Badge, type BadgeProps } from "@transcriptioneer/ui";

export function EntityList({
  label,
  items,
  variant = "neutral",
}: {
  label: string;
  items: string[];
  variant?: NonNullable<BadgeProps["variant"]>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant={variant}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
