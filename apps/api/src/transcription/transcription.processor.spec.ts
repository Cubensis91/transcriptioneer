/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method --
   this file wires an untyped Jest mock of the Prisma client (the real client is fully
   typed), and passes jest.fn() mock methods to expect(...).toHaveBeenCalledWith(...),
   which the unbound-method rule can't distinguish from a real unbound method reference. */
jest.mock("@transcriptioneer/database", () => {
  const prisma: any = {
    sourceFile: { findUnique: jest.fn() },
    processingJob: { update: jest.fn() },
    transcript: { create: jest.fn() },
    $transaction: jest.fn(async (ops: Array<Promise<unknown>>) => Promise.all(ops)),
  };
  return { prisma };
});

jest.mock("node:fs/promises", () => ({ rm: jest.fn().mockResolvedValue(undefined) }));

import { prisma } from "@transcriptioneer/database";
import type { TranscriptionProvider } from "@transcriptioneer/ai";
import type { Job } from "bullmq";
import { StorageService } from "../files/storage.service";
import { TranscriptionProcessor } from "./transcription.processor";

const SOURCE_FILE = {
  id: "file-1",
  storageKey: "org-1/file-1-meeting.mp3",
  originalName: "meeting.mp3",
};

function makeJob(): Job<{ sourceFileId: string }> {
  return { data: { sourceFileId: SOURCE_FILE.id } } as Job<{ sourceFileId: string }>;
}

describe("TranscriptionProcessor", () => {
  let storage: jest.Mocked<StorageService>;

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.sourceFile.findUnique as jest.Mock).mockResolvedValue(SOURCE_FILE);
    storage = {
      downloadToFile: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<StorageService>;
  });

  it("transcribes, stores the Transcript, and marks the job COMPLETED", async () => {
    const whisperProvider: TranscriptionProvider = {
      transcribe: jest.fn().mockResolvedValue({
        text: "Hello world.",
        language: "en",
        segments: [{ start: 0, end: 1, text: "Hello world." }],
      }),
    };
    const processor = new TranscriptionProcessor(storage, whisperProvider);

    await processor.process(makeJob());

    expect(prisma.processingJob.update).toHaveBeenCalledWith({
      where: { sourceFileId: SOURCE_FILE.id },
      data: { stage: "TRANSCRIBING" },
    });
    expect(prisma.transcript.create).toHaveBeenCalledWith({
      data: {
        sourceFileId: SOURCE_FILE.id,
        text: "Hello world.",
        language: "en",
        segments: [{ start: 0, end: 1, text: "Hello world." }],
      },
    });
    expect(prisma.processingJob.update).toHaveBeenCalledWith({
      where: { sourceFileId: SOURCE_FILE.id },
      data: { stage: "COMPLETED" },
    });
  });

  it("marks the job FAILED without touching storage when no provider is configured", async () => {
    const processor = new TranscriptionProcessor(storage, null);

    await processor.process(makeJob());

    expect(storage.downloadToFile).not.toHaveBeenCalled();
    expect(prisma.processingJob.update).toHaveBeenCalledWith({
      where: { sourceFileId: SOURCE_FILE.id },
      data: {
        stage: "FAILED",
        errorMessage: "Transcription is not configured on this deployment.",
        attempts: { increment: 1 },
      },
    });
  });

  it("marks the job FAILED with the real error message and rethrows when Whisper fails", async () => {
    const whisperProvider: TranscriptionProvider = {
      transcribe: jest.fn().mockRejectedValue(new Error("Could not decode audio.")),
    };
    const processor = new TranscriptionProcessor(storage, whisperProvider);

    await expect(processor.process(makeJob())).rejects.toThrow("Could not decode audio.");

    expect(prisma.processingJob.update).toHaveBeenCalledWith({
      where: { sourceFileId: SOURCE_FILE.id },
      data: {
        stage: "FAILED",
        errorMessage: "Could not decode audio.",
        attempts: { increment: 1 },
      },
    });
  });

  it("skips silently if the SourceFile no longer exists", async () => {
    (prisma.sourceFile.findUnique as jest.Mock).mockResolvedValue(null);
    const whisperProvider: TranscriptionProvider = { transcribe: jest.fn() };
    const processor = new TranscriptionProcessor(storage, whisperProvider);

    await processor.process(makeJob());

    expect(whisperProvider.transcribe).not.toHaveBeenCalled();
    expect(prisma.processingJob.update).not.toHaveBeenCalled();
  });
});
