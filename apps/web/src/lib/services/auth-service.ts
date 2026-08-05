import { createApiClient } from "@transcriptioneer/api-client";
import type { AuthSession } from "@transcriptioneer/types";
import type { LoginInput, RegisterInput } from "@transcriptioneer/validation";

// Distinct from the api-client instance in (dashboard)/page.tsx: the auth
// endpoints rely on httpOnly session cookies (see apps/api/src/auth/
// auth.controller.ts), so this one always sends `credentials: "include"`.
const authApiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  credentials: "include",
});

export function googleSignInUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return `${baseUrl}/api/v1/auth/google`;
}

export const authService = {
  register(input: RegisterInput): Promise<AuthSession> {
    return authApiClient.request<AuthSession>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  login(input: LoginInput): Promise<AuthSession> {
    return authApiClient.request<AuthSession>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  logout(): Promise<null> {
    return authApiClient.request<null>("/api/v1/auth/logout", { method: "POST" });
  },
  me(): Promise<AuthSession> {
    return authApiClient.request<AuthSession>("/api/v1/auth/me");
  },
};
