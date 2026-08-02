/**
 * Mock content for the Design Lab (Milestone 2) only. Not wired to the API —
 * see ARCHITECTURE.md §4/§6 for the real KnowledgeItem shape this stands in for.
 */

export type ProcessingStage =
  | "uploaded"
  | "validating"
  | "queued"
  | "processing"
  | "extracting"
  | "transcribing"
  | "analyzing"
  | "indexing"
  | "completed"
  | "failed";

export type MockDocument = {
  id: string;
  title: string;
  kind: "audio" | "video" | "pdf" | "docx" | "txt" | "md" | "image";
  stage: ProcessingStage;
  updatedAt: string;
  durationOrPages: string;
  summary: string;
  project: string;
};

export const mockDocuments: MockDocument[] = [
  {
    id: "doc-1",
    title: "Sincronización de la hoja de ruta del Q3",
    kind: "audio",
    stage: "completed",
    updatedAt: "hace 2 h",
    durationOrPages: "34 min",
    summary:
      "El equipo se alineó para lanzar el pipeline de recuperación antes de que el chat de conocimiento aparezca en el producto.",
    project: "Respira",
  },
  {
    id: "doc-2",
    title: "Cuestionario de seguridad de proveedores",
    kind: "pdf",
    stage: "analyzing",
    updatedAt: "hace 12 min",
    durationOrPages: "18 páginas",
    summary: "Las cláusulas extraídas sobre residencia de datos están pendientes de clasificación.",
    project: "Adquisiciones",
  },
  {
    id: "doc-3",
    title: "Notas de incorporación de clientes",
    kind: "docx",
    stage: "completed",
    updatedAt: "ayer",
    durationOrPages: "6 páginas",
    summary: "Lista de incorporación finalizada; quedan dos preguntas abiertas sobre la frecuencia de facturación.",
    project: "Acme Co.",
  },
  {
    id: "doc-4",
    title: "Standup — 4 de agosto",
    kind: "audio",
    stage: "transcribing",
    updatedAt: "hace 3 min",
    durationOrPages: "9 min",
    summary: "",
    project: "Respira",
  },
];

export type MockTask = {
  id: string;
  title: string;
  done: boolean;
  due?: string;
  project: string;
};

export const mockTasks: MockTask[] = [
  { id: "t-1", title: "Enviar el MSA actualizado a legal", done: false, due: "vie", project: "Acme Co." },
  { id: "t-2", title: "Confirmar la ventana de retención con el proveedor", done: false, due: "lun", project: "Adquisiciones" },
  { id: "t-3", title: "Redactar la especificación de UX para las citas del chat", done: true, project: "Respira" },
];

export type MockDecision = {
  id: string;
  text: string;
  date: string;
  project: string;
};

export const mockDecisions: MockDecision[] = [
  {
    id: "d-1",
    text: "Lanzar la recuperación sobre pgvector antes de evaluar un almacén de vectores dedicado.",
    date: "22 jul",
    project: "Respira",
  },
  {
    id: "d-2",
    text: "Exigir el informe SOC 2 antes de renovar el contrato.",
    date: "18 jul",
    project: "Adquisiciones",
  },
];

export type MockPerson = {
  name: string;
  role: string;
  mentions: number;
};

export const mockPeople: MockPerson[] = [
  { name: "Elena Marsh", role: "Producto", mentions: 14 },
  { name: "Juan Delgado", role: "Finanzas", mentions: 9 },
  { name: "Priya Natarajan", role: "Legal", mentions: 5 },
];

export type MockTopic = { name: string; count: number };

export const mockTopics: MockTopic[] = [
  { name: "Calidad de recuperación", count: 11 },
  { name: "Frecuencia de facturación", count: 6 },
  { name: "Residencia de datos", count: 4 },
  { name: "Incorporación", count: 3 },
];

export const mockKeywords = [
  "pgvector",
  "citas",
  "ventana de retención",
  "SOC 2",
  "fragmentación",
  "MSA",
];

export const mockOrganizations = ["Acme Co.", "Northwind Vendors", "Respira Labs"];
export const mockLocations = ["Oficina de Madrid", "Remoto — LatAm"];
export const mockImportantDates = ["4 de agosto de 2026 — Standup", "1 de septiembre de 2026 — Renovación del MSA"];

export const mockQuestions = [
  "¿Cuál es el plan alternativo si el proveedor no comparte su informe SOC 2?",
  "¿Necesitamos ventanas de retención por proyecto o un valor global por defecto?",
];

export const mockFacts = [
  "El centro de datos del proveedor está en Fráncfort, no en Dublín como se asumía antes.",
  "La ventana de retención actual es de 90 días por defecto en todos los proyectos.",
];

export const mockQuotes: { text: string; speaker: string }[] = [
  { text: "Deberíamos tratar la calidad de recuperación como el producto entero, no como una función más.", speaker: "Elena Marsh" },
  { text: "Prefiero renovar tarde que renovar sin el informe SOC 2.", speaker: "Priya Natarajan" },
];

export const mockTags = ["prioridad", "necesita-revisión", "cara-al-cliente", "infra"];

export type UploadQueueItem = {
  id: string;
  name: string;
  size: string;
  kind: MockDocument["kind"];
  stage: ProcessingStage;
  progress: number;
};

export const mockUploadQueue: UploadQueueItem[] = [
  { id: "u-1", name: "board-meeting.m4a", size: "42.1 MB", kind: "audio", stage: "uploaded", progress: 100 },
  { id: "u-2", name: "contract-draft.pdf", size: "1.8 MB", kind: "pdf", stage: "processing", progress: 62 },
  { id: "u-3", name: "interview-raw.wav", size: "118 MB", kind: "audio", stage: "queued", progress: 0 },
  { id: "u-4", name: "notes.md", size: "12 KB", kind: "md", stage: "failed", progress: 40 },
];
