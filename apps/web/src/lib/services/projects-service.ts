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
        description: "Retrieval pipeline and knowledge chat surface.",
        progress: 68,
        documentCount: byProject.get("Respira") ?? 0,
        members: ["Elena Marsh", "Juan Delgado"],
      },
      {
        id: "p-procurement",
        name: "Procurement",
        description: "Vendor security review and SOC 2 renewal tracking.",
        progress: 34,
        documentCount: byProject.get("Procurement") ?? 0,
        members: ["Priya Natarajan"],
      },
      {
        id: "p-acme",
        name: "Acme Co.",
        description: "Client onboarding and billing cadence alignment.",
        progress: 82,
        documentCount: byProject.get("Acme Co.") ?? 0,
        members: ["Juan Delgado", "Elena Marsh"],
      },
    ];
  }
}

export const projectsService: ProjectsService = new MockProjectsService();
