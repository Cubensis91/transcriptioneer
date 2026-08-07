import { ConfigService } from "@nestjs/config";
import { LocalWhisperProvider, type TranscriptionProvider } from "@transcriptioneer/ai";
import type { Env } from "../config/env.validation";

export const WHISPER_PROVIDER = "WHISPER_PROVIDER";

// Null (not a throwing stub) when unconfigured, same pattern as
// StorageService/GoogleStrategy: the app must boot cleanly without Whisper
// installed. TranscriptionProcessor checks for null and fails the job with
// a clear message instead of crashing the worker.
export const whisperProviderFactory = {
  provide: WHISPER_PROVIDER,
  useFactory: (configService: ConfigService<Env, true>): TranscriptionProvider | null => {
    const pythonBin = configService.get("WHISPER_PYTHON_BIN", { infer: true });
    const scriptPath = configService.get("WHISPER_SCRIPT_PATH", { infer: true });
    if (!pythonBin || !scriptPath) return null;
    return new LocalWhisperProvider({
      pythonBin,
      scriptPath,
      model: configService.get("WHISPER_MODEL", { infer: true }),
    });
  },
  inject: [ConfigService],
};
