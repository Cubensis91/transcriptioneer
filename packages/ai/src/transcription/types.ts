export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type TranscriptionResult = {
  text: string;
  language: string | null;
  segments: TranscriptSegment[];
};

/** Implemented today by LocalWhisperProvider; the interface exists so a
 * future OpenAI/Gemini/Deepgram provider is a new class satisfying the
 * same contract, not a rewrite of every caller (WHISPER_SETUP.md). */
export interface TranscriptionProvider {
  transcribe(filePath: string): Promise<TranscriptionResult>;
}
