import { ApiError } from "@/lib/api";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function authErrorMessage(error: unknown, auth: Dictionary["auth"]): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return auth.errorInvalidCredentials;
    if (error.status === 409) return auth.errorEmailTaken;
    if (error.status === 429) return auth.errorTooMany;
    if (error.status === 422) return error.detail || auth.errorGeneric;
  }
  return auth.errorGeneric;
}
