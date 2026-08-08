import { ConfigService } from "@nestjs/config";
import { OpenAiAnalysisService, type AnalysisProvider } from "@transcriptioneer/ai";
import type { Env } from "../config/env.validation";

export const ANALYSIS_PROVIDER = "ANALYSIS_PROVIDER";

// Null (not a throwing stub) when unconfigured, same pattern as
// StorageService/GoogleStrategy/WHISPER_PROVIDER: the app must boot cleanly
// without an OpenAI key set. AnalysisProcessor checks for null and fails the
// job with a clear message instead of crashing the worker.
export const analysisProviderFactory = {
  provide: ANALYSIS_PROVIDER,
  useFactory: (configService: ConfigService<Env, true>): AnalysisProvider | null => {
    const apiKey = configService.get("OPENAI_API_KEY", { infer: true });
    if (!apiKey) return null;
    return new OpenAiAnalysisService({
      apiKey,
      model: configService.get("OPENAI_MODEL", { infer: true }),
    });
  },
  inject: [ConfigService],
};
