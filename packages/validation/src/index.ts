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
