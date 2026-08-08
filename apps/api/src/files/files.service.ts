import { randomUUID } from "node:crypto";
import { InjectQueue } from "@nestjs/bullmq";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@transcriptioneer/database";
import type {
  AuthenticatedUser,
  KnowledgeItem,
  PresignUploadResponse,
  ProcessingJob,
  SourceFile,
  Transcript,
} from "@transcriptioneer/types";
import type { PresignUploadInput } from "@transcriptioneer/validation";
import type { Queue } from "bullmq";
import { detectFileType } from "./file-type-loader";
import { StorageService } from "./storage.service";
import { TRANSCRIPTION_QUEUE, type TranscriptionJobData } from "../transcription/queue.constants";

// file-type needs a decent prefix to detect some formats reliably (a few
// container formats store their signature past the first KB) without
// downloading an entire multi-hundred-MB file through the API just to
// validate it.
const MAGIC_BYTE_SNIFF_LENGTH = 4100;

function buildStorageKey(organizationId: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150);
  return `${organizationId}/${randomUUID()}-${safeName}`;
}

function toPublicFile(file: {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: "PENDING" | "UPLOADED" | "FAILED";
  createdAt: Date;
}): SourceFile {
  return {
    id: file.id,
    originalName: file.originalName,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    status: file.status,
    createdAt: file.createdAt.toISOString(),
  };
}

/** True if a magic-byte-detected mime type is a plausible match for what
 * the client declared at presign time. `text/plain` and `text/markdown`
 * have no magic bytes at all, so an undetected type is only accepted for
 * those two — anything else with no detectable signature is a mismatch. */
function matchesDeclaredCategory(detectedMime: string | undefined, declaredMime: string): boolean {
  if (!detectedMime) return declaredMime.startsWith("text/");
  if (declaredMime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // docx is a zip container; file-type sometimes only gets as far as
    // "it's a zip" depending on internal structure.
    return detectedMime === declaredMime || detectedMime === "application/zip";
  }
  if (declaredMime === "application/pdf") return detectedMime === "application/pdf";
  return detectedMime.split("/")[0] === declaredMime.split("/")[0];
}

/** Only audio/video go through transcription — Whisper decodes a video's
 * audio track natively via ffmpeg, so no separate extraction step is
 * needed for it. Everything else (documents, images) is Milestone 6/7+. */
function isTranscribable(mimeType: string): boolean {
  return mimeType.startsWith("audio/") || mimeType.startsWith("video/");
}

@Injectable()
export class FilesService {
  constructor(
    private readonly storage: StorageService,
    @InjectQueue(TRANSCRIPTION_QUEUE)
    private readonly transcriptionQueue: Queue<TranscriptionJobData>,
  ) {}

  async presignUpload(
    user: AuthenticatedUser,
    input: PresignUploadInput,
  ): Promise<PresignUploadResponse> {
    const storageKey = buildStorageKey(user.organizationId, input.filename);
    const file = await prisma.sourceFile.create({
      data: {
        organizationId: user.organizationId,
        uploadedById: user.sub,
        storageKey,
        originalName: input.filename,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
      },
    });
    const uploadUrl = await this.storage.getPresignedUploadUrl(storageKey, input.mimeType);
    return { file: toPublicFile(file), uploadUrl };
  }

  /** Called by the client once its direct-to-storage PUT finishes.
   * Verifies the object actually landed (not just that the client *says*
   * it did) and that its real bytes match the declared type — the
   * server-side half of ARCHITECTURE.md §7's "checks real mime/magic
   * bytes, not just extension." */
  async confirmUpload(user: AuthenticatedUser, fileId: string): Promise<SourceFile> {
    const file = await this.getOwnedFileOrThrow(user, fileId);

    const head = await this.storage.headObject(file.storageKey);
    if (!head) {
      throw new BadRequestException("Upload not found in storage — did it finish?");
    }

    const prefix = await this.storage.getObjectPrefix(file.storageKey, MAGIC_BYTE_SNIFF_LENGTH);
    const detected = await detectFileType(prefix);

    if (!matchesDeclaredCategory(detected?.mime, file.mimeType)) {
      await this.storage.deleteObject(file.storageKey);
      await prisma.sourceFile.update({ where: { id: file.id }, data: { status: "FAILED" } });
      throw new BadRequestException(
        `The uploaded file doesn't look like a ${file.mimeType} file (detected: ${detected?.mime ?? "unrecognized"}).`,
      );
    }

    const updated = await prisma.sourceFile.update({
      where: { id: file.id },
      data: { status: "UPLOADED", sizeBytes: head.sizeBytes },
    });

    if (isTranscribable(updated.mimeType)) {
      await prisma.processingJob.create({ data: { sourceFileId: updated.id } });
      await this.transcriptionQueue.add("transcribe", { sourceFileId: updated.id });
    }

    return toPublicFile(updated);
  }

  async listFiles(user: AuthenticatedUser): Promise<SourceFile[]> {
    const files = await prisma.sourceFile.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: "desc" },
    });
    return files.map(toPublicFile);
  }

  async getFile(user: AuthenticatedUser, fileId: string): Promise<SourceFile> {
    return toPublicFile(await this.getOwnedFileOrThrow(user, fileId));
  }

  async getDownloadUrl(user: AuthenticatedUser, fileId: string): Promise<string> {
    const file = await this.getOwnedFileOrThrow(user, fileId);
    if (file.status !== "UPLOADED") {
      throw new BadRequestException("This file hasn't finished uploading yet.");
    }
    return this.storage.getPresignedDownloadUrl(file.storageKey);
  }

  async deleteFile(user: AuthenticatedUser, fileId: string): Promise<void> {
    const file = await this.getOwnedFileOrThrow(user, fileId);
    try {
      await this.storage.deleteObject(file.storageKey);
    } catch {
      // The DB row is the source of truth for whether the file "exists"
      // from the user's perspective — a storage object that's already
      // gone (e.g. a previously-FAILED upload) shouldn't block deletion.
    }
    await prisma.sourceFile.delete({ where: { id: file.id } });
  }

  /** Null for non-transcribable files or ones whose job hasn't been
   * created yet — not a 404, since "no job" is an expected, normal state
   * (e.g. a PDF), not an error. */
  async getJob(user: AuthenticatedUser, fileId: string): Promise<ProcessingJob | null> {
    const file = await this.getOwnedFileOrThrow(user, fileId);
    const job = await prisma.processingJob.findUnique({ where: { sourceFileId: file.id } });
    if (!job) return null;
    return {
      stage: job.stage,
      errorMessage: job.errorMessage,
      attempts: job.attempts,
      updatedAt: job.updatedAt.toISOString(),
    };
  }

  /** Null until the job reaches COMPLETED — same "expected absence, not an
   * error" reasoning as getJob. */
  async getTranscript(user: AuthenticatedUser, fileId: string): Promise<Transcript | null> {
    const file = await this.getOwnedFileOrThrow(user, fileId);
    const transcript = await prisma.transcript.findUnique({ where: { sourceFileId: file.id } });
    if (!transcript) return null;
    return {
      text: transcript.text,
      language: transcript.language,
      segments: (transcript.segments ?? []) as Transcript["segments"],
      createdAt: transcript.createdAt.toISOString(),
    };
  }

  /** Null until the analysis job reaches COMPLETED — same "expected
   * absence, not an error" reasoning as getJob/getTranscript. */
  async getKnowledgeItem(user: AuthenticatedUser, fileId: string): Promise<KnowledgeItem | null> {
    const file = await this.getOwnedFileOrThrow(user, fileId);
    const item = await prisma.knowledgeItem.findUnique({
      where: { sourceFileId: file.id },
      include: {
        topics: { include: { topic: true } },
        keywords: { include: { keyword: true } },
        tags: { include: { tag: true } },
        people: { include: { person: true } },
        organizations: { include: { organization: true } },
        locations: { include: { location: true } },
        eventDates: true,
        decisions: true,
        tasks: true,
        questions: true,
        openIssues: true,
        facts: true,
        quotes: true,
      },
    });
    if (!item) return null;
    return {
      id: item.id,
      title: item.title,
      summary: item.summary,
      detailedSummary: item.detailedSummary,
      topics: item.topics.map((t) => t.topic.name),
      keywords: item.keywords.map((k) => k.keyword.name),
      tags: item.tags.map((t) => t.tag.name),
      people: item.people.map((p) => ({ name: p.person.name, context: p.context })),
      organizations: item.organizations.map((o) => ({
        name: o.organization.name,
        context: o.context,
      })),
      locations: item.locations.map((l) => ({ name: l.location.name, context: l.context })),
      eventDates: item.eventDates.map((e) => ({
        label: e.label,
        rawText: e.rawText,
        isoDate: e.date ? e.date.toISOString().slice(0, 10) : null,
      })),
      decisions: item.decisions.map((d) => d.text),
      tasks: item.tasks.map((t) => ({ text: t.text, status: t.status, assignee: t.assignee })),
      questions: item.questions.map((q) => q.text),
      openIssues: item.openIssues.map((o) => o.text),
      facts: item.facts.map((f) => f.text),
      quotes: item.quotes.map((q) => ({ text: q.text, speaker: q.speaker })),
      createdAt: item.createdAt.toISOString(),
    };
  }

  /** Repository-layer org scoping, same pattern as
   * AuthService.getOrganizationForUser: the query itself excludes files
   * outside the caller's org, so a cross-org id can't be distinguished
   * from "not found." */
  private async getOwnedFileOrThrow(user: AuthenticatedUser, fileId: string) {
    const file = await prisma.sourceFile.findFirst({
      where: { id: fileId, organizationId: user.organizationId },
    });
    if (!file) {
      throw new NotFoundException("File not found.");
    }
    return file;
  }
}
