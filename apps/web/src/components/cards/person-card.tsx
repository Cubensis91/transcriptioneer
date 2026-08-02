import { Avatar } from "@transcriptioneer/ui";
import type { MockPerson } from "@/lib/mock-data";

export function PersonCard({ person }: { person: MockPerson }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <Avatar name={person.name} />
      <div className="flex flex-1 flex-col">
        <p className="text-sm font-medium text-text">{person.name}</p>
        <p className="text-xs text-text-subtle">{person.role}</p>
      </div>
      <span className="text-xs text-text-subtle">{person.mentions} menciones</span>
    </div>
  );
}
