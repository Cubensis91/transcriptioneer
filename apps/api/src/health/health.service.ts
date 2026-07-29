import { Injectable } from "@nestjs/common";
import { prisma } from "@transcriptioneer/database";
import type { HealthStatus } from "@transcriptioneer/types";

@Injectable()
export class HealthService {
  async check(): Promise<HealthStatus> {
    const dbReachable = await this.pingDatabase();

    return {
      status: dbReachable ? "ok" : "degraded",
      service: "api",
      timestamp: new Date().toISOString(),
    };
  }

  private async pingDatabase(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
