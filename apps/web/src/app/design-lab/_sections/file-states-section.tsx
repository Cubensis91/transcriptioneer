import { FileStateBadge } from "@/components/file-state/file-state-badge";
import { FileStateRow } from "@/components/file-state/file-state-row";
import type { FileVisualState } from "@/components/file-state/file-state-meta";
import { Section, SubLabel } from "./section";

const allStates: FileVisualState[] = [
  "selected",
  "uploading",
  "uploaded",
  "queued",
  "processing",
  "extracting",
  "transcribing",
  "analyzing",
  "indexing",
  "completed",
  "failed",
];

export function FileStatesSection() {
  return (
    <Section
      id="file-states"
      title="File states"
      description="Every stage of the processing pipeline (see ARCHITECTURE.md §6) as a visual state. Visual only in this milestone — no file is actually processed."
    >
      <div className="flex flex-col gap-8">
        <div>
          <SubLabel>Badges</SubLabel>
          <div className="flex flex-wrap gap-2">
            {allStates.map((state) => (
              <FileStateBadge key={state} state={state} />
            ))}
          </div>
        </div>

        <div>
          <SubLabel>Rows</SubLabel>
          <div className="flex flex-col gap-2">
            <FileStateRow name="board-meeting.m4a" meta="42.1 MB" kind="audio" state="uploading" progress={38} />
            <FileStateRow name="interview-raw.wav" meta="118 MB" kind="audio" state="transcribing" progress={70} />
            <FileStateRow name="contract-draft.pdf" meta="1.8 MB" kind="document" state="analyzing" progress={85} />
            <FileStateRow name="notes.md" meta="12 KB" kind="document" state="failed" onRetry={() => {}} />
            <FileStateRow name="standup-aug-4.m4a" meta="9 min" kind="audio" state="completed" />
          </div>
        </div>
      </div>
    </Section>
  );
}
