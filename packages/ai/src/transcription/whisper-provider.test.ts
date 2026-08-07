import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";

const spawnMock = vi.fn();
vi.mock("node:child_process", () => ({ spawn: (...args: unknown[]) => spawnMock(...args) }));

import { LocalWhisperProvider } from "./whisper-provider";

class FakeChildProcess extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
}

function makeFakeChild(): FakeChildProcess {
  const child = new FakeChildProcess();
  spawnMock.mockReturnValue(child);
  return child;
}

const CONFIG = { pythonBin: "/fake/venv/python3", scriptPath: "/fake/transcribe.py", model: "base" };

describe("LocalWhisperProvider", () => {
  beforeEach(() => {
    spawnMock.mockReset();
  });

  it("parses a successful stdout JSON payload", async () => {
    const child = makeFakeChild();
    const provider = new LocalWhisperProvider(CONFIG);

    const promise = provider.transcribe("/tmp/audio.mp3");
    child.stdout.emit(
      "data",
      Buffer.from(
        JSON.stringify({
          text: "Hello world.",
          language: "en",
          segments: [{ start: 0, end: 1.2, text: "Hello world." }],
        }),
      ),
    );
    child.emit("close", 0);

    await expect(promise).resolves.toEqual({
      text: "Hello world.",
      language: "en",
      segments: [{ start: 0, end: 1.2, text: "Hello world." }],
    });
  });

  it("defaults language/segments when Whisper omits them", async () => {
    const child = makeFakeChild();
    const provider = new LocalWhisperProvider(CONFIG);

    const promise = provider.transcribe("/tmp/audio.mp3");
    child.stdout.emit("data", Buffer.from(JSON.stringify({ text: "Hi." })));
    child.emit("close", 0);

    await expect(promise).resolves.toEqual({ text: "Hi.", language: null, segments: [] });
  });

  it("rejects with the JSON error payload on a non-zero exit", async () => {
    const child = makeFakeChild();
    const provider = new LocalWhisperProvider(CONFIG);

    const promise = provider.transcribe("/tmp/corrupt.mp3");
    child.stdout.emit("data", Buffer.from(JSON.stringify({ error: "Could not decode audio." })));
    child.emit("close", 1);

    await expect(promise).rejects.toThrow("Could not decode audio.");
  });

  it("rejects with stderr context when stdout isn't valid JSON on failure", async () => {
    const child = makeFakeChild();
    const provider = new LocalWhisperProvider(CONFIG);

    const promise = provider.transcribe("/tmp/audio.mp3");
    child.stderr.emit("data", Buffer.from("Traceback: something broke"));
    child.emit("close", 1);

    await expect(promise).rejects.toThrow(/Traceback: something broke/);
  });

  it("rejects if the process itself fails to start", async () => {
    const child = makeFakeChild();
    const provider = new LocalWhisperProvider(CONFIG);

    const promise = provider.transcribe("/tmp/audio.mp3");
    child.emit("error", new Error("ENOENT"));

    await expect(promise).rejects.toThrow("Failed to start Whisper process: ENOENT");
  });

  it("wraps the command with ionice/nice on Linux", () => {
    const child = makeFakeChild();
    const provider = new LocalWhisperProvider(CONFIG);
    void provider.transcribe("/tmp/audio.mp3");
    child.stdout.emit("data", Buffer.from(JSON.stringify({ text: "x" })));
    child.emit("close", 0);

    if (process.platform === "linux") {
      expect(spawnMock).toHaveBeenCalledWith(
        "ionice",
        expect.arrayContaining(["-c2", "-n7", "nice", "-n10", CONFIG.pythonBin, CONFIG.scriptPath]),
      );
    } else {
      expect(spawnMock).toHaveBeenCalledWith(CONFIG.pythonBin, expect.arrayContaining([CONFIG.scriptPath]));
    }
  });
});
