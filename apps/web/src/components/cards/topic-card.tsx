import type { MockTopic } from "@/lib/mock-data";

export function TopicCard({ topic, maxCount }: { topic: MockTopic; maxCount: number }) {
  const percent = Math.round((topic.count / maxCount) * 100);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text">{topic.name}</p>
        <span className="text-xs text-text-subtle">{topic.count} mentions</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
        <div
          className="h-full rounded-full bg-accent-solid"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
