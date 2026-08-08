"use client";

import { ApiClientError, createApiClient } from "@transcriptioneer/api-client";
import type { HealthStatus, KnowledgeItem } from "@transcriptioneer/types";
import { Avatar, Card, CardContent, ThemeToggleButton, cn, toast } from "@transcriptioneer/ui";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { DocumentCard } from "@/components/cards/document-card";
import { PanelChromeHeader } from "@/components/chrome/panel-chrome-header";
import { ProcessStepper } from "@/components/dashboard/process-stepper";
import { QuickInsightsPanel } from "@/components/dashboard/quick-insights-panel";
import { processingStageToVisualState } from "@/components/file-state/file-state-meta";
import { KnowledgeItemDialog } from "@/components/knowledge/knowledge-item-dialog";
import { NotificationsButton } from "@/components/navigation/notifications-button";
import { IntakeThreshold } from "@/components/upload/intake-threshold";
import { filesService } from "@/lib/services/files-service";
import { mockDocuments } from "@/lib/mock-data";

const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
});

// A representative in-flight upload for the "what I'm doing right now"
// panel — this is UI/mock only, the same fixture /design-lab already uses,
// not a real processing job (no backend wiring exists yet).
const inFlightDocument = mockDocuments.find((doc) => doc.id === "doc-4") ?? mockDocuments[0];

function ApiStatusDot() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .request<HealthStatus>("/health")
      .then(setHealth)
      .catch((err: unknown) => {
        setError(err instanceof ApiClientError ? err.message : "API no disponible");
      });
  }, []);

  const title = error ? `API no disponible — ${error}` : health ? `${health.status} · ${health.service}` : "verificando…";

  return (
    <span
      role="status"
      title={title}
      aria-label={title}
      className={cn(
        "size-2 shrink-0 rounded-full",
        error ? "bg-error" : health ? "bg-success" : "animate-pulse bg-text-subtle",
      )}
    />
  );
}

const TRANSCRIPTION_POLL_INTERVAL_MS = 4000;
// Whisper's "base" model runs ~2.7x realtime on the VPS's 1 vCPU
// (WHISPER_SETUP.md) — a 30-minute recording can take over an hour. This
// is a ceiling on *watching*, not on the job itself, which keeps running
// either way; the transcript is picked up next time /library polls it
// (Milestone 8+) even if this tab gives up first.
const TRANSCRIPTION_POLL_TIMEOUT_MS = 10 * 60 * 1000;

// COMPLETED now means the *whole* pipeline finished, not just transcription
// (ARCHITECTURE.md §6: transcribing → analyzing → completed) — the job
// stays QUEUED/TRANSCRIBING/ANALYZING while aiAnalysisService runs.
async function pollForAnalysis(
  fileId: string,
  filename: string,
  onReady: (item: KnowledgeItem) => void,
) {
  const deadline = Date.now() + TRANSCRIPTION_POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, TRANSCRIPTION_POLL_INTERVAL_MS));

    const job = await filesService.getJob(fileId).catch(() => null);
    if (!job) return; // not an audio/video file, or the job vanished

    if (job.stage === "COMPLETED") {
      const item = await filesService.getKnowledgeItem(fileId).catch(() => null);
      if (item) {
        toast({ title: `Listo: ${filename}`, description: item.summary, variant: "success" });
        onReady(item);
      } else {
        toast({ title: `Procesado: ${filename}`, description: "Lista para revisar.", variant: "success" });
      }
      return;
    }
    if (job.stage === "FAILED") {
      toast({
        title: `No se pudo procesar ${filename}`,
        description: job.errorMessage ?? "Error desconocido.",
        variant: "error",
      });
      return;
    }
    // QUEUED, TRANSCRIBING, or ANALYZING — keep polling.
  }
}

async function handleFilesSelected(
  files: FileList,
  onAnalyzed: (filename: string, item: KnowledgeItem) => void,
) {
  for (const file of Array.from(files)) {
    try {
      const sourceFile = await filesService.uploadFile(file);
      toast({ title: "Archivo recibido", description: `${file.name} se subió correctamente.`, variant: "success" });
      void pollForAnalysis(sourceFile.id, file.name, (item) => onAnalyzed(file.name, item));
    } catch (err) {
      toast({
        title: "No se pudo subir el archivo",
        description: err instanceof ApiClientError ? err.message : `${file.name} no se pudo subir.`,
        variant: "error",
      });
    }
  }
}

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [analyzedFile, setAnalyzedFile] = useState<{ filename: string; item: KnowledgeItem } | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <>
      <header className="flex items-center gap-4 px-4 py-4 sm:px-8">
        <div className="lg:hidden">
          <BrandLockup />
        </div>
        <div className="hidden flex-1 flex-col items-center lg:flex">
          <p className="font-display text-lg font-medium text-text">Entiende. Conecta. Recuerda.</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <ApiStatusDot />
          <NotificationsButton />
          <ThemeToggleButton isDark={isDark} onClick={() => setTheme(isDark ? "light" : "dark")} />
          <Avatar name="Elena Marsh" size="sm" />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pb-24 sm:px-8 lg:pb-8">
        <IntakeThreshold
          size="hero"
          className="mx-auto w-full max-w-3xl"
          onFilesSelected={(files) =>
            void handleFilesSelected(files, (filename, item) => setAnalyzedFile({ filename, item }))
          }
        />

        <KnowledgeItemDialog
          item={analyzedFile?.item ?? null}
          filename={analyzedFile?.filename ?? ""}
          open={analyzedFile !== null}
          onOpenChange={(open) => {
            if (!open) setAnalyzedFile(null);
          }}
        />

        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="flex flex-col gap-6">
            <Card className="overflow-hidden">
              <PanelChromeHeader title="Ahora mismo" />
              <CardContent className="pt-5">
                <ProcessStepper
                  currentState={processingStageToVisualState(inFlightDocument.stage)}
                  kind={inFlightDocument.kind === "audio" ? "audio" : "document"}
                />
              </CardContent>
            </Card>

            <div>
              <h2 className="mb-3 font-display text-lg font-medium text-text">Recientemente confiado a mí</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {mockDocuments.map((document) => (
                  <DocumentCard key={document.id} document={document} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <QuickInsightsPanel />
          </div>
        </div>
      </main>
    </>
  );
}
