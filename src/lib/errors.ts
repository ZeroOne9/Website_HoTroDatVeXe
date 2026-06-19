export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
