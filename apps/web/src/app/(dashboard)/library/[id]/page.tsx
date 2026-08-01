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
            <ArrowLeft className="size-4" aria-hidden /> Back to Library
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
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="ideas">Ideas &amp; entities</TabsTrigger>
                  <TabsTrigger value="connections">Connections</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                  <Card>
                    <PanelChromeHeader title="What I understood" />
                    <CardContent className="pt-5">
                      {document.summary ? (
                        <SummaryBlock
                          summary={document.summary}
                          detailedSummary="Full detailed summary will read like a colleague's recap — every claim traceable back to a timestamp or page in the source, not a generic paraphrase."
                        />
                      ) : (
                        <EmptyState
                          title="Still processing"
                          description="The summary will appear here as soon as this document finishes analysis."
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transcript">
                  <Card>
                    <PanelChromeHeader title="Transcript" />
                    <CardContent className="flex flex-col gap-3 pt-5 text-sm leading-relaxed text-text-muted">
                      <p>
                        <span className="font-medium text-text">[00:00]</span> This is a placeholder
                        transcript segment — once Milestone 5 lands, this tab reads real Whisper output
                        with per-speaker segments and timestamps you can click to seek.
                      </p>
                      <p>
                        <span className="font-medium text-text">[00:14]</span> Until then, the shape of
                        this view is final; only the source of the text changes.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ideas">
                  <Card>
                    <PanelChromeHeader title="Extracted" />
                    <CardContent className="flex flex-col gap-6 pt-5">
                      <EntityList label="People" items={mockPeople.map((p) => p.name)} variant="accent" />
                      <EntityList label="Topics" items={mockTopics.map((t) => t.name)} />
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">
                          Tasks
                        </p>
                        <BulletedList icon={CheckSquare} items={mockTasks.map((t) => t.title)} />
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">
                          Open questions
                        </p>
                        <BulletedList icon={HelpCircle} items={mockQuestions} />
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">
                          Facts
                        </p>
                        <BulletedList icon={Lightbulb} items={mockFacts} />
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-subtle">
                          Dates
                        </p>
                        <BulletedList icon={CalendarDays} items={mockImportantDates} />
                      </div>
                      <QuotesList quotes={mockQuotes} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="connections">
                  <Card>
                    <PanelChromeHeader title="Connected elsewhere" />
                    <CardContent className="pt-5">
                      <EmptyState
                        title="Full graph coming to this tab"
                        description="See the Connections page for how this document links to people, topics, and other files across your knowledge base."
                        action={
                          <Link
                            href="/connections"
                            className="text-sm font-medium text-accent hover:underline"
                          >
                            Open Connections →
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
