import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { prisma } from "@transcriptioneer/database";
import type { TranscriptionProvider } from "@transcriptioneer/ai";
import type { Job, Queue } from "bullmq";
import { ANALYSIS_QUEUE, type AnalysisJobData } from "../analysis/queue.constants";
import { StorageService } from "../files/storage.service";
import { TRANSCRIPTION_QUEUE, type TranscriptionJobData } from "./queue.constants";
import { WHISPER_PROVIDER } from "./whisper-provider.provider";

// Hardware constraint, not a style choice: the VPS this runs on has 1 vCPU
// and Whisper's "base" model peaks at ~700MB RSS while loaded
// (WHISPER_SETUP.md) — running two transcriptions at once risks OOM, not
// just slowness. concurrency: 1 is load-bearing.
@Processor(TRANSCRIPTION_QUEUE, { concurrency: 1 })
export class TranscriptionProcessor extends WorkerHost {
  private readonly logger = new Logger(TranscriptionProcessor.name);

  constructor(
    private readonly storage: StorageService,
    @Inject(WHISPER_PROVIDER) private readonly whisperProvider: TranscriptionProvider | null,
    @InjectQueue(ANALYSIS_QUEUE) private readonly analysisQueue: Queue<AnalysisJobData>,
  ) {
    super();
  }

  async process(job: Job<TranscriptionJobData>): Promise<void> {
    const { sourceFileId } = job.data;

    if (!this.whisperProvider) {
      await this.markFailed(sourceFileId, "Transcription is not configured on this deployment.");
      return;
    }

    const sourceFile = await prisma.sourceFile.findUnique({ where: { id: sourceFileId } });
    if (!sourceFile) {
      this.logger.warn(`SourceFile ${sourceFileId} no longer exists — skipping.`);
      return;
    }

    await prisma.processingJob.update({ where: { sourceFileId }, data: { stage: "TRANSCRIBING" } });

    const tempPath = join(
      tmpdir(),
      `transcriptioneer-${randomUUID()}${extname(sourceFile.originalName)}`,
    );
    try {
      await this.storage.downloadToFile(sourceFile.storageKey, tempPath);
      const result = await this.whisperProvider.transcribe(tempPath);

      await prisma.$transaction([
        prisma.transcript.create({
          data: {
            sourceFileId,
            text: result.text,
            language: result.language,
            segments: result.segments,
          },
        }),
        // ANALYZING, not COMPLETED: the pipeline continues into
        // aiAnalysisService (ARCHITECTURE.md §6's state machine —
        // transcribing → analyzing → completed).
        prisma.processingJob.update({ where: { sourceFileId }, data: { stage: "ANALYZING" } }),
      ]);
      await this.analysisQueue.add("analyze", { sourceFileId });
    } catch (error) {
      await this.markFailed(
        sourceFileId,
        error instanceof Error ? error.message : "Unknown error.",
      );
      throw error; // also let BullMQ record the failure/retry
    } finally {
      await rm(tempPath, { force: true });
    }
  }

  private async markFailed(sourceFileId: string, message: string): Promise<void> {
    await prisma.processingJob.update({
      where: { sourceFileId },
      data: { stage: "FAILED", errorMessage: message, attempts: { increment: 1 } },
    });
  }
}
