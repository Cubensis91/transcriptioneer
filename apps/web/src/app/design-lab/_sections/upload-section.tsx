import { FileTypeIndicator } from "@/components/upload/file-type-indicator";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { UploadQueueItem } from "@/components/upload/upload-queue-item";
import { mockUploadQueue } from "@/lib/mock-data";
import { Section, SubLabel } from "./section";

export function UploadSection() {
  return (
    <Section id="upload" title="Upload experience">
      <div className="flex flex-col gap-8">
        <div>
          <SubLabel>Drag and drop</SubLabel>
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
