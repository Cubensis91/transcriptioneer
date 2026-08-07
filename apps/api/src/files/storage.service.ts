import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env.validation";

const PRESIGN_EXPIRY_SECONDS = 15 * 60;

/**
 * S3-compatible object storage (MinIO in dev/self-hosted, swappable for
 * real S3/R2 per ARCHITECTURE.md §10). Files are never served from a public
 * bucket — every read/write goes through a short-lived presigned URL
 * (§7), and the API server itself never proxies file bytes for uploads
 * (the browser PUTs directly to storage).
 */
@Injectable()
export class StorageService {
  private readonly client: S3Client | null;
  private readonly bucket: string | null;

  constructor(configService: ConfigService<Env, true>) {
    const endpoint = configService.get("STORAGE_ENDPOINT", { infer: true });
    const bucket = configService.get("STORAGE_BUCKET", { infer: true });
    const accessKeyId = configService.get("STORAGE_ACCESS_KEY_ID", { infer: true });
    const secretAccessKey = configService.get("STORAGE_SECRET_ACCESS_KEY", { infer: true });

    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
      this.client = null;
      this.bucket = null;
      return;
    }

    this.bucket = bucket;
    this.client = new S3Client({
      endpoint,
      region: configService.get("STORAGE_REGION", { infer: true }),
      credentials: { accessKeyId, secretAccessKey },
      // MinIO (and most self-hosted S3-compatible stores) need path-style
      // addressing (host/bucket/key) — virtual-hosted-style (bucket.host/key)
      // requires per-bucket DNS/TLS that isn't set up here.
      forcePathStyle: true,
    });
  }

  private requireClient(): { client: S3Client; bucket: string } {
    if (!this.client || !this.bucket) {
      throw new ServiceUnavailableException("File storage is not configured on this deployment.");
    }
    return { client: this.client, bucket: this.bucket };
  }

  async getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
    const { client, bucket } = this.requireClient();
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    return getSignedUrl(client, command, { expiresIn: PRESIGN_EXPIRY_SECONDS });
  }

  async getPresignedDownloadUrl(key: string): Promise<string> {
    const { client, bucket } = this.requireClient();
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: PRESIGN_EXPIRY_SECONDS });
  }

  /** Null if the object doesn't exist (e.g. the client never actually
   * uploaded before calling the confirm endpoint) rather than throwing. */
  async headObject(key: string): Promise<{ sizeBytes: number } | null> {
    const { client, bucket } = this.requireClient();
    try {
      const result = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return { sizeBytes: result.ContentLength ?? 0 };
    } catch (error) {
      if (error instanceof NotFound) return null;
      throw error;
    }
  }

  /** Fetches only the first `maxBytes` (a ranged GET) — enough for magic-byte
   * sniffing without downloading an entire multi-hundred-MB file through
   * the API server just to validate it. */
  async getObjectPrefix(key: string, maxBytes: number): Promise<Buffer> {
    const { client, bucket } = this.requireClient();
    const result = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key, Range: `bytes=0-${maxBytes - 1}` }),
    );
    const bytes = await result.Body?.transformToByteArray();
    return Buffer.from(bytes ?? []);
  }

  async deleteObject(key: string): Promise<void> {
    const { client, bucket } = this.requireClient();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  /** Streams the full object to `destPath` — used by the transcription
   * worker, which needs a real file on disk to hand to the Whisper
   * subprocess (WHISPER_SETUP.md's contract takes a file path, not stdin). */
  async downloadToFile(key: string, destPath: string): Promise<void> {
    const { client, bucket } = this.requireClient();
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!result.Body) {
      throw new Error(`Storage object ${key} has no body.`);
    }
    await pipeline(result.Body as NodeJS.ReadableStream, createWriteStream(destPath));
  }
}
