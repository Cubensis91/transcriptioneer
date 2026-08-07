/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument --
   supertest's `.body` is untyped `any` by design. */
import { BullModule } from "@nestjs/bullmq";
import { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import type { AuthenticatedUser } from "@transcriptioneer/types";
import { JwtStrategy } from "../auth/jwt.strategy";
import { FilesModule } from "./files.module";
import { FilesService } from "./files.service";

// Regression test for a real bug: presign() combines @CurrentUser() (a
// custom param decorator, not pipe-exempt like @Req/@Res) with a Zod
// validation pipe on @Body(). Applying that pipe via a method-level
// @UsePipes() ran it against @CurrentUser()'s value too, always failing
// validation — caught only once this hit production. A pure
// FilesService unit test can't catch this; it's specifically about how
// the controller wires its params, so this goes over real HTTP.
const TEST_ENV = {
  JWT_ACCESS_SECRET: "test-access-secret-at-least-32-characters-long",
  JWT_ACCESS_TTL_SECONDS: 900,
};

const fakeFilesService: Partial<Record<keyof FilesService, jest.Mock>> = {
  presignUpload: jest.fn().mockResolvedValue({
    file: {
      id: "file-1",
      originalName: "notes.txt",
      mimeType: "text/plain",
      sizeBytes: 10,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    },
    uploadUrl: "https://storage.example/put",
  }),
};

describe("FilesController (presign wiring)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [() => TEST_ENV] }),
        PassportModule,
        // FilesModule pulls in TranscriptionModule (for the BullMQ queue
        // it enqueues jobs onto), which needs a root connection registered
        // somewhere in the tree. This never has to actually reach Redis —
        // ioredis connects lazily and nothing in these tests touches the
        // queue (FilesService is overridden below).
        BullModule.forRoot({ connection: { host: "127.0.0.1", port: 6379, lazyConnect: true } }),
        FilesModule,
      ],
      // JwtAuthGuard needs the "jwt" Passport strategy registered — normally
      // provided by AuthModule; provided directly here to keep this test
      // scoped to FilesModule without pulling in AuthService/Prisma.
      providers: [JwtStrategy],
    })
      .overrideProvider(FilesService)
      .useValue(fakeFilesService)
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();

    jwtService = new JwtService();
  });

  afterAll(async () => {
    await app.close();
  });

  function accessTokenCookie(payload: AuthenticatedUser): string {
    const token = jwtService.sign(payload, {
      secret: TEST_ENV.JWT_ACCESS_SECRET,
      expiresIn: TEST_ENV.JWT_ACCESS_TTL_SECONDS,
    });
    return `access_token=${token}`;
  }

  it("accepts a valid presign request from an authenticated user (not a 400)", async () => {
    const cookie = accessTokenCookie({
      sub: "user-1",
      email: "user@example.com",
      organizationId: "org-1",
      role: "OWNER",
    });

    const response = await request(app.getHttpServer())
      .post("/api/v1/files/presign")
      .set("Cookie", cookie)
      .send({ filename: "notes.txt", mimeType: "text/plain", sizeBytes: 10 })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.uploadUrl).toBe("https://storage.example/put");
  });

  it("still rejects an actually-invalid body with a 400", async () => {
    const cookie = accessTokenCookie({
      sub: "user-1",
      email: "user@example.com",
      organizationId: "org-1",
      role: "OWNER",
    });

    await request(app.getHttpServer())
      .post("/api/v1/files/presign")
      .set("Cookie", cookie)
      .send({ filename: "", mimeType: "application/x-msdownload", sizeBytes: -1 })
      .expect(400);
  });
});
