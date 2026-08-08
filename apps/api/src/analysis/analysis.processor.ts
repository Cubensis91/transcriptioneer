import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { prisma } from "@transcriptioneer/database";
import type { AnalysisProvider, AnalysisResult } from "@transcriptioneer/ai";
import type { Job } from "bullmq";
import { ANALYSIS_QUEUE, type AnalysisJobData } from "./queue.constants";
import { ANALYSIS_PROVIDER } from "./analysis-provider.provider";

// Mostly I/O-bound (waiting on the OpenAI API), unlike TranscriptionProcessor
// which is CPU-bound on the same 1-vCPU box — a small concurrency is safe
// here without risking the OOM/starvation concerns documented on that one.
@Processor(ANALYSIS_QUEUE, { concurrency: 2 })
export class AnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(
    @Inject(ANALYSIS_PROVIDER) private readonly analysisProvider: AnalysisProvider | null,
  ) {
    super();
  }

  async process(job: Job<AnalysisJobData>): Promise<void> {
    const { sourceFileId } = job.data;

    if (!this.analysisProvider) {
      await this.markFailed(sourceFileId, "AI analysis is not configured on this deployment.");
      return;
    }

    const transcript = await prisma.transcript.findUnique({
      where: { sourceFileId },
      include: { sourceFile: { select: { organizationId: true } } },
    });
    if (!transcript) {
      this.logger.warn(`Transcript for SourceFile ${sourceFileId} no longer exists — skipping.`);
      return;
    }

    try {
      const result = await this.analysisProvider.analyze(transcript.text, transcript.language);
      await this.persist(sourceFileId, transcript.sourceFile.organizationId, result);
      await prisma.processingJob.update({ where: { sourceFileId }, data: { stage: "COMPLETED" } });
    } catch (error) {
      await this.markFailed(
        sourceFileId,
        error instanceof Error ? error.message : "Unknown error.",
      );
      throw error; // also let BullMQ record the failure/retry
    }
  }

  /** One nested-write transaction: KnowledgeItem plus every related row,
   * dedup-linking Topic/Keyword/Tag/Person/OrganizationEntity/Location
   * against existing org rows via connectOrCreate rather than creating
   * duplicates per document (ARCHITECTURE.md §4). */
  private async persist(
    sourceFileId: string,
    organizationId: string,
    result: AnalysisResult,
  ): Promise<void> {
    await prisma.knowledgeItem.create({
      data: {
        sourceFileId,
        title: result.title,
        summary: result.summary,
        detailedSummary: result.detailedSummary,
        topics: {
          create: result.topics.map((name) => ({
            topic: {
              connectOrCreate: {
                where: { organizationId_name: { organizationId, name } },
                create: { organizationId, name },
              },
            },
          })),
        },
        keywords: {
          create: result.keywords.map((name) => ({
            keyword: {
              connectOrCreate: {
                where: { organizationId_name: { organizationId, name } },
                create: { organizationId, name },
              },
            },
          })),
        },
        tags: {
          create: result.tags.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { organizationId_name: { organizationId, name } },
                create: { organizationId, name },
              },
            },
          })),
        },
        people: {
          create: result.people.map(({ name, context }) => ({
            context,
            person: {
              connectOrCreate: {
                where: { organizationId_name: { organizationId, name } },
                create: { organizationId, name },
              },
            },
          })),
        },
        organizations: {
          create: result.organizations.map(({ name, context }) => ({
            context,
            organization: {
              connectOrCreate: {
                where: { organizationId_name: { organizationId, name } },
                create: { organizationId, name },
              },
            },
          })),
        },
        locations: {
          create: result.locations.map(({ name, context }) => ({
            context,
            location: {
              connectOrCreate: {
                where: { organizationId_name: { organizationId, name } },
                create: { organizationId, name },
              },
            },
          })),
        },
        eventDates: {
          create: result.eventDates.map(({ label, rawText, isoDate }) => ({
            label,
            rawText,
            date: isoDate ? new Date(isoDate) : null,
          })),
        },
        decisions: { create: result.decisions.map((text) => ({ text })) },
        tasks: {
          create: result.tasks.map(({ text, assignee }) => ({ text, assignee })),
        },
        questions: { create: result.questions.map((text) => ({ text })) },
        openIssues: { create: result.openIssues.map((text) => ({ text })) },
        facts: { create: result.facts.map((text) => ({ text })) },
        quotes: {
          create: result.quotes.map(({ text, speaker }) => ({ text, speaker })),
        },
      },
    });
  }

  private async markFailed(sourceFileId: string, message: string): Promise<void> {
    await prisma.processingJob.update({
      where: { sourceFileId },
      data: { stage: "FAILED", errorMessage: message, attempts: { increment: 1 } },
    });
  }
}
