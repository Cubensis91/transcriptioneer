import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import type { ApiResponse, HealthStatus } from "@transcriptioneer/types";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    process.env.DATABASE_URL ??= "postgresql://user:password@localhost:5432/transcriptioneer";
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/health (GET)", async () => {
    const response = await request(app.getHttpServer()).get("/health").expect(200);
    const body = response.body as ApiResponse<HealthStatus>;

    expect(body.success).toBe(true);
    if (body.success) {
      expect(["ok", "degraded"]).toContain(body.data.status);
      expect(body.data.service).toBe("api");
    }
  });

  afterEach(async () => {
    await app.close();
  });
});
