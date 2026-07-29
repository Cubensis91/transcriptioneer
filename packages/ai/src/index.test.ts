import { describe, expect, it } from "vitest";
import { AI_PACKAGE_BOUNDARY } from "./index";

describe("packages/ai boundary", () => {
  it("marks itself as server-only", () => {
    expect(AI_PACKAGE_BOUNDARY).toBe("server-only");
  });
});
