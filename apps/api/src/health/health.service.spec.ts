import { Test, TestingModule } from "@nestjs/testing";
import { prisma } from "@transcriptioneer/database";
import { HealthService } from "./health.service";

jest.mock("@transcriptioneer/database", () => ({
  prisma: { $queryRaw: jest.fn() },
}));

describe("HealthService", () => {
  let service: HealthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get(HealthService);
  });

  it('reports "ok" when the database is reachable', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ "?column?": 1 }]);

    const result = await service.check();

    expect(result.status).toBe("ok");
    expect(result.service).toBe("api");
    expect(() => new Date(result.timestamp)).not.toThrow();
  });

  it('reports "degraded" without crashing when the database is unreachable', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error("connection refused"));

    const result = await service.check();

    expect(result.status).toBe("degraded");
  });
});
