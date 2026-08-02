"use client";

import { Avatar, Card, CardContent, CardHeader, CardTitle, Progress } from "@transcriptioneer/ui";
import { useEffect, useState } from "react";
import { TopNav } from "@/components/navigation/top-nav";
import { type MockProject, projectsService } from "@/lib/services/projects-service";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<MockProject[]>([]);

  useEffect(() => {
    projectsService.listProjects().then(setProjects);
  }, []);

  return (
    <>
      <TopNav />
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 pb-24 sm:px-8 lg:pb-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-medium text-text">Proyectos</h1>
            <p className="text-sm text-text-muted">Documentos agrupados según su propósito real.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <p className="text-sm text-text-muted">{project.description}</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-text-subtle">
                    <span>
                      {project.documentCount} {project.documentCount === 1 ? "documento" : "documentos"}
                    </span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                  <div className="flex -space-x-2">
                    {project.members.map((name) => (
                      <Avatar key={name} name={name} size="sm" className="ring-2 ring-surface" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
