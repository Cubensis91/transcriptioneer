import { Section, SubLabel } from "./section";

export function TypographySection() {
  return (
    <Section
      id="typography"
      title="Typography"
      description="Fraunces (a warm, editorial serif with optical sizing) for display and headings; Geist Sans for UI and body copy; Geist Mono for data and code. The pairing is meant to read as calm and considered rather than another all-grotesk AI dashboard."
    >
      <div className="flex flex-col gap-6">
        <div>
          <SubLabel>Display</SubLabel>
          <p className="font-display text-5xl font-medium tracking-tight text-text">
            Your second brain, organized
          </p>
        </div>
        <div>
          <SubLabel>Heading 1</SubLabel>
          <h1 className="font-display text-4xl font-medium tracking-tight text-text">
            Structured knowledge from every recording
          </h1>
        </div>
        <div>
          <SubLabel>Heading 2</SubLabel>
          <h2 className="font-display text-2xl font-medium tracking-tight text-text">
            Decisions, tasks, and topics — extracted automatically
          </h2>
        </div>
        <div>
          <SubLabel>Heading 3</SubLabel>
          <h3 className="text-xl font-semibold text-text">Recent activity</h3>
        </div>
        <div>
          <SubLabel>Heading 4</SubLabel>
          <h4 className="text-base font-semibold text-text">Vendor security questionnaire</h4>
        </div>
        <div>
          <SubLabel>Body</SubLabel>
          <p className="max-w-2xl text-base leading-relaxed text-text">
            Upload a recording or a document and Transcriptioneer turns it into structured,
            searchable knowledge — summaries, decisions, tasks, and the people and topics
            involved — so you can ask questions across everything you have captured.
          </p>
        </div>
        <div>
          <SubLabel>Small</SubLabel>
          <p className="text-sm text-text-muted">
            Processed 3 minutes ago · 9 min audio · Respira project
          </p>
        </div>
        <div>
          <SubLabel>Label</SubLabel>
          <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
            Key topics
          </p>
        </div>
        <div>
          <SubLabel>Caption</SubLabel>
          <p className="text-xs text-text-subtle">Transcribed with speaker detection enabled.</p>
        </div>
        <div>
          <SubLabel>Monospace</SubLabel>
          <code className="rounded bg-surface-raised px-2 py-1 font-mono text-sm text-text">
            DATABASE_URL, doc_4f9a2c, 00:09:32
          </code>
        </div>
      </div>
    </Section>
  );
}
