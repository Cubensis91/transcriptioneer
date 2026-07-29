"use client";

import { ApiClientError, createApiClient } from "@transcriptioneer/api-client";
import type { HealthStatus } from "@transcriptioneer/types";
import { Button } from "@transcriptioneer/ui";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand-mark";

const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
});

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .request<HealthStatus>("/health")
      .then(setHealth)
      .catch((err: unknown) => {
        setError(err instanceof ApiClientError ? err.message : "API unreachable");
      });
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center bg-bg">
      <main className="flex w-full max-w-xl flex-col gap-6 rounded-xl border border-border bg-surface p-10 shadow-sm">
        <BrandLockup />
        <p className="text-text-muted">
          Milestone 2 — design system foundation. Product screens (dashboard, upload, library, chat)
          land starting Milestone 3.
        </p>
        <div className="rounded-lg border border-border bg-surface-raised p-4 font-mono text-sm">
          <p className="text-text-subtle">API health check</p>
          {health && (
            <p className="text-text">
              {health.status} · {health.service} · {health.timestamp}
            </p>
          )}
          {error && <p className="text-error">{error}</p>}
          {!health && !error && <p className="text-text-subtle">checking…</p>}
        </div>
        <Button asChild className="w-fit">
          <a href="/design-lab">View Design Lab</a>
        </Button>
      </main>
    </div>
  );
}
