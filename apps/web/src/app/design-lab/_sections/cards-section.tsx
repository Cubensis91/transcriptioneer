import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@transcriptioneer/ui";
import { AiInsightCard } from "@/components/cards/ai-insight-card";
import { AudioCard } from "@/components/cards/audio-card";
import { DecisionCard } from "@/components/cards/decision-card";
import { DocumentCard } from "@/components/cards/document-card";
import { PersonCard } from "@/components/cards/person-card";
import { TaskCard } from "@/components/cards/task-card";
import { TopicCard } from "@/components/cards/topic-card";
import { mockDecisions, mockDocuments, mockPeople, mockTasks, mockTopics } from "@/lib/mock-data";
import { Section, SubLabel } from "./section";

export function CardsSection() {
  const maxTopicCount = Math.max(...mockTopics.map((t) => t.count));

  return (
    <Section id="cards" title="Cards">
      <div className="flex flex-col gap-8">
        <div>
          <SubLabel>Basic card</SubLabel>
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>Weekly digest</CardTitle>
              <CardDescription>Summarizes everything captured across your projects.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-muted">Delivered every Monday at 9:00 AM.</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <SubLabel>Document card</SubLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            {mockDocuments.slice(0, 2).map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>

        <div>
          <SubLabel>Audio card</SubLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <AudioCard title="Q3 roadmap sync" duration="34 min" updatedAt="2h ago" state="completed" />
            <AudioCard title="Standup — August 4" duration="9 min" updatedAt="3m ago" state="transcribing" />
          </div>
        </div>

        <div>
          <SubLabel>Task card</SubLabel>
          <div className="flex flex-col gap-2">
            {mockTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>

        <div>
          <SubLabel>Decision card</SubLabel>
          <div className="flex flex-col gap-2">
            {mockDecisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        </div>

        <div>
          <SubLabel>Person card</SubLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {mockPeople.map((person) => (
              <PersonCard key={person.name} person={person} />
            ))}
          </div>
        </div>

        <div>
          <SubLabel>Topic card</SubLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {mockTopics.map((topic) => (
              <TopicCard key={topic.name} topic={topic} maxCount={maxTopicCount} />
            ))}
          </div>
        </div>

        <div>
          <SubLabel>AI insight card</SubLabel>
          <AiInsightCard
            title="Retrieval quality is the recurring theme across the last 6 meetings."
            body="Mentioned in 4 of 6 recordings this month, usually alongside pgvector and chunking strategy."
          />
        </div>
      </div>
    </Section>
  );
}
