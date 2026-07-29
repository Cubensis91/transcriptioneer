import type { ApiResponse } from "@transcriptioneer/types";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export type ApiClientConfig = {
  baseUrl: string;
  getAuthToken?: () => string | null | undefined;
};

/**
 * Thin, typed wrapper around fetch shared by web and mobile. Feature methods
 * (auth, files, chat, ...) are added here as their endpoints ship — this
 * package only owns the request/response contract for Milestone 1.
 */
export function createApiClient(config: ApiClientConfig) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = config.getAuthToken?.();
    const response = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    const body = (await response.json()) as ApiResponse<T>;

    if (!body.success) {
      throw new ApiClientError(body.error.message, body.error.code, response.status);
    }

    return body.data;
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createApiClient>;
