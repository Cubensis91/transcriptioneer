import type { CSSProperties } from "react";
import { BrandLockup, BrandMark, Wordmark } from "@/components/brand-mark";
import { ScribeMark } from "@/components/scribe-mark";
import { Section, SubLabel } from "./section";

const neutralSwatches = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const accentSwatches = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const semanticSwatches = [
  { name: "Success", varName: "success" },
  { name: "Warning", varName: "warning" },
  { name: "Error", varName: "error" },
  { name: "Info", varName: "info" },
];

function Swatch({ label, style }: { label: string; style: CSSProperties }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-14 w-full rounded-md border border-border" style={style} />
      <span className="text-xs text-text-subtle">{label}</span>
    </div>
  );
}

export function BrandSection() {
  return (
    <Section
      id="brand"
      title="Brand"
      description="An arched doorway/portal glyph — the motif every reference mockup uses, and a literal echo of the intake experience's 'a threshold, not a button' framing."
    >
      <div className="flex flex-col gap-10">
        <div>
          <SubLabel>Marks</SubLabel>
          <div className="flex flex-wrap items-center gap-8 rounded-lg border border-border bg-surface p-6">
            <div className="flex flex-col items-center gap-2">
              <BrandMark className="size-12" />
              <span className="text-xs text-text-subtle">Brand mark</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Wordmark className="text-2xl" />
              <span className="text-xs text-text-subtle">Wordmark</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BrandLockup />
              <span className="text-xs text-text-subtle">Lockup</span>
            </div>
          </div>
        </div>

        <div>
          <SubLabel>Scribe (placeholder character)</SubLabel>
          <div className="flex flex-wrap items-center gap-8 rounded-lg border border-border bg-surface p-6">
            <div className="flex flex-col items-center gap-2">
              <ScribeMark />
              <span className="text-xs text-text-subtle">Idle</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScribeMark state="analyzing" />
              <span className="text-xs text-text-subtle">Active (eyes pulse)</span>
            </div>
          </div>
        </div>

        <div>
          <SubLabel>Accent — “signal”</SubLabel>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
            {accentSwatches.map((step) => (
              <Swatch
                key={step}
                label={String(step)}
                style={{ background: `var(--accent-${step})` }}
              />
            ))}
          </div>
        </div>

        <div>
          <SubLabel>Neutral — warm ink</SubLabel>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
            {neutralSwatches.map((step) => (
              <Swatch
                key={step}
                label={String(step)}
                style={{ background: `var(--neutral-${step})` }}
              />
            ))}
          </div>
        </div>

        <div>
          <SubLabel>Semantic</SubLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {semanticSwatches.map((s) => (
              <Swatch key={s.name} label={s.name} style={{ background: `var(--${s.varName}-500)` }} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
