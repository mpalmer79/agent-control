import { afterEach, describe, expect, it, vi } from "vitest";

import { logger } from "@/lib/observability/logger";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("structured logger", () => {
  it("emits a JSON line with service, level, and message", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("hello", { correlationId: "corr-1" });
    expect(spy).toHaveBeenCalledTimes(1);
    const line = spy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(line);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("hello");
    expect(parsed.correlationId).toBe("corr-1");
    expect(parsed.service).toBeTruthy();
  });

  it("redacts sensitive keys", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("boom", { secret: "do-not-log", token: "nope" });
    const parsed = JSON.parse(spy.mock.calls[0]?.[0] as string);
    expect(parsed.secret).toBe("[redacted]");
    expect(parsed.token).toBe("[redacted]");
  });
});
