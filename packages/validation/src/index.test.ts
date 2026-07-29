import { describe, expect, it } from "vitest";
import { paginationQuerySchema } from "./index";

describe("paginationQuerySchema", () => {
  it("applies defaults when fields are omitted", () => {
    const result = paginationQuerySchema.parse({});
    expect(result).toEqual({ page: 1, pageSize: 20 });
  });

  it("rejects a pageSize above the max", () => {
    const result = paginationQuerySchema.safeParse({ pageSize: 1000 });
    expect(result.success).toBe(false);
  });
});
