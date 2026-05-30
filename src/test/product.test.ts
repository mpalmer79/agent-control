import { describe, expect, it } from "vitest";

import { PRODUCT } from "@/lib/constants/product";

describe("product constants", () => {
  it("uses Agent Control as the public product name", () => {
    expect(PRODUCT.name).toBe("Agent Control");
  });

  it("uses the locked tagline", () => {
    expect(PRODUCT.tagline).toBe(
      "Enterprise Control Plane for Production AI Agents",
    );
  });

  it("uses agent-control as the repository name", () => {
    expect(PRODUCT.repository).toBe("agent-control");
  });
});
