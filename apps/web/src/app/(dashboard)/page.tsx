"use client";

import { ApiClientError, createApiClient } from "@transcriptioneer/api-client";
import type { HealthStatus } from "@transcriptioneer/types";
import { Avatar, Card, CardContent, ThemeToggleButton, cn, toast } from "@transcriptioneer/ui";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { DocumentCard } from "@/components/cards/document-card";
import { PanelChromeHeader } from "@/components/chrome/panel-chrome-header";
import { ProcessStepper } from "@/components/dashboard/process-stepper";
import { QuickInsightsPanel } from "@/components/dashboard/quick-insights-panel";
import { processingStageToVisualState } from "@/components/file-state/file-state-meta";
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

async function handleFilesSelected(files: FileList) {
  for (const file of Array.from(files)) {
    try {
      await filesService.uploadFile(file);
      toast({ title: "Archivo recibido", description: `${file.name} se subió correctamente.`, variant: "success" });
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
          onFilesSelected={(files) => void handleFilesSelected(files)}
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
