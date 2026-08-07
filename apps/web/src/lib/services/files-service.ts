import { createApiClient } from "@transcriptioneer/api-client";
import type { PresignUploadResponse, ProcessingJob, SourceFile, Transcript } from "@transcriptioneer/types";

// Same reasoning as auth-service.ts: file endpoints require the session
// cookie, so credentials: "include" is non-negotiable here.
const filesApiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  credentials: "include",
});

function putToStorage(url: string, file: File, onProgress?: (percent: number) => void): Promise<void> {
  // XHR, not fetch, specifically for upload progress events — fetch has no
  // upload-progress API.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Upload failed (network error)."));
    xhr.send(file);
  });
}

export const filesService = {
  /** Presign → direct-to-storage PUT → confirm. The API server's own bytes
   * are never in the path for the upload itself (ARCHITECTURE.md §5's
   * "presigned URL flow"). */
  async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<SourceFile> {
    const { file: sourceFile, uploadUrl } = await filesApiClient.request<PresignUploadResponse>(
      "/api/v1/files/presign",
      {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        }),
      },
    );

    await putToStorage(uploadUrl, file, onProgress);

    return filesApiClient.request<SourceFile>(`/api/v1/files/${sourceFile.id}/complete`, {
      method: "POST",
    });
  },

  list(): Promise<SourceFile[]> {
    return filesApiClient.request<SourceFile[]>("/api/v1/files");
  },

  remove(id: string): Promise<null> {
    return filesApiClient.request<null>(`/api/v1/files/${id}`, { method: "DELETE" });
  },

  /** Null for non-transcribable files (e.g. a PDF) or before the job's
   * been created yet — not an error, an expected state. */
  getJob(id: string): Promise<ProcessingJob | null> {
    return filesApiClient.request<ProcessingJob | null>(`/api/v1/files/${id}/job`);
  },

  getTranscript(id: string): Promise<Transcript | null> {
    return filesApiClient.request<Transcript | null>(`/api/v1/files/${id}/transcript`);
  },
};
