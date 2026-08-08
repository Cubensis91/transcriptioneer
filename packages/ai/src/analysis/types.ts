import { z } from "zod";

// OpenAI's Structured Outputs mode (used by OpenAiAnalysisService) requires
// every object property to be present in `required` — optional fields are
// expressed as `.nullable()`, not `.optional()`, so every field below is
// nullable rather than optional where the model might have nothing to say.

export const knowledgeItemSchema = z.object({
  title: z.string().describe("A short, specific title for this piece of content (not a generic label like 'Transcript')."),
  summary: z.string().describe("A 2-3 sentence summary a reader could act on without reading the full text."),
  detailedSummary: z
    .string()
    .describe("Several paragraphs organizing the full content clearly — the 'ideal order' a knowledge worker would want, not a restatement of the transcript in the same order it was spoken."),
  topics: z.array(z.string()).describe("Broad subject areas this content is about, reusable across other documents (e.g. 'Roman history', 'product roadmap')."),
  keywords: z.array(z.string()).describe("Specific, searchable terms mentioned (proper nouns, technical terms)."),
  tags: z.array(z.string()).describe("Short freeform labels useful for organizing this alongside other content."),
  people: z.array(
    z.object({
      name: z.string(),
      context: z.string().nullable().describe("Brief note on who they are or why they were mentioned, or null if there's nothing beyond the name."),
    }),
  ),
  organizations: z.array(
    z.object({
      name: z.string(),
      context: z.string().nullable(),
    }),
  ),
  locations: z.array(
    z.object({
      name: z.string(),
      context: z.string().nullable(),
    }),
  ),
  eventDates: z.array(
    z.object({
      label: z.string().describe("What the date refers to (e.g. 'Product launch', 'Assassination of Julio César')."),
      rawText: z.string().describe("The date exactly as expressed in the content (e.g. 'next Thursday', '15 de marzo del año 44 antes de Cristo')."),
      isoDate: z
        .string()
        .nullable()
        .describe("ISO 8601 date (YYYY-MM-DD) only if it can be confidently resolved to a real calendar date within a normal DATETIME range; null for relative, ambiguous, or ancient/out-of-range dates."),
    }),
  ),
  decisions: z.array(z.string()).describe("Decisions stated as having been made."),
  tasks: z.array(
    z.object({
      text: z.string(),
      assignee: z.string().nullable(),
    }),
  ).describe("Concrete action items or things someone said they would do."),
  questions: z.array(z.string()).describe("Open questions raised but not answered."),
  openIssues: z.array(z.string()).describe("Problems or concerns raised without a stated resolution."),
  facts: z.array(z.string()).describe("Standalone factual claims worth surfacing on their own."),
  quotes: z.array(
    z.object({
      text: z.string(),
      speaker: z.string().nullable(),
    }),
  ).describe("Verbatim, notable lines worth quoting directly."),
});

export type AnalysisResult = z.infer<typeof knowledgeItemSchema>;

/** Implemented today by OpenAiAnalysisService; the interface exists so a
 * future non-OpenAI provider is a new class satisfying the same contract,
 * same reasoning as TranscriptionProvider (WHISPER_SETUP.md). */
export interface AnalysisProvider {
  analyze(transcriptText: string, language: string | null): Promise<AnalysisResult>;
}
