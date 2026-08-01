/**
 * AskService — chat over the knowledge base. Real implementation later hits
 * POST /api/v1/chat (RAG over Chunk embeddings, ARCHITECTURE.md §4/§5).
 * The mock answer is fixed and citation-shaped on purpose, so the message
 * bubble/citation UI never has to change when the real backend lands.
 */
import { mockDocuments } from "@/lib/mock-data";

export type ChatCitation = { documentId: string; documentTitle: string };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: ChatCitation[];
};

export interface AskService {
  ask(question: string): Promise<ChatMessage>;
}

class MockAskService implements AskService {
  async ask(question: string): Promise<ChatMessage> {
    await new Promise((r) => setTimeout(r, 500));
    const cited = mockDocuments.slice(0, 2);
    return {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: `Based on what you've shared with me, the retrieval pipeline is expected to ship before the knowledge chat surface, and the SOC 2 report is a hard requirement before renewing with Northwind Vendors. I don't have anything more recent than that on "${question}" yet — upload the latest notes and I'll fold them in.`,
      citations: cited.map((d) => ({ documentId: d.id, documentTitle: d.title })),
    };
  }
}

export const askService: AskService = new MockAskService();
