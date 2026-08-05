import { BadRequestException, type PipeTransform } from "@nestjs/common";
import type { ZodSchema } from "zod";

/** Parses (and transforms, e.g. lowercases email) the request body against a
 * shared Zod schema from `@transcriptioneer/validation` — the same schema
 * the web app uses client-side, so the two never drift. */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    return result.data;
  }
}
