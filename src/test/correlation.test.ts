import { describe, expect, it } from "vitest";

import {
  CORRELATION_HEADER,
  generateCorrelationId,
  getCorrelationId,
} from "@/lib/observability/correlation";

describe("correlation id utility", () => {
  it("uses a stable header name", () => {
    expect(CORRELATION_HEADER).toBe("x-correlation-id");
  });

  it("reads an incoming correlation id from headers", () => {
    const headers = new Headers({ [CORRELATION_HEADER]: "given-id" });
    expect(getCorrelationId(headers)).toBe("given-id");
  });

  it("generates an id when none is present", () => {
    const id = getCorrelationId(new Headers());
    expect(id.length).toBeGreaterThan(0);
  });

  it("generates unique ids", () => {
    expect(generateCorrelationId()).not.toBe(generateCorrelationId());
  });
});
