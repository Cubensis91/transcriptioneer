import { ProcessStepper } from "@/components/dashboard/process-stepper";
import { QuickInsightsPanel } from "@/components/dashboard/quick-insights-panel";
import { FileTypeIndicator } from "@/components/upload/file-type-indicator";
import { IntakeThreshold } from "@/components/upload/intake-threshold";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { UploadQueueItem } from "@/components/upload/upload-queue-item";
import { mockUploadQueue } from "@/lib/mock-data";
import { Section, SubLabel } from "./section";

export function UploadSection() {
  return (
    <Section id="upload" title="Upload experience">
      <div className="flex flex-col gap-8">
        <div>
          <SubLabel>Intake threshold (dashboard hero)</SubLabel>
          <IntakeThreshold />
        </div>

        <div>
          <SubLabel>Process stepper</SubLabel>
          <div className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-6">
            <ProcessStepper currentState="transcribing" kind="audio" />
            <ProcessStepper currentState="extracting" kind="document" />
            <ProcessStepper currentState="completed" />
            <ProcessStepper currentState="failed" />
          </div>
        </div>

        <div>
          <SubLabel>Quick insights panel</SubLabel>
          <QuickInsightsPanel className="max-w-sm" />
        </div>

        <div>
          <SubLabel>Drag and drop (compact)</SubLabel>
          <UploadDropzone />
        </div>

        <div>
          <SubLabel>File type indicators</SubLabel>
          <div className="flex flex-wrap gap-2">
            <FileTypeIndicator kind="audio" />
            <FileTypeIndicator kind="pdf" />
            <FileTypeIndicator kind="docx" />
            <FileTypeIndicator kind="txt" />
            <FileTypeIndicator kind="md" />
          </div>
        </div>

        <div>
          <SubLabel>Upload queue</SubLabel>
          <div className="flex flex-col gap-2">
            {mockUploadQueue.map((item) => (
              <UploadQueueItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
