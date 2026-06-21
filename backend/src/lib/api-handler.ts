import { isApiError } from "@/lib/errors";
import { errorResponse } from "@/lib/response";

export function handleApiError(error: unknown, fallbackMessage: string) {
  if (isApiError(error)) {
    return errorResponse(error.message, error.status, error.errors);
  }

  return errorResponse(fallbackMessage, 500);
}
