"use client";

import { Card, CardContent, EmptyState } from "@transcriptioneer/ui";
import { Waypoints } from "lucide-react";
import { PanelChromeHeader } from "@/components/chrome/panel-chrome-header";
import { TopNav } from "@/components/navigation/top-nav";

export default function ConnectionsPage() {
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

          <Card>
            <PanelChromeHeader title="Graph" />
            <CardContent className="pt-5">
              <EmptyState
                icon={<Waypoints className="size-8" aria-hidden />}
                title="Próximamente"
                description="En desarrollo — esta sección estará disponible en una próxima actualización."
                className="border-none py-20"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
