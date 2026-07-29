import { CircleHelp, Lightbulb } from "lucide-react";
import { BulletedList } from "@/components/ai-results/bulleted-list";
import { EntityList } from "@/components/ai-results/entity-list";
import { QuotesList } from "@/components/ai-results/quotes-list";
import { SummaryBlock } from "@/components/ai-results/summary-block";
import { DecisionCard } from "@/components/cards/decision-card";
import { TaskCard } from "@/components/cards/task-card";
import {
  mockDecisions,
  mockFacts,
  mockImportantDates,
  mockKeywords,
  mockLocations,
  mockOrganizations,
  mockQuestions,
  mockQuotes,
  mockTags,
  mockTasks,
  mockTopics,
} from "@/lib/mock-data";
import { Section, SubLabel } from "./section";

export function AiResultsSection() {
  return (
    <Section
      id="ai-results"
      title="AI result components"
      description="Presentation components for structured AI analysis output (see ARCHITECTURE.md §6 for the underlying schema). Mock data only — not connected to the pipeline yet."
    >
      <div className="flex flex-col gap-8">
        <div>
          <SubLabel>Summary</SubLabel>
          <SummaryBlock
            summary="The team committed to shipping retrieval on pgvector before evaluating a dedicated vector store."
            detailedSummary="Elena opened with a review of last sprint's retrieval benchmarks. The group agreed pgvector is sufficient for the current scale and that introducing a dedicated vector database now would be premature optimization. Juan raised a concern about query latency at 10x scale, which the team logged as an open question rather than a blocker."
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <EntityList label="Topics" items={mockTopics.map((t) => t.name)} variant="accent" />
          <EntityList label="Keywords" items={mockKeywords} />
          <EntityList label="Organizations" items={mockOrganizations} />
          <EntityList label="Locations" items={mockLocations} />
          <EntityList label="Dates" items={mockImportantDates} />
          <EntityList label="Tags" items={mockTags} variant="info" />
        </div>

        <div>
          <SubLabel>Decisions</SubLabel>
          <div className="flex flex-col gap-2">
            {mockDecisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        </div>

        <div>
          <SubLabel>Tasks</SubLabel>
          <div className="flex flex-col gap-2">
            {mockTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div>
          <SubLabel>Questions</SubLabel>
          <BulletedList icon={CircleHelp} items={mockQuestions} />
        </div>

        <div>
          <SubLabel>Important facts</SubLabel>
          <BulletedList icon={Lightbulb} items={mockFacts} />
        </div>

        <div>
          <SubLabel>Important quotes</SubLabel>
          <QuotesList quotes={mockQuotes} />
        </div>
      </div>
    </Section>
  );
}
