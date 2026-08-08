import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { AnalysisProvider, AnalysisResult } from "./types";
import { knowledgeItemSchema } from "./types";

// Transcriptioneer's "ideal order" for a piece of content — not a rewrite of
// the transcript, a reorganization of it into the categories the product is
// built around (ARCHITECTURE.md §4's KnowledgeItem shape). Written to be
// language-agnostic: the model is told explicitly to answer in the source
// language rather than defaulting to English.
const SYSTEM_PROMPT = `Eres el motor de análisis de Transcriptioneer, un organizador de conocimiento con IA. Tu trabajo es leer una transcripción cruda y reorganizarla según el orden ideal de la marca: no repites el contenido en el mismo orden en que fue dicho, lo reestructuras en categorías claras y útiles.

Reglas:
- Responde SIEMPRE en el mismo idioma que la transcripción original.
- No inventes información que no esté presente, ni explícita ni implícitamente, en la transcripción.
- Si una categoría no tiene contenido real, devuelve un array vacío — nunca inventes algo para llenarlo.
- "summary" son 2-3 frases que alguien podría leer y actuar sin leer el resto.
- "detailedSummary" son varios párrafos que organizan el contenido completo con claridad, agrupando ideas relacionadas aunque no hayan sido dichas juntas en el original.
- Distingue con cuidado entre decisiones (algo que ya se decidió), tareas (algo que alguien dijo que va a hacer), preguntas (algo que quedó sin responder) y problemas abiertos (una preocupación planteada sin resolución).
- Las citas ("quotes") deben ser textuales, no parafraseadas.`;

export type OpenAiAnalysisConfig = {
  apiKey: string;
  /** "gpt-4o-mini" by default — cheap enough to run on every transcript;
   * override via OPENAI_MODEL for a higher-accuracy model if needed. */
  model: string;
};

/** Single structured-output call against a Zod-validated schema matching the
 * KnowledgeItem shape (ARCHITECTURE.md §6). Invalid/refused output gets one
 * bounded retry with the failure reason fed back to the model before
 * failing for good — same "one bounded retry" contract documented in
 * ARCHITECTURE.md §6 and PROJECT_STATUS.md's Milestone 6 plan. */
export class OpenAiAnalysisService implements AnalysisProvider {
  private readonly client: OpenAI;

  constructor(private readonly config: OpenAiAnalysisConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  analyze(transcriptText: string, language: string | null): Promise<AnalysisResult> {
    return this.attempt(transcriptText, language, null);
  }

  private async attempt(
    transcriptText: string,
    language: string | null,
    priorFailureReason: string | null,
  ): Promise<AnalysisResult> {
    const userContent = priorFailureReason
      ? `El intento anterior no cumplió el formato requerido (${priorFailureReason}). Intenta de nuevo, respetando exactamente el schema.\n\nIdioma detectado de la transcripción: ${language ?? "desconocido"}.\n\nTranscripción:\n\n${transcriptText}`
      : `Idioma detectado de la transcripción: ${language ?? "desconocido"}.\n\nTranscripción:\n\n${transcriptText}`;

    const completion = await this.client.beta.chat.completions.parse({
      model: this.config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: zodResponseFormat(knowledgeItemSchema, "knowledge_item"),
    });

    const choice = completion.choices[0];
    const parsed = choice?.message.parsed;
    if (!parsed) {
      const reason = choice?.message.refusal ?? "The model did not return a parseable result.";
      if (priorFailureReason) {
        throw new Error(`AI analysis failed after one retry: ${reason}`);
      }
      return this.attempt(transcriptText, language, reason);
    }
    return parsed;
  }
}
