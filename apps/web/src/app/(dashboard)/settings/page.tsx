"use client";

import { Avatar, Card, CardContent, Input, Label, Switch } from "@transcriptioneer/ui";
import { useState } from "react";
import { PanelChromeHeader } from "@/components/chrome/panel-chrome-header";
import { TopNav } from "@/components/navigation/top-nav";

export default function SettingsPage() {
  const [autoSummaries, setAutoSummaries] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <>
      <TopNav />
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 pb-24 sm:px-8 lg:pb-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-medium text-text">Configuración</h1>
            <p className="text-sm text-text-muted">Tu cuenta y cómo se comporta tu escriba.</p>
          </div>

          <Card>
            <PanelChromeHeader title="Perfil" />
            <CardContent className="flex items-center gap-4 pt-5">
              <Avatar name="Elena Marsh" size="lg" />
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" defaultValue="Elena Marsh" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="org">Organización</Label>
                  <Input id="org" defaultValue="Respira Labs" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <PanelChromeHeader title="Preferencias" />
            <CardContent className="flex flex-col gap-4 pt-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text">Resúmenes automáticos</p>
                  <p className="text-xs text-text-subtle">Resume cada documento en cuanto se procese.</p>
                </div>
                <Switch checked={autoSummaries} onCheckedChange={setAutoSummaries} aria-label="Resúmenes automáticos" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text">Resumen semanal</p>
                  <p className="text-xs text-text-subtle">Un correo los lunes con lo que tu escriba notó la semana pasada.</p>
                </div>
                <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} aria-label="Resumen semanal" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <PanelChromeHeader title="Almacenamiento" />
            <CardContent className="pt-5">
              <p className="text-sm text-text-muted">2.4 GB de 10 GB usados</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                <div className="h-full w-[24%] rounded-full bg-accent-solid" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
