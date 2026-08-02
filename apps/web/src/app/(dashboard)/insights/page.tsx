"use client";

import { Card, CardContent } from "@transcriptioneer/ui";
import { GitBranch, Lightbulb, ScanSearch, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { PanelChromeHeader } from "@/components/chrome/panel-chrome-header";
import { TopNav } from "@/components/navigation/top-nav";
import { type InsightsSummary, insightsService } from "@/lib/services/insights-service";

const kindMeta: Record<InsightsSummary["surfaced"][number]["kind"], { label: string; icon: typeof Lightbulb }> = {
  trend: { label: "Tendencia", icon: TrendingUp },
  gap: { label: "Vacío", icon: ScanSearch },
  contradiction: { label: "Contradicción", icon: Lightbulb },
  connection: { label: "Conexión", icon: GitBranch },
};

export default function InsightsPage() {
  const [summary, setSummary] = useState<InsightsSummary | null>(null);

  useEffect(() => {
    insightsService.getSummary().then(setSummary);
  }, []);

  const maxHours = summary ? Math.max(...summary.weekly.map((w) => w.hours)) : 1;

  return (
    <>
      <TopNav />
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 pb-24 sm:px-8 lg:pb-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-medium text-text">Perspectivas</h1>
            <p className="text-sm text-text-muted">Lo que tu escriba ha notado, sin que se lo pidas.</p>
          </div>

          {!summary ? (
            <div className="h-40 animate-pulse rounded-lg bg-surface-raised" aria-hidden />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Documentos procesados", value: summary.documentsProcessed },
                  { label: "Horas transcritas", value: summary.hoursTranscribed },
                  { label: "Ideas extraídas", value: summary.ideasExtracted },
                  { label: "Conexiones creadas", value: summary.connectionsCreated },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="pt-5">
                      <p className="font-display text-2xl font-medium text-text">{stat.value}</p>
                      <p className="text-xs text-text-subtle">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <PanelChromeHeader title="Esta semana" />
                <CardContent className="pt-5">
                  <div className="flex h-32 items-end gap-3">
                    {summary.weekly.map((point) => (
                      <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-sm bg-accent-solid bg-[image:var(--surface-gradient-accent)]"
                          style={{ height: `${Math.max(6, (point.hours / maxHours) * 100)}%` }}
                          title={`${point.hours}h`}
                        />
                        <span className="text-xs text-text-subtle">{point.day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div>
                <h2 className="mb-3 font-display text-lg font-medium text-text">Destacado para ti</h2>
                <div className="flex flex-col gap-3">
                  {summary.surfaced.map((insight) => {
                    const meta = kindMeta[insight.kind];
                    const Icon = meta.icon;
                    return (
                      <Card key={insight.id}>
                        <CardContent className="flex gap-3 pt-5">
                          <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                          <div>
                            <p className="text-sm text-text">{insight.text}</p>
                            <p className="mt-1 text-xs text-text-subtle">
                              {meta.label} · {insight.source}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
