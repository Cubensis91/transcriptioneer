import { Alert, cn } from "@transcriptioneer/ui";
import { Check } from "lucide-react";
import type { FileVisualState } from "@/components/file-state/file-state-meta";

type StepKey = "receiving" | "processing" | "understanding" | "connecting" | "done";

const STEP_ORDER: StepKey[] = ["receiving", "processing", "understanding", "connecting", "done"];

const STEP_STATES: Record<StepKey, FileVisualState[]> = {
  receiving: ["selected", "uploading", "uploaded"],
  // Audio and document pipelines diverge here (ARCHITECTURE.md §6's
  // `extracting | transcribing` branch) — same step slot, kind-dependent
  // label/copy below.
  processing: ["queued", "processing", "extracting", "transcribing"],
  understanding: ["analyzing"],
  connecting: ["indexing"],
  done: ["completed"],
};

const STEP_COPY: Record<StepKey, { label: (kind: "audio" | "document") => string; narrative: (kind: "audio" | "document") => string }> = {
  receiving: { label: () => "Recibiendo", narrative: () => "Preparando tu archivo…" },
  processing: {
    label: (kind) => (kind === "audio" ? "Escuchando" : "Tomando notas"),
    narrative: (kind) => (kind === "audio" ? "Estoy escuchando…" : "Tomando notas…"),
  },
  understanding: { label: () => "Entendiendo", narrative: () => "Dándole sentido…" },
  connecting: { label: () => "Conectando", narrative: () => "Conectando las ideas…" },
  done: { label: () => "Listo", narrative: () => "Todo listo." },
};

function currentStepIndex(state: FileVisualState): number {
  const key = STEP_ORDER.find((step) => STEP_STATES[step].includes(state));
  return key ? STEP_ORDER.indexOf(key) : -1;
}

/**
 * The narrative process tracker (VISUAL_IDENTITY.md §4 "interface as
 * narrative") — mapped onto the real FileVisualState pipeline, not a
 * decorative step count. `kind` picks the audio vs. document framing at
 * the point where the two pipelines diverge.
 */
export function ProcessStepper({
  currentState,
  kind = "audio",
  className,
}: {
  currentState: FileVisualState;
  kind?: "audio" | "document";
  className?: string;
}) {
  if (currentState === "failed") {
    return (
      <Alert variant="error" title="Algo salió mal" className={className}>
        Tuvimos un contratiempo a mitad de camino — puedes reintentar desde donde se detuvo.
      </Alert>
    );
  }

  const activeIndex = currentStepIndex(currentState);

  return (
    <div className={cn("flex items-start justify-between gap-1", className)}>
      {STEP_ORDER.map((step, index) => {
        const done = activeIndex > index || currentState === "completed";
        const active = index === activeIndex && currentState !== "completed";
        const copy = STEP_COPY[step];

        return (
          <div key={step} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex w-full items-center">
              {index > 0 && (
                <div
                  className={cn("-ml-1 h-px flex-1", done || active ? "bg-accent-solid" : "bg-border")}
                  aria-hidden
                />
              )}
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-(--duration-base)",
                  done &&
                    "border-accent-solid bg-accent-solid bg-[image:var(--surface-gradient-accent)] text-text-on-accent shadow-sm",
                  active &&
                    "border-accent-solid bg-[image:var(--surface-gradient-raised)] text-accent shadow-[0_0_0_3px_var(--color-accent-subtle),var(--shadow-sm)]",
                  !done && !active && "border-border bg-surface-raised text-text-subtle",
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : <span className="text-xs font-semibold">{index + 1}</span>}
              </div>
              {index < STEP_ORDER.length - 1 && (
                <div className={cn("-mr-1 h-px flex-1", done ? "bg-accent-solid" : "bg-border")} aria-hidden />
              )}
            </div>
            <div className="hidden sm:block">
              <p className={cn("text-xs font-medium", active ? "text-text" : "text-text-muted")}>
                {copy.label(kind)}
              </p>
              {active && <p className="text-[11px] text-text-subtle">{copy.narrative(kind)}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
