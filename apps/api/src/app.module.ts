import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import Redis from "ioredis";
import type { Env } from "./config/env.validation";
import { validateEnv } from "./config/env.validation";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { FilesModule } from "./files/files.module";
import { TranscriptionModule } from "./transcription/transcription.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Generous global default; auth endpoints override it with a much
    // stricter per-route limit via @Throttle (see auth.controller.ts).
    ThrottlerModule.forRoot([{ name: "default", ttl: 60_000, limit: 100 }]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => ({
        // maxRetriesPerRequest: null is required by BullMQ's blocking
        // connection (used internally by Workers) — ioredis's default
        // retry behavior isn't compatible with it.
        connection: new Redis(configService.get("REDIS_URL", { infer: true }), {
          maxRetriesPerRequest: null,
        }),
      }),
    }),
    HealthModule,
    AuthModule,
    FilesModule,
    TranscriptionModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
