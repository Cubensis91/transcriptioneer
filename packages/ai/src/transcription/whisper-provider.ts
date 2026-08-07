import { spawn } from "node:child_process";
import type { TranscriptionProvider, TranscriptionResult } from "./types";

export type LocalWhisperConfig = {
  /** Path to the venv's python3 binary — see WHISPER_SETUP.md. */
  pythonBin: string;
  /** Path to transcribe.py. */
  scriptPath: string;
  /** "base" in production (measured ~2.7x realtime on the VPS's 1 vCPU,
   * 708MB peak RSS — see WHISPER_SETUP.md); "tiny" trades accuracy for
   * speed if ever needed. */
  model: string;
};

type WhisperStdout = {
  text: string;
  language?: string;
  segments?: Array<{ start: number; end: number; text: string }>;
};

/** Shells out to transcribe.py per the contract documented in
 * WHISPER_SETUP.md: stdout is a single JSON object on success, stdout is
 * `{"error": "..."}` with a non-zero exit code on failure, stderr carries
 * Whisper's own progress noise (ignored except for error diagnostics).
 *
 * `nice`/`ionice` wrap the process on Linux specifically because the VPS
 * this runs on has exactly 1 vCPU (WHISPER_SETUP.md) — a transcription job
 * must never starve the API's own request handling on the same box.
 * Skipped on other platforms (dev sandboxes) where neither exists. */
export class LocalWhisperProvider implements TranscriptionProvider {
  constructor(private readonly config: LocalWhisperConfig) {}

  transcribe(filePath: string): Promise<TranscriptionResult> {
    const args = [this.config.scriptPath, filePath, "--model", this.config.model];
    const [command, commandArgs] =
      process.platform === "linux"
        ? ["ionice", ["-c2", "-n7", "nice", "-n10", this.config.pythonBin, ...args]]
        : [this.config.pythonBin, args];

    return new Promise((resolve, reject) => {
      const child = spawn(command, commandArgs);
      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf8");
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8");
      });
      child.on("error", (err) => {
        reject(new Error(`Failed to start Whisper process: ${err.message}`));
      });
      child.on("close", (code) => {
        if (code !== 0) {
          const parsedError = tryParseError(stdout);
          reject(
            new Error(
              parsedError ?? `Whisper exited with code ${code}: ${stderr.slice(-500) || "no stderr output"}`,
            ),
          );
          return;
        }
        try {
          const parsed = JSON.parse(stdout) as WhisperStdout;
          resolve({
            text: parsed.text,
            language: parsed.language ?? null,
            segments: (parsed.segments ?? []).map((s) => ({ start: s.start, end: s.end, text: s.text })),
          });
        } catch (err) {
          reject(new Error(`Failed to parse Whisper output as JSON: ${(err as Error).message}`));
        }
      });
    });
  }
}

function tryParseError(stdout: string): string | undefined {
  try {
    const parsed = JSON.parse(stdout) as { error?: string };
    return parsed.error;
  } catch {
    return undefined;
  }
}
