import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const healthStatusSchema = z.object({
  status: z.enum(["ok", "degraded", "down"]),
  service: z.string(),
  timestamp: z.string().datetime(),
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;

// Lowercased at the schema boundary (not just trimmed) so the Prisma unique
// constraint on User.email behaves case-insensitively as long as every
// write/lookup goes through this schema first.
const emailField = z
  .string()
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase().trim());

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Za-z]/, "Password must include a letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const registerSchema = z.object({
  email: emailField,
  password: passwordField,
  name: z.string().trim().min(1, "Name is required.").max(200),
  organizationName: z.string().trim().min(1, "Organization name is required.").max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login intentionally doesn't reapply passwordField's strength rule — an
// existing account's password may predate a strength-rule change, and
// login isn't the place to reject it; only registration enforces strength.
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Matches the file kinds IntakeThreshold's UI already advertises
// (apps/web/src/components/upload/intake-threshold.tsx) — audio, video,
// pdf, docx, txt, md, image. Prefix-matched against the browser-declared
// mime type at request time and re-checked against the *actual* magic
// bytes once the upload lands in storage (ARCHITECTURE.md §7) — this list
// only gates the presign step, it isn't the final word on what a file is.
export const ALLOWED_UPLOAD_MIME_PREFIXES = [
  "audio/",
  "video/",
  "image/",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
] as const;

// 500MB — generous enough for a typical recorded meeting or lecture video
// without inviting arbitrarily large uploads; revisit once real usage data
// exists.
export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export const presignUploadSchema = z.object({
  filename: z.string().trim().min(1, "Filename is required.").max(255),
  mimeType: z
    .string()
    .min(1, "File type is required.")
    .refine(
      (value) => ALLOWED_UPLOAD_MIME_PREFIXES.some((prefix) => value.startsWith(prefix)),
      "This file type isn't supported.",
    ),
  sizeBytes: z.coerce
    .number()
    .int()
    .positive("File is empty.")
    .max(MAX_UPLOAD_BYTES, "File is too large (max 500MB)."),
});

export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
