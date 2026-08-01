/**
 * LibraryService — presentation reads from this interface, never from
 * mock-data.ts directly. Swapping `mockLibraryService` for a real
 * `apiLibraryService` (backed by GET /api/v1/library) later means changing
 * this file's export, not any page.
 */
import { type MockDocument, mockDocuments } from "@/lib/mock-data";

export type LibraryFilters = {
  query?: string;
  kind?: MockDocument["kind"] | "all";
};

export interface LibraryService {
  listDocuments(filters?: LibraryFilters): Promise<MockDocument[]>;
  getDocument(id: string): Promise<MockDocument | null>;
}

class MockLibraryService implements LibraryService {
  async listDocuments(filters: LibraryFilters = {}): Promise<MockDocument[]> {
    const { query, kind } = filters;
    return mockDocuments.filter((doc) => {
      const matchesKind = !kind || kind === "all" || doc.kind === kind;
      const matchesQuery =
        !query ||
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.summary.toLowerCase().includes(query.toLowerCase());
      return matchesKind && matchesQuery;
    });
  }

  async getDocument(id: string): Promise<MockDocument | null> {
    return mockDocuments.find((doc) => doc.id === id) ?? null;
  }
}

export const libraryService: LibraryService = new MockLibraryService();
