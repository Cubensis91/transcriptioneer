import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, createApiClient } from "./index";

describe("createApiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns data on a successful envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        json: async () => ({ success: true, data: { ok: true } }),
      }),
    );

    const client = createApiClient({ baseUrl: "http://localhost:4000" });
    await expect(client.request<{ ok: boolean }>("/health")).resolves.toEqual({ ok: true });
  });

  it("throws ApiClientError on a failure envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 404,
        json: async () => ({
          success: false,
          error: { code: "NOT_FOUND", message: "missing" },
        }),
      }),
    );

    const client = createApiClient({ baseUrl: "http://localhost:4000" });
    await expect(client.request("/missing")).rejects.toBeInstanceOf(ApiClientError);
  });
});
