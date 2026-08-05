/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment,
   @typescript-eslint/no-unsafe-argument -- supertest's `.body` is untyped `any` by design. */
import { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import cookieParser from "cookie-parser";
import request from "supertest";
import { JwtService } from "@nestjs/jwt";
import type { AuthenticatedUser } from "@transcriptioneer/types";
import { AuthModule } from "./auth.module";
import { AuthService } from "./auth.service";

// Proves guard + rate-limiting behavior end-to-end over real HTTP, with
// AuthService swapped for a stub — no live Postgres needed for these two
// concerns (business logic itself is covered in auth.service.spec.ts).
const TEST_ENV = {
  JWT_ACCESS_SECRET: "test-access-secret-at-least-32-characters-long",
  JWT_REFRESH_SECRET: "test-refresh-secret-at-least-32-characters-long",
  JWT_ACCESS_TTL_SECONDS: 900,
  JWT_REFRESH_TTL_DAYS: 30,
  NODE_ENV: "test",
};

const fakeAuthService: Partial<Record<keyof AuthService, jest.Mock>> = {
  getSessionForUser: jest.fn().mockResolvedValue({
    user: {
      id: "u1",
      email: "user@example.com",
      name: "User",
      createdAt: new Date().toISOString(),
    },
    organization: { id: "o1", name: "Org", createdAt: new Date().toISOString() },
    role: "OWNER",
  }),
  login: jest.fn().mockRejectedValue(new Error("not needed for this test")),
};

describe("Auth security (guard + rate limiting)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [() => TEST_ENV] }),
        // Tight limit so the test doesn't need to fire hundreds of requests.
        ThrottlerModule.forRoot([{ name: "default", ttl: 60_000, limit: 5 }]),
        AuthModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    })
      .overrideProvider(AuthService)
      .useValue(fakeAuthService)
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();

    jwtService = new JwtService();
  });

  afterAll(async () => {
    await app.close();
  });

  function signAccessToken(payload: AuthenticatedUser): string {
    return jwtService.sign(payload, {
      secret: TEST_ENV.JWT_ACCESS_SECRET,
      expiresIn: TEST_ENV.JWT_ACCESS_TTL_SECONDS,
    });
  }

  describe("JwtAuthGuard", () => {
    it("rejects a request with no access token", async () => {
      await request(app.getHttpServer()).get("/api/v1/auth/me").expect(401);
    });

    it("rejects a request with an invalid access token", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/auth/me")
        .set("Cookie", "access_token=not-a-real-token")
        .expect(401);
    });

    it("accepts a request with a valid access token", async () => {
      const token = signAccessToken({
        sub: "u1",
        email: "user@example.com",
        organizationId: "o1",
        role: "OWNER",
      });

      const response = await request(app.getHttpServer())
        .get("/api/v1/auth/me")
        .set("Cookie", `access_token=${token}`)
        .expect(200);

      expect(response.body.data.user.email).toBe("user@example.com");
    });
  });

  describe("GoogleAuthGuard", () => {
    it("returns 501 when Google credentials are not configured", async () => {
      // TEST_ENV has no GOOGLE_CLIENT_ID — GoogleAuthGuard must catch that
      // itself via ConfigService, not rely on the strategy being absent
      // (it's always registered; see google.strategy.ts).
      await request(app.getHttpServer()).get("/api/v1/auth/google").expect(501);
    });
  });

  describe("rate limiting", () => {
    it("throttles repeated requests to the login endpoint", async () => {
      const server = app.getHttpServer();
      const attempts = Array.from({ length: 6 }, () =>
        request(server)
          .post("/api/v1/auth/login")
          .send({ email: "x@example.com", password: "whatever1" }),
      );
      const responses = await Promise.all(attempts.map((req) => req.then((r) => r.status)));

      // 5 requests fit the limit (each fails for business reasons, not
      // throttling); the 6th within the same window must be throttled.
      expect(responses.filter((status) => status === 429).length).toBeGreaterThanOrEqual(1);
    });
  });
});
