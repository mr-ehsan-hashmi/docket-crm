export type ApiErrorCode = "network" | "not_found" | "storage";

export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.code === "not_found";
}

export function describeError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something unexpected went wrong. Try again in a moment.";
}
