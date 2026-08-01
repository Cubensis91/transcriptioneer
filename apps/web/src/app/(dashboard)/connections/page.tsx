"use client";

import { Badge, Card, CardContent } from "@transcriptioneer/ui";
import { useEffect, useState } from "react";
import { PanelChromeHeader } from "@/components/chrome/panel-chrome-header";
import { TopNav } from "@/components/navigation/top-nav";
import { type ConnectionsGraph, connectionsService } from "@/lib/services/connections-service";

const typeColor: Record<string, string> = {
  person: "var(--color-accent)",
  topic: "var(--color-success)",
  organization: "var(--gold, var(--color-warning))",
  project: "var(--color-info)",
};

function GraphView({ graph }: { graph: ConnectionsGraph }) {
  const radius = 150;
  const center = { x: 200, y: 200 };
  const positioned = graph.nodes.map((node, i) => {
    const angle = (i / graph.nodes.length) * Math.PI * 2;
    return {
      ...node,
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  });
  const byId = new Map(positioned.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 400 400" className="mx-auto w-full max-w-xl">
      {graph.edges.map((edge, i) => {
        const a = byId.get(edge.source);
        const b = byId.get(edge.target);
        if (!a || !b) return null;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        );
      })}
      {positioned.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={8 + Math.min(node.weight, 14)}
            fill={typeColor[node.type]}
            opacity={0.85}
          />
          <text
            x={node.x}
            y={node.y + 22}
            textAnchor="middle"
            fontSize={10}
            fill="var(--color-text-muted)"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function ConnectionsPage() {
  const [graph, setGraph] = useState<ConnectionsGraph | null>(null);

  useEffect(() => {
    connectionsService.getGraph().then(setGraph);
  }, []);

  return (
    <>
      <TopNav />
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 pb-24 sm:px-8 lg:pb-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-medium text-text">Connections</h1>
            <p className="text-sm text-text-muted">
              How the people, topics, and organizations in your knowledge base relate.
            </p>
          </div>

          {!graph ? (
            <div className="h-96 animate-pulse rounded-lg bg-surface-raised" aria-hidden />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
              <Card>
                <PanelChromeHeader title="Graph" />
                <CardContent className="pt-5">
                  <GraphView graph={graph} />
                </CardContent>
              </Card>

              <Card>
                <PanelChromeHeader title="Strongest links" />
                <CardContent className="flex flex-col gap-3 pt-5">
                  {graph.edges.map((edge, i) => (
                    <div key={i} className="flex flex-col gap-1 text-sm">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="neutral">{edge.source.split("-").slice(1).join("-")}</Badge>
                        <span className="text-text-subtle">↔</span>
                        <Badge variant="neutral">{edge.target.split("-").slice(1).join("-")}</Badge>
                      </div>
                      <span className="text-xs text-text-subtle">via {edge.via}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
