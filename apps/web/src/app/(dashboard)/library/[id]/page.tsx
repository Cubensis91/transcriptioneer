"use client";

import {
  Badge,
  Card,
  CardContent,
  EmptyState,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@transcriptioneer/ui";
import { ArrowLeft, CalendarDays, CheckSquare, HelpCircle, Lightbulb } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BulletedList } from "@/components/ai-results/bulleted-list";
import { EntityList } from "@/components/ai-results/entity-list";
import { QuotesList } from "@/components/ai-results/quotes-list";
import { SummaryBlock } from "@/components/ai-results/summary-block";
import { PanelChromeHeader } from "@/components/chrome/panel-chrome-header";
import { TopNav } from "@/components/navigation/top-nav";
import {
  mockFacts,
  mockImportantDates,
  mockPeople,
  mockQuestions,
  mockQuotes,
  mockTasks,
  mockTopics,
  type MockDocument,
} from "@/lib/mock-data";
import { libraryService } from "@/lib/services/library-service";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const [document, setDocument] = useState<MockDocument | null | undefined>(undefined);

  useEffect(() => {
    libraryService.getDocument(params.id).then(setDocument);
  }, [params.id]);

  if (document === null) notFound();

  return (
    <>
      <TopNav />
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 pb-24 sm:px-8 lg:pb-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <Link
            href="/library"
            className="flex w-fit items-center gap-1.5 text-sm text-text-muted hover:text-text"
          >
            <ArrowLeft className="size-4" aria-hidden /> Volver a la biblioteca
          </Link>

          {!document ? (
            <div className="h-64 animate-pulse rounded-lg bg-surface-raised" aria-hidden />
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h1 className="font-display text-2xl font-medium text-text">{document.title}</h1>
                <p className="text-sm text-text-subtle">
                  {document.durationOrPages} · {document.updatedAt} ·{" "}
                  <Badge variant="accent">{document.project}</Badge>
                </p>
              </div>

              <Tabs defaultValue="summary">
                <TabsList>
                  <TabsTrigger value="summary">Resumen</TabsTrigger>
                  <TabsTrigger value="transcript">Transcripción</TabsTrigger>
                  <TabsTrigger value="ideas">Ideas y entidades</TabsTrigger>
                  <TabsTrigger value="connections">Conexiones</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                  <Card>
                    <PanelChromeHeader title="Lo que entendí" />
                    <CardContent className="pt-5">
                      {document.summary ? (
                        <SummaryBlock
                          summary={document.summary}
                          detailedSummary="El resumen detallado completo se leerá como el resumen de un colega: cada afirmación se podrá rastrear hasta una marca de tiempo o página de la fuente, no será una paráfrasis genérica."
                        />
                      ) : (
                        <EmptyState
                          title="Aún en proceso"
                          description="El resumen aparecerá aquí en cuanto este documento termine de analizarse."
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transcript">
                  <Card>
                    <PanelChromeHeader title="Transcripción" />
                    <CardContent className="flex flex-col gap-3 pt-5 text-sm leading-relaxed text-text-muted">
                      <p>
                        <span className="font-medium text-text">[00:00]</span> Este es un segmento de
                        transcripción de marcador de posición — cuando llegue el Hito 5, esta pestaña
                        mostrará la salida real de Whisper, con segmentos por hablante y marcas de tiempo
                        en las que podrás hacer clic para saltar.
                      </p>
                      <p>
                        <span className="font-medium text-text">[00:14]</span> Hasta entonces, la forma
                        de esta vista es definitiva; solo cambiará el origen del texto.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ideas">
                  <Card>
                    <PanelChromeHeader title="Extraído" />
                    <CardContent className="flex flex-col gap-6 pt-5">
                      <EntityList label="Personas" items={mockPeople.map((p) => p.name)} variant="accent" />
                      <EntityList label="Temas" items={mockTopics.map((t) => t.name)} />
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">
                          Tareas
                        </p>
                        <BulletedList icon={CheckSquare} items={mockTasks.map((t) => t.title)} />
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">
                          Preguntas abiertas
                        </p>
                        <BulletedList icon={HelpCircle} items={mockQuestions} />
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">
                          Datos
                        </p>
                        <BulletedList icon={Lightbulb} items={mockFacts} />
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">
                          Fechas
                        </p>
                        <BulletedList icon={CalendarDays} items={mockImportantDates} />
                      </div>
                      <QuotesList quotes={mockQuotes} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="connections">
                  <Card>
                    <PanelChromeHeader title="Conectado en otros lugares" />
                    <CardContent className="pt-5">
                      <EmptyState
                        title="El grafo completo llegará a esta pestaña"
                        description="Consulta la página de Conexiones para ver cómo este documento se vincula con personas, temas y otros archivos de tu base de conocimiento."
                        action={
                          <Link
                            href="/connections"
                            className="text-sm font-medium text-accent hover:underline"
                          >
                            Abrir Conexiones →
                          </Link>
                        }
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </>
  );
}
