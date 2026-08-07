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
