export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type HealthStatus = {
  status: "ok" | "degraded" | "down";
  service: string;
  timestamp: string;
};

export type OrgRole = "OWNER" | "ADMIN" | "MEMBER";

/** Public-safe shape — never includes the password hash. */
export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type Organization = {
  id: string;
  name: string;
  createdAt: string;
};

/** Response body for register/login/logout — tokens travel as httpOnly
 *  cookies, never in this JSON body (ARCHITECTURE.md §7's session model). */
export type AuthSession = {
  user: User;
  organization: Organization;
  role: OrgRole;
};

/** JWT access-token payload shape — what `req.user` looks like after the
 *  Passport JWT strategy validates a request. */
export type AuthenticatedUser = {
  sub: string;
  email: string;
  organizationId: string;
  role: OrgRole;
};

export type SourceFileStatus = "PENDING" | "UPLOADED" | "FAILED";

/** Never includes `storageKey` — clients never see the raw object key,
 *  only short-lived presigned URLs (ARCHITECTURE.md §7). */
export type SourceFile = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: SourceFileStatus;
  createdAt: string;
};

/** Response to `POST /api/v1/files/presign` — `uploadUrl` is a short-lived
 *  presigned PUT URL the browser uploads directly to (bypassing the API),
 *  then confirms via `POST /api/v1/files/:id/complete`. */
export type PresignUploadResponse = {
  file: SourceFile;
  uploadUrl: string;
};

export type ProcessingStage = "QUEUED" | "TRANSCRIBING" | "ANALYZING" | "COMPLETED" | "FAILED";

/** Only exists for audio/video SourceFiles — created the moment a
 *  transcription job is enqueued (ARCHITECTURE.md §6's state machine). */
export type ProcessingJob = {
  stage: ProcessingStage;
  errorMessage: string | null;
  attempts: number;
  updatedAt: string;
};

export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type Transcript = {
  text: string;
  language: string | null;
  segments: TranscriptSegment[];
  createdAt: string;
};

/** Milestone 6's structured AI output (ARCHITECTURE.md §4). Mirrors
 *  @transcriptioneer/ai's `AnalysisResult` shape, plus the persisted
 *  metadata (id/createdAt) — kept as a distinct type since `packages/ai`
 *  is server-only and this one is safe to send to the browser. */
export type KnowledgeItemMention = {
  name: string;
  context: string | null;
};

export type KnowledgeItemEventDate = {
  label: string;
  rawText: string;
  isoDate: string | null;
};

export type KnowledgeItemTask = {
  text: string;
  status: "OPEN" | "DONE";
  assignee: string | null;
};

export type KnowledgeItemQuote = {
  text: string;
  speaker: string | null;
};

export type KnowledgeItem = {
  id: string;
  title: string;
  summary: string;
  detailedSummary: string;
  topics: string[];
  keywords: string[];
  tags: string[];
  people: KnowledgeItemMention[];
  organizations: KnowledgeItemMention[];
  locations: KnowledgeItemMention[];
  eventDates: KnowledgeItemEventDate[];
  decisions: string[];
  tasks: KnowledgeItemTask[];
  questions: string[];
  openIssues: string[];
  facts: string[];
  quotes: KnowledgeItemQuote[];
  createdAt: string;
};
