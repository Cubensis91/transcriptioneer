import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@transcriptioneer/ui";
import { AiInsightCard } from "@/components/cards/ai-insight-card";
import { Section, SubLabel } from "./section";

function ThemePreview({ forced }: { forced: "light" | "dark" }) {
  return (
    <div className={forced === "dark" ? "dark" : "light"}>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-5">
        <Card>
          <CardHeader>
            <CardTitle>Vendor security questionnaire</CardTitle>
            <CardDescription>18 pages · analyzing</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-text-muted">Extracted clauses on data residency are pending classification.</p>
            <Badge variant="accent">Procurement</Badge>
          </CardContent>
        </Card>
        <AiInsightCard
          title="Retrieval quality is the recurring theme."
          body="Mentioned in 4 of 6 recordings this month."
        />
        <Button variant="primary" className="w-fit">
          Primary action
        </Button>
      </div>
    </div>
  );
}

export function ThemeSection() {
  return (
    <Section
      id="theme"
      title="Light and dark mode"
      description="Dark mode remaps semantic roles to different steps of the same scales (surfaces get lighter than the page background in both modes, just via different mechanisms) rather than inverting hex values — see the comment in packages/ui/src/tokens.css. Use the toggle in the top navigation above to switch the whole page; both variants are forced below for side-by-side comparison regardless of the page's current theme."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <SubLabel>Light</SubLabel>
          <ThemePreview forced="light" />
        </div>
        <div>
          <SubLabel>Dark</SubLabel>
          <ThemePreview forced="dark" />
        </div>
      </div>
    </Section>
  );
}
