// Lightweight structured logger.
//
// Emits JSON-friendly log lines with a service name, level, message, optional
// correlation ID, and safe context fields. It never logs secrets and does not
// log full request bodies. Console-backed structured logging is sufficient for
// the MVP; a heavier platform can replace this later without changing callers.

import { PRODUCT } from "@/lib/constants/product";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  correlationId?: string;
  [key: string]: unknown;
}

const SERVICE = PRODUCT.repository;

// Keys that must never be logged, even if passed in context.
const REDACTED_KEYS = new Set([
  "password",
  "secret",
  "token",
  "apiKey",
  "authorization",
  "clerkSecretKey",
]);

function sanitize(context: LogContext): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (REDACTED_KEYS.has(key)) {
      safe[key] = "[redacted]";
      continue;
    }
    safe[key] = value;
  }
  return safe;
}

function write(
  level: LogLevel,
  message: string,
  context: LogContext = {},
): void {
  const entry = {
    level,
    service: SERVICE,
    message,
    timestamp: new Date().toISOString(),
    ...sanitize(context),
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) =>
    write("debug", message, context),
  info: (message: string, context?: LogContext) =>
    write("info", message, context),
  warn: (message: string, context?: LogContext) =>
    write("warn", message, context),
  error: (message: string, context?: LogContext) =>
    write("error", message, context),
};
