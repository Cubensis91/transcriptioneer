/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/unbound-method --
   this file wires an untyped Jest mock of the Prisma client (the real client is fully
   typed), and passes jest.fn() mock methods to expect(...).toHaveBeenCalledWith(...),
   which the unbound-method rule can't distinguish from a real unbound method reference. */
jest.mock("@transcriptioneer/database", () => {
  const prisma: any = {
    transcript: { findUnique: jest.fn() },
    knowledgeItem: { create: jest.fn().mockResolvedValue(undefined) },
    processingJob: { update: jest.fn() },
  };
  return { prisma };
});

import { prisma } from "@transcriptioneer/database";
import type { AnalysisProvider, AnalysisResult } from "@transcriptioneer/ai";
import type { Job } from "bullmq";
import { AnalysisProcessor } from "./analysis.processor";

const SOURCE_FILE_ID = "file-1";
const ORG_ID = "org-1";

const TRANSCRIPT = {
  sourceFileId: SOURCE_FILE_ID,
  text: "Ehh... y Julio César murió apuñalado.",
  language: "es",
  sourceFile: { organizationId: ORG_ID },
};

const RESULT: AnalysisResult = {
  title: "Julio César y su asesinato",
  summary: "Resumen breve.",
  detailedSummary: "Resumen detallado.",
  topics: ["Historia romana"],
  keywords: ["Julio César"],
  tags: [],
  people: [{ name: "Julio César", context: "Dictador de Roma." }],
  organizations: [],
  locations: [],
  eventDates: [{ label: "Asesinato de César", rawText: "15 de marzo del 44 a.C.", isoDate: null }],
  decisions: [],
  tasks: [],
  questions: [],
  openIssues: [],
  facts: [],
  quotes: [],
};

function makeJob(): Job<{ sourceFileId: string }> {
  return { data: { sourceFileId: SOURCE_FILE_ID } } as Job<{ sourceFileId: string }>;
}

describe("AnalysisProcessor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.transcript.findUnique as jest.Mock).mockResolvedValue(TRANSCRIPT);
    (prisma.knowledgeItem.create as jest.Mock).mockResolvedValue(undefined);
  });

  it("analyzes the transcript, persists a KnowledgeItem, and marks the job COMPLETED", async () => {
    const provider: AnalysisProvider = { analyze: jest.fn().mockResolvedValue(RESULT) };
    const processor = new AnalysisProcessor(provider);

    await processor.process(makeJob());

    expect(provider.analyze).toHaveBeenCalledWith(TRANSCRIPT.text, TRANSCRIPT.language);
    expect(prisma.knowledgeItem.create).toHaveBeenCalledTimes(1);
    const createArgs = (prisma.knowledgeItem.create as jest.Mock).mock.calls[0][0];
    expect(createArgs.data.sourceFileId).toBe(SOURCE_FILE_ID);
    expect(createArgs.data.title).toBe(RESULT.title);
    expect(prisma.processingJob.update).toHaveBeenCalledWith({
      where: { sourceFileId: SOURCE_FILE_ID },
      data: { stage: "COMPLETED" },
    });
  });

  it("marks the job FAILED without calling the provider when analysis isn't configured", async () => {
    const processor = new AnalysisProcessor(null);

    await processor.process(makeJob());

    expect(prisma.transcript.findUnique).not.toHaveBeenCalled();
    expect(prisma.processingJob.update).toHaveBeenCalledWith({
      where: { sourceFileId: SOURCE_FILE_ID },
      data: {
        stage: "FAILED",
        errorMessage: "AI analysis is not configured on this deployment.",
        attempts: { increment: 1 },
      },
    });
  });

  it("marks the job FAILED with the real error message and rethrows when analysis fails", async () => {
    const provider: AnalysisProvider = {
      analyze: jest
        .fn()
        .mockRejectedValue(new Error("AI analysis failed after one retry: bad output")),
    };
    const processor = new AnalysisProcessor(provider);

    await expect(processor.process(makeJob())).rejects.toThrow(
      "AI analysis failed after one retry: bad output",
    );

    expect(prisma.knowledgeItem.create).not.toHaveBeenCalled();
    expect(prisma.processingJob.update).toHaveBeenCalledWith({
      where: { sourceFileId: SOURCE_FILE_ID },
      data: {
        stage: "FAILED",
        errorMessage: "AI analysis failed after one retry: bad output",
        attempts: { increment: 1 },
      },
    });
  });

  it("skips silently if the Transcript no longer exists", async () => {
    (prisma.transcript.findUnique as jest.Mock).mockResolvedValue(null);
    const provider: AnalysisProvider = { analyze: jest.fn() };
    const processor = new AnalysisProcessor(provider);

    await processor.process(makeJob());

    expect(provider.analyze).not.toHaveBeenCalled();
    expect(prisma.processingJob.update).not.toHaveBeenCalled();
  });
});
