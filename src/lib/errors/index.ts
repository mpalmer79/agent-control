// Typed application errors for Agent Control.
//
// Errors carry a stable machine code, a safe client message, an HTTP status,
// and optional safe details. They never carry secrets or internal database
// details. The API layer maps these to the standard error response shape.

export type ErrorCode =
  | "validation_error"
  | "not_found"
  | "unauthorized"
  | "forbidden"
  | "conflict"
  | "persistence_error"
  | "internal_error";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Request validation failed",
    details?: Record<string, unknown>,
  ) {
    super("validation_error", message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required") {
    super("unauthorized", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource") {
    super("forbidden", message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super("not_found", message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "The request conflicts with the current state") {
    super("conflict", message, 409);
  }
}

export class PersistenceError extends AppError {
  constructor(message = "A persistence error occurred") {
    // The message is intentionally generic. Underlying database details are
    // logged server-side, never returned to the client.
    super("persistence_error", message, 500);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// Convert any thrown value into a safe AppError without leaking internals.
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  return new AppError("internal_error", "An unexpected error occurred", 500);
}
