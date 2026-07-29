import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

describe("HealthController", () => {
  let controller: HealthController;

  const healthServiceMock = {
    check: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthServiceMock }],
    }).compile();

    controller = module.get(HealthController);
  });

  it("wraps the health service result in the ApiResponse success envelope", async () => {
    healthServiceMock.check.mockResolvedValue({
      status: "ok",
      service: "api",
      timestamp: "2026-07-28T00:00:00.000Z",
    });

    const response = await controller.check();

    expect(response).toEqual({
      success: true,
      data: { status: "ok", service: "api", timestamp: "2026-07-28T00:00:00.000Z" },
    });
  });
});
