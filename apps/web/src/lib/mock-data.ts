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
  kind: "audio" | "pdf" | "docx" | "txt" | "md";
  stage: ProcessingStage;
  updatedAt: string;
  durationOrPages: string;
  summary: string;
  project: string;
};

export const mockDocuments: MockDocument[] = [
  {
    id: "doc-1",
    title: "Q3 roadmap sync",
    kind: "audio",
    stage: "completed",
    updatedAt: "2h ago",
    durationOrPages: "34 min",
    summary:
      "Team aligned on shipping the retrieval pipeline before the knowledge chat surfaces in the product.",
    project: "Respira",
  },
  {
    id: "doc-2",
    title: "Vendor security questionnaire",
    kind: "pdf",
    stage: "analyzing",
    updatedAt: "12m ago",
    durationOrPages: "18 pages",
    summary: "Extracted clauses on data residency are pending classification.",
    project: "Procurement",
  },
  {
    id: "doc-3",
    title: "Client onboarding notes",
    kind: "docx",
    stage: "completed",
    updatedAt: "yesterday",
    durationOrPages: "6 pages",
    summary: "Onboarding checklist finalized; two open questions about billing cadence.",
    project: "Acme Co.",
  },
  {
    id: "doc-4",
    title: "Standup — August 4",
    kind: "audio",
    stage: "transcribing",
    updatedAt: "3m ago",
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
  { id: "t-1", title: "Send updated MSA to legal", done: false, due: "Fri", project: "Acme Co." },
  { id: "t-2", title: "Confirm retention window with vendor", done: false, due: "Mon", project: "Procurement" },
  { id: "t-3", title: "Draft chat citation UX spec", done: true, project: "Respira" },
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
    text: "Ship retrieval on pgvector before evaluating a dedicated vector store.",
    date: "Jul 22",
    project: "Respira",
  },
  {
    id: "d-2",
    text: "Require SOC 2 report before renewing the contract.",
    date: "Jul 18",
    project: "Procurement",
  },
];

export type MockPerson = {
  name: string;
  role: string;
  mentions: number;
};

export const mockPeople: MockPerson[] = [
  { name: "Elena Marsh", role: "Product", mentions: 14 },
  { name: "Juan Delgado", role: "Finance", mentions: 9 },
  { name: "Priya Natarajan", role: "Legal", mentions: 5 },
];

export type MockTopic = { name: string; count: number };

export const mockTopics: MockTopic[] = [
  { name: "Retrieval quality", count: 11 },
  { name: "Billing cadence", count: 6 },
  { name: "Data residency", count: 4 },
  { name: "Onboarding", count: 3 },
];

export const mockKeywords = [
  "pgvector",
  "citations",
  "retention window",
  "SOC 2",
  "chunking",
  "MSA",
];

export const mockOrganizations = ["Acme Co.", "Northwind Vendors", "Respira Labs"];
export const mockLocations = ["Madrid office", "Remote — LatAm"];
export const mockImportantDates = ["Aug 4, 2026 — Standup", "Sep 1, 2026 — MSA renewal"];

export const mockQuestions = [
  "What's the fallback if the vendor won't share their SOC 2 report?",
  "Do we need per-project retention windows or one global default?",
];

export const mockFacts = [
  "The vendor's data center is in Frankfurt, not Dublin as previously assumed.",
  "Current retention window defaults to 90 days across all projects.",
];

export const mockQuotes: { text: string; speaker: string }[] = [
  { text: "We should treat retrieval quality as the whole product, not a feature.", speaker: "Elena Marsh" },
  { text: "I'd rather renew late than renew without the SOC 2 report.", speaker: "Priya Natarajan" },
];

export const mockTags = ["priority", "needs-review", "client-facing", "infra"];

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
