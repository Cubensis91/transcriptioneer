import { describe, expect, it } from "vitest";
import type { ApiResponse } from "./index";

describe("ApiResponse", () => {
  it("narrows on the success discriminant", () => {
    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: "abc" },
    };

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data.id).toBe("abc");
    }
  });
});
