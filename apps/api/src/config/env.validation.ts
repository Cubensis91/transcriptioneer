import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  WEB_APP_URL: z.string().url().default("http://localhost:3000"),

  // Separate secrets for access vs. refresh tokens: a leaked access-token
  // secret (short-lived, used on every request) shouldn't also let an
  // attacker forge long-lived refresh tokens.
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900), // 15 min
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  // Optional: Google sign-in stays unregistered (routes return 501) until
  // all three are set — no real provider app has been registered yet, and
  // the app must boot cleanly without them (MILESTONE_3_AUTH.md's "OAuth
  // stubs" scope).
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // Optional, same reasoning as the Google vars above: the app must boot
  // cleanly without a storage backend configured. Unlike Google sign-in
  // (one guard checks one thing), every /api/v1/files endpoint depends on
  // this, so StorageService itself throws a clear 503 if any are missing
  // rather than each caller re-checking.
  STORAGE_ENDPOINT: z.string().url().optional(),
  STORAGE_BUCKET: z.string().min(1).optional(),
  STORAGE_ACCESS_KEY_ID: z.string().min(1).optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  STORAGE_REGION: z.string().min(1).default("us-east-1"),

  // BullMQ's queue connection. ioredis (which BullMQ uses internally)
  // connects lazily and retries in the background rather than throwing at
  // construction time, so an unreachable Redis doesn't crash the app at
  // boot — queue operations just fail/retry when actually invoked.
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),

  // Optional, same pattern as storage: the app boots fine without these,
  // and the transcription worker marks the job FAILED with a clear message
  // instead of crashing. Production values point at the venv provisioned
  // per WHISPER_SETUP.md.
  WHISPER_PYTHON_BIN: z.string().min(1).optional(),
  WHISPER_SCRIPT_PATH: z.string().min(1).optional(),
  WHISPER_MODEL: z.string().min(1).default("base"),

  // Optional, same pattern as Whisper above: the app boots fine without it,
  // and the analysis worker marks the job FAILED with a clear message
  // instead of crashing. First real use of the OpenAI SDK (Milestone 6).
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${result.error.toString()}`);
  }
  return result.data;
}
