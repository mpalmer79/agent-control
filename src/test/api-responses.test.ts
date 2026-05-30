import { describe, expect, it } from "vitest";

import { failure, success } from "@/lib/api/responses";

describe("API response helpers", () => {
  it("wraps success data in the standard envelope", async () => {
    const response = success({ value: 42 }, "corr-1");
    expect(response.status).toBe(200);
    expect(response.headers.get("x-correlation-id")).toBe("corr-1");
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      data: { value: 42 },
      meta: { correlationId: "corr-1" },
    });
  });

  it("includes extra meta when provided", async () => {
    const response = success([1, 2], "corr-2", { meta: { source: "mock" } });
    const body = await response.json();
    expect(body.meta).toEqual({ correlationId: "corr-2", source: "mock" });
  });

  it("formats error responses with a machine code", async () => {
    const response = failure(
      { code: "not_found", message: "Missing", status: 404 },
      "corr-3",
    );
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("not_found");
    expect(body.meta.correlationId).toBe("corr-3");
  });
});
