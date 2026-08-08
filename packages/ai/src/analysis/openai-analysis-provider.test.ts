import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnalysisResult } from "./types";

const parseMock = vi.fn();

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    beta: { chat: { completions: { parse: parseMock } } },
  })),
}));

vi.mock("openai/helpers/zod", () => ({
  zodResponseFormat: vi.fn().mockReturnValue({ type: "json_schema" }),
}));

import { OpenAiAnalysisService } from "./openai-analysis-provider";

const CONFIG = { apiKey: "sk-test", model: "gpt-4o-mini" };

const RESULT: AnalysisResult = {
  title: "Julio César y su asesinato",
  summary: "Resumen breve.",
  detailedSummary: "Resumen detallado en varios párrafos.",
  topics: ["Historia romana"],
  keywords: ["Julio César", "Senado"],
  tags: ["historia"],
  people: [{ name: "Julio César", context: "Dictador de Roma, asesinado en el 44 a.C." }],
  organizations: [{ name: "Senado romano", context: null }],
  locations: [{ name: "Teatro de Pompeyo", context: null }],
  eventDates: [{ label: "Asesinato de César", rawText: "15 de marzo del año 44 antes de Cristo", isoDate: null }],
  decisions: [],
  tasks: [],
  questions: [],
  openIssues: [],
  facts: ["César recibió múltiples puñaladas."],
  quotes: [{ text: "y salió de ahí muerto.", speaker: null }],
};

function successResponse(result: AnalysisResult) {
  return { choices: [{ message: { parsed: result, refusal: null } }] };
}

function refusalResponse(refusal: string) {
  return { choices: [{ message: { parsed: null, refusal } }] };
}

describe("OpenAiAnalysisService", () => {
  beforeEach(() => {
    parseMock.mockReset();
  });

  it("returns the parsed result on the first successful call", async () => {
    parseMock.mockResolvedValue(successResponse(RESULT));
    const service = new OpenAiAnalysisService(CONFIG);

    await expect(service.analyze("transcript text", "es")).resolves.toEqual(RESULT);
    expect(parseMock).toHaveBeenCalledTimes(1);
  });

  it("retries once with the failure reason fed back, then succeeds", async () => {
    parseMock
      .mockResolvedValueOnce(refusalResponse("didn't match schema"))
      .mockResolvedValueOnce(successResponse(RESULT));
    const service = new OpenAiAnalysisService(CONFIG);

    await expect(service.analyze("transcript text", "es")).resolves.toEqual(RESULT);
    expect(parseMock).toHaveBeenCalledTimes(2);

    const retryCallArgs = parseMock.mock.calls[1]?.[0] as {
      messages: Array<{ role: string; content: string }>;
    };
    expect(retryCallArgs.messages[1]?.content).toContain("didn't match schema");
  });

  it("throws after a second failed attempt instead of retrying indefinitely", async () => {
    parseMock.mockResolvedValue(refusalResponse("still invalid"));
    const service = new OpenAiAnalysisService(CONFIG);

    await expect(service.analyze("transcript text", null)).rejects.toThrow(/still invalid/);
    expect(parseMock).toHaveBeenCalledTimes(2);
  });
});
