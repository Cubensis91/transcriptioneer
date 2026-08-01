/**
 * ConnectionsService — the knowledge graph view. Real implementation later
 * queries the Person/Organization/Topic/Decision entity tables + their join
 * tables (ARCHITECTURE.md §4), not just document co-occurrence.
 */
import { mockOrganizations, mockPeople, mockTopics } from "@/lib/mock-data";

export type ConnectionNode = {
  id: string;
  label: string;
  type: "person" | "topic" | "organization" | "project";
  weight: number;
};

export type ConnectionEdge = {
  source: string;
  target: string;
  via: string;
};

export type ConnectionsGraph = {
  nodes: ConnectionNode[];
  edges: ConnectionEdge[];
};

export interface ConnectionsService {
  getGraph(): Promise<ConnectionsGraph>;
}

class MockConnectionsService implements ConnectionsService {
  async getGraph(): Promise<ConnectionsGraph> {
    const people: ConnectionNode[] = mockPeople.map((p) => ({
      id: `person-${p.name}`,
      label: p.name,
      type: "person",
      weight: p.mentions,
    }));
    const topics: ConnectionNode[] = mockTopics.map((t) => ({
      id: `topic-${t.name}`,
      label: t.name,
      type: "topic",
      weight: t.count,
    }));
    const orgs: ConnectionNode[] = mockOrganizations.map((o) => ({
      id: `org-${o}`,
      label: o,
      type: "organization",
      weight: 3,
    }));

    const edges: ConnectionEdge[] = [
      { source: "person-Elena Marsh", target: "topic-Retrieval quality", via: "Q3 roadmap sync" },
      { source: "person-Priya Natarajan", target: "topic-Data residency", via: "Vendor security questionnaire" },
      { source: "person-Juan Delgado", target: "topic-Billing cadence", via: "Client onboarding notes" },
      { source: "person-Elena Marsh", target: "org-Respira Labs", via: "3 documents" },
      { source: "person-Priya Natarajan", target: "org-Northwind Vendors", via: "Vendor security questionnaire" },
      { source: "topic-Retrieval quality", target: "org-Respira Labs", via: "4 documents" },
    ];

    return { nodes: [...people, ...topics, ...orgs], edges };
  }
}

export const connectionsService: ConnectionsService = new MockConnectionsService();
