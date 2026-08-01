/**
 * InsightsService — weekly activity + surfaced ideas. Real implementation
 * later aggregates KnowledgeItem/Chunk rows per ARCHITECTURE.md §4.
 */

export type WeeklyPoint = { day: string; hours: number };

export type SurfacedInsight = {
  id: string;
  kind: "trend" | "gap" | "contradiction" | "connection";
  text: string;
  source: string;
};

export type InsightsSummary = {
  documentsProcessed: number;
  hoursTranscribed: number;
  ideasExtracted: number;
  connectionsCreated: number;
  weekly: WeeklyPoint[];
  surfaced: SurfacedInsight[];
};

export interface InsightsService {
  getSummary(): Promise<InsightsSummary>;
}

class MockInsightsService implements InsightsService {
  async getSummary(): Promise<InsightsSummary> {
    return {
      documentsProcessed: 42,
      hoursTranscribed: 18.6,
      ideasExtracted: 231,
      connectionsCreated: 57,
      weekly: [
        { day: "Mon", hours: 1.2 },
        { day: "Tue", hours: 2.4 },
        { day: "Wed", hours: 0.8 },
        { day: "Thu", hours: 3.1 },
        { day: "Fri", hours: 2.9 },
        { day: "Sat", hours: 0.4 },
        { day: "Sun", hours: 1.1 },
      ],
      surfaced: [
        {
          id: "i-1",
          kind: "contradiction",
          text: "The Q3 roadmap sync says retrieval ships before chat, but the vendor questionnaire notes chat as a prerequisite for the SOC 2 review.",
          source: "Q3 roadmap sync · Vendor security questionnaire",
        },
        {
          id: "i-2",
          kind: "gap",
          text: "A decision from Jul 18 (require SOC 2 before renewal) still has no owner assigned three weeks later.",
          source: "Decisions",
        },
        {
          id: "i-3",
          kind: "trend",
          text: "\"Retrieval quality\" has been mentioned in 4 of your last 6 documents — it's becoming a recurring theme across Respira.",
          source: "Topics",
        },
        {
          id: "i-4",
          kind: "connection",
          text: "Elena Marsh and Priya Natarajan appear together in 3 documents this month but haven't been on a call together per your calendar.",
          source: "People",
        },
      ],
    };
  }
}

export const insightsService: InsightsService = new MockInsightsService();
