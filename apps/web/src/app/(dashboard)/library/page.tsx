"use client";

import { Button, EmptyState, SearchInput } from "@transcriptioneer/ui";
import { Library as LibraryIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DocumentCard } from "@/components/cards/document-card";
import { TopNav } from "@/components/navigation/top-nav";
import { type MockDocument, mockDocuments } from "@/lib/mock-data";
import { libraryService } from "@/lib/services/library-service";

const kinds: { label: string; value: MockDocument["kind"] | "all" }[] = [
  { label: "Todo", value: "all" },
  { label: "Audio", value: "audio" },
  { label: "Video", value: "video" },
  { label: "PDF", value: "pdf" },
  { label: "Documentos", value: "docx" },
];

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MockDocument["kind"] | "all">("all");
  const [documents, setDocuments] = useState<MockDocument[]>(mockDocuments);

  useEffect(() => {
    libraryService.listDocuments({ query, kind }).then(setDocuments);
  }, [query, kind]);

  const hasResults = useMemo(() => documents.length > 0, [documents]);

  return (
    <>
      <TopNav />
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 pb-24 sm:px-8 lg:pb-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-medium text-text">Biblioteca</h1>
            <p className="text-sm text-text-muted">Todo lo que le has confiado a tu escriba, en un solo lugar.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              placeholder="Buscar títulos y resúmenes…"
              aria-label="Buscar en la biblioteca"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-md"
            />
            <div className="flex flex-wrap gap-2">
              {kinds.map((k) => (
                <Button
                  key={k.value}
                  size="sm"
                  variant={kind === k.value ? "tertiary" : "ghost"}
                  onClick={() => setKind(k.value)}
                >
                  {k.label}
                </Button>
              ))}
            </div>
          </div>

          {hasResults ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {documents.map((document) => (
                <Link key={document.id} href={`/library/${document.id}`} className="rounded-lg">
                  <DocumentCard document={document} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<LibraryIcon className="size-8" aria-hidden />}
              title="Todavía no hay coincidencias"
              description="Prueba con otro término de búsqueda o suelta un archivo nuevo en el panel para agregarlo a tu biblioteca."
            />
          )}
        </div>
      </main>
    </>
  );
}
