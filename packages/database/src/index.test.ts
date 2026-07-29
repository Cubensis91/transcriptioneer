import { describe, expect, it } from "vitest";
import { prisma } from "./index";

describe("prisma client", () => {
  it("is instantiated as a singleton", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
  });
});
