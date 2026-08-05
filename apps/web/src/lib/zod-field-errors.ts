import type { ZodError } from "zod";

/** Flattens a ZodError into { fieldName: firstMessage } — enough for
 * FormField's single `error` string per field. */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !(key in fields)) fields[key] = issue.message;
  }
  return fields;
}
