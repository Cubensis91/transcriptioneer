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
        { day: "Lun", hours: 1.2 },
        { day: "Mar", hours: 2.4 },
        { day: "Mié", hours: 0.8 },
        { day: "Jue", hours: 3.1 },
        { day: "Vie", hours: 2.9 },
        { day: "Sáb", hours: 0.4 },
        { day: "Dom", hours: 1.1 },
      ],
      surfaced: [
        {
          id: "i-1",
          kind: "contradiction",
          text: "La sincronización de la hoja de ruta del Q3 dice que la recuperación se lanza antes que el chat, pero el cuestionario del proveedor indica que el chat es un requisito previo para la revisión SOC 2.",
          source: "Sincronización de la hoja de ruta del Q3 · Cuestionario de seguridad de proveedores",
        },
        {
          id: "i-2",
          kind: "gap",
          text: "Una decisión del 18 de julio (exigir el SOC 2 antes de renovar) sigue sin tener un responsable asignado tres semanas después.",
          source: "Decisiones",
        },
        {
          id: "i-3",
          kind: "trend",
          text: "\"Calidad de recuperación\" se ha mencionado en 4 de tus últimos 6 documentos — se está volviendo un tema recurrente en Respira.",
          source: "Temas",
        },
        {
          id: "i-4",
          kind: "connection",
          text: "Elena Marsh y Priya Natarajan aparecen juntas en 3 documentos este mes, pero no han tenido ninguna llamada juntas según tu calendario.",
          source: "Personas",
        },
      ],
    };
  }
}

export const insightsService: InsightsService = new MockInsightsService();
