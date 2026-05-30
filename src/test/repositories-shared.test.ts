import { describe, expect, it } from "vitest";

import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  clampLimit,
  tenantWhere,
} from "@/server/repositories/shared";

describe("repository shared helpers", () => {
  it("clamps limits into the allowed range", () => {
    expect(clampLimit()).toBe(DEFAULT_PAGE_SIZE);
    expect(clampLimit(0)).toBe(DEFAULT_PAGE_SIZE);
    expect(clampLimit(-5)).toBe(DEFAULT_PAGE_SIZE);
    expect(clampLimit(10)).toBe(10);
    expect(clampLimit(10_000)).toBe(MAX_PAGE_SIZE);
  });

  it("always scopes queries by organization", () => {
    expect(tenantWhere("org-1")).toEqual({ organizationId: "org-1" });
    expect(tenantWhere("org-1", { status: "ACTIVE" })).toEqual({
      status: "ACTIVE",
      organizationId: "org-1",
    });
  });
});
