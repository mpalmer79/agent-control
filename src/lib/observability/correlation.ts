// Correlation ID utility.
//
// Every request carries a correlation ID that links logs, events, audit
// records, traces, costs, and incidents. This module reads an incoming ID from
// request headers when present, or generates a new one. This is groundwork for
// later distributed tracing; it intentionally stays small.

export const CORRELATION_HEADER = "x-correlation-id";

// Generate a new correlation ID. Uses the Web Crypto UUID when available and
// falls back to a timestamped random string.
export function generateCorrelationId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  return `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

// Read a correlation ID from a Headers object, generating one if absent.
export function getCorrelationId(headers?: Headers | null): string {
  const incoming = headers?.get(CORRELATION_HEADER);
  if (incoming && incoming.trim().length > 0) {
    return incoming.trim();
  }
  return generateCorrelationId();
}

// Read the correlation ID from a Request, generating one if absent.
export function correlationIdFromRequest(request: Request): string {
  return getCorrelationId(request.headers);
}
