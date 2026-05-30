import { describe, expect, it } from "vitest";

import { NAV_ITEMS } from "@/lib/mock/navigation";
import { ROUTES } from "@/lib/constants/routes";

describe("primary navigation", () => {
  it("includes the eight primary areas in order", () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      "Dashboard",
      "Agents",
      "Prompts",
      "Deployments",
      "Governance",
      "Observability",
      "Audit",
      "Settings",
    ]);
  });

  it("links every item to a known route", () => {
    const routeValues = Object.values(ROUTES);
    for (const item of NAV_ITEMS) {
      expect(routeValues).toContain(item.href);
    }
  });

  it("gives every item an icon and a description", () => {
    for (const item of NAV_ITEMS) {
      expect(item.icon).toBeTypeOf("object");
      expect(item.description.length).toBeGreaterThan(0);
    }
  });
});
