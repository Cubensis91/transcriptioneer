import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { ApiFailure } from "@transcriptioneer/types";
import type { Response } from "express";

function extractMessage(body: unknown): string | undefined {
  if (typeof body === "string") return body;
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    // ZodValidationPipe's shape: { message: "Validation failed", issues: [{path, message}] }
    if (Array.isArray(record.issues)) {
      return (record.issues as Array<{ path?: string; message: string }>)
        .map((issue) => (issue.path ? `${issue.path}: ${issue.message}` : issue.message))
        .join(" ");
    }
    if (typeof record.message === "string") return record.message;
    if (Array.isArray(record.message)) return record.message.join(" ");
  }
  return undefined;
}

/**
 * Every response — success or failure — is supposed to match `ApiResponse<T>`
 * (packages/types), the contract `packages/api-client` parses on the other
 * end. Without this filter, Nest's default exception shape
 * (`{statusCode, message, error}`) leaks straight to clients instead, and
 * `api-client.request()` silently fails to surface the real error message
 * (found via the web login screen returning a blank error on wrong
 * credentials — a 401 with no visible feedback).
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    let code: string;
    if (isHttpException) {
      message = extractMessage(exception.getResponse()) ?? exception.message;
      code = exception.constructor.name;
    } else {
      // Never leak raw internal error details to the client; log the real
      // one server-side instead.
      this.logger.error(exception instanceof Error ? exception.stack : exception);
      message = "Internal server error.";
      code = "InternalServerError";
    }

    const body: ApiFailure = { success: false, error: { code, message } };
    response.status(status).json(body);
  }
}
