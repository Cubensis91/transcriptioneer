import { Controller, Get } from "@nestjs/common";
import type { ApiResponse, HealthStatus } from "@transcriptioneer/types";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<ApiResponse<HealthStatus>> {
    const data = await this.healthService.check();
    return { success: true, data };
  }
}
