/**
 * ProjectsService — groupings of documents. Real implementation later reads
 * the `Project` table (ARCHITECTURE.md §4).
 */
import { mockDocuments } from "@/lib/mock-data";

export type MockProject = {
  id: string;
  name: string;
  description: string;
  progress: number;
  documentCount: number;
  members: string[];
};

export interface ProjectsService {
  listProjects(): Promise<MockProject[]>;
}

class MockProjectsService implements ProjectsService {
  async listProjects(): Promise<MockProject[]> {
    const byProject = new Map<string, number>();
    for (const doc of mockDocuments) {
      byProject.set(doc.project, (byProject.get(doc.project) ?? 0) + 1);
    }

    return [
      {
        id: "p-respira",
        name: "Respira",
        description: "Pipeline de recuperación y superficie del chat de conocimiento.",
        progress: 68,
        documentCount: byProject.get("Respira") ?? 0,
        members: ["Elena Marsh", "Juan Delgado"],
      },
      {
        id: "p-procurement",
        name: "Adquisiciones",
        description: "Revisión de seguridad de proveedores y seguimiento de la renovación del SOC 2.",
        progress: 34,
        documentCount: byProject.get("Adquisiciones") ?? 0,
        members: ["Priya Natarajan"],
      },
      {
        id: "p-acme",
        name: "Acme Co.",
        description: "Incorporación de clientes y alineación de la frecuencia de facturación.",
        progress: 82,
        documentCount: byProject.get("Acme Co.") ?? 0,
        members: ["Juan Delgado", "Elena Marsh"],
      },
    ];
  }
}

export const projectsService: ProjectsService = new MockProjectsService();
