import { describe, expect, it } from "vitest";

import { getDemoPrincipal, getPrincipal } from "@/server/auth/principal";

describe("auth principal groundwork", () => {
  it("provides a safe demo principal without Clerk", async () => {
    const principal = await getPrincipal();
    expect(principal.isDemo).toBe(true);
    expect(principal.organizationSlug).toBeTruthy();
    expect(principal.role).toBe("administrator");
  });

  it("uses example email for the demo principal", () => {
    expect(getDemoPrincipal().email.endsWith("@example.com")).toBe(true);
  });
});
