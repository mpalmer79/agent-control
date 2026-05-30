// Typed API response helpers.
//
// All API routes return a consistent envelope. Success responses carry data and
// meta (including the correlation ID). Error responses carry a machine code and
// a safe message. Internal stack traces are never exposed to clients.

import { NextResponse } from "next/server";

import { CORRELATION_HEADER } from "@/lib/observability/correlation";
import { type AppError, type ErrorCode, toAppError } from "@/lib/errors";

export interface ResponseMeta {
  correlationId: string;
  [key: string]: unknown;
}

export interface SuccessBody<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

export interface ErrorBody {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: ResponseMeta;
}

function withCorrelationHeader<T>(
  response: NextResponse<T>,
  correlationId: string,
): NextResponse<T> {
  response.headers.set(CORRELATION_HEADER, correlationId);
  return response;
}

export function success<T>(
  data: T,
  correlationId: string,
  init?: { status?: number; meta?: Record<string, unknown> },
): NextResponse<SuccessBody<T>> {
  const body: SuccessBody<T> = {
    success: true,
    data,
    meta: { correlationId, ...(init?.meta ?? {}) },
  };
  return withCorrelationHeader(
    NextResponse.json(body, { status: init?.status ?? 200 }),
    correlationId,
  );
}

export function failure(
  error: {
    code: ErrorCode;
    message: string;
    status: number;
    details?: Record<string, unknown>;
  },
  correlationId: string,
): NextResponse<ErrorBody> {
  const body: ErrorBody = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
    meta: { correlationId },
  };
  return withCorrelationHeader(
    NextResponse.json(body, { status: error.status }),
    correlationId,
  );
}

// Convert any AppError into the standard error response.
export function failureFromAppError(
  error: AppError,
  correlationId: string,
): NextResponse<ErrorBody> {
  return failure(
    {
      code: error.code,
      message: error.message,
      status: error.status,
      details: error.details,
    },
    correlationId,
  );
}

// Convenience helpers mirroring the common cases.
export const notFound = (message: string, correlationId: string) =>
  failure({ code: "not_found", message, status: 404 }, correlationId);

export const unauthorized = (message: string, correlationId: string) =>
  failure({ code: "unauthorized", message, status: 401 }, correlationId);

export const validationError = (
  message: string,
  correlationId: string,
  details?: Record<string, unknown>,
) =>
  failure(
    { code: "validation_error", message, status: 400, details },
    correlationId,
  );

export const serverError = (correlationId: string) =>
  failure(
    {
      code: "internal_error",
      message: "An unexpected error occurred",
      status: 500,
    },
    correlationId,
  );

// Map any thrown value to a safe error response.
export function failureFromUnknown(
  error: unknown,
  correlationId: string,
): NextResponse<ErrorBody> {
  return failureFromAppError(toAppError(error), correlationId);
}
