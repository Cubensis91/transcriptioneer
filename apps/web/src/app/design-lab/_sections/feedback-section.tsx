"use client";

import { Alert, Button, EmptyState, Skeleton, Spinner, toast } from "@transcriptioneer/ui";
import { Inbox } from "lucide-react";
import { Section, SubLabel } from "./section";

export function FeedbackSection() {
  return (
    <Section id="feedback" title="Feedback">
      <div className="flex flex-col gap-8">
        <div>
          <SubLabel>Toasts</SubLabel>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast({ title: "Upload complete", description: "board-meeting.m4a is ready.", variant: "success" })}
            >
              Trigger success
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast({ title: "Slow connection", description: "Upload may take longer than usual.", variant: "warning" })}
            >
              Trigger warning
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast({ title: "Upload failed", description: "notes.md could not be processed.", variant: "error" })}
            >
              Trigger error
            </Button>
          </div>
        </div>

        <div>
          <SubLabel>Alerts</SubLabel>
          <div className="flex flex-col gap-3">
            <Alert variant="info" title="Heads up">
              Transcription for long recordings can take a few minutes.
            </Alert>
            <Alert variant="success" title="Processing complete">
              Your document has been fully analyzed and indexed.
            </Alert>
            <Alert variant="warning" title="Storage nearing limit">
              You&apos;ve used 85% of your workspace storage.
            </Alert>
            <Alert variant="error" title="Upload failed">
              We couldn&apos;t read this file. Try re-exporting it and uploading again.
            </Alert>
          </div>
        </div>

        <div>
          <SubLabel>Loading</SubLabel>
          <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </div>

        <div>
          <SubLabel>Skeleton</SubLabel>
          <div className="flex max-w-sm flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        <div>
          <SubLabel>Empty state</SubLabel>
          <EmptyState
            icon={<Inbox className="size-8" />}
            title="No documents yet"
            description="Upload your first recording or document to see it processed here."
            action={<Button size="sm">Upload a file</Button>}
          />
        </div>
      </div>
    </Section>
  );
}
