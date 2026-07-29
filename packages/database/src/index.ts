import { PrismaClient } from "../generated/client/index.js";

export { PrismaClient } from "../generated/client/index.js";
export type * from "../generated/client/index.js";

declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Reused across hot-reloads in dev so we don't exhaust the Postgres
 * connection pool by minting a new PrismaClient on every file change.
 */
export const prisma: PrismaClient = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
