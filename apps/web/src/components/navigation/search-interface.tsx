"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@transcriptioneer/ui";
import { FileAudio, FileText, User } from "lucide-react";
import { mockDocuments, mockPeople } from "@/lib/mock-data";

export function SearchInterface() {
  return (
    <Command className="w-full max-w-md rounded-lg border border-border shadow-sm">
      <CommandInput placeholder="Buscar documentos, personas, temas…" />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup heading="Documentos">
          {mockDocuments.slice(0, 2).map((doc) => (
            <CommandItem key={doc.id}>
              {doc.kind === "audio" ? (
                <FileAudio className="size-4 text-text-subtle" aria-hidden />
              ) : (
                <FileText className="size-4 text-text-subtle" aria-hidden />
              )}
              {doc.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Personas">
          {mockPeople.slice(0, 2).map((person) => (
            <CommandItem key={person.name}>
              <User className="size-4 text-text-subtle" aria-hidden />
              {person.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
