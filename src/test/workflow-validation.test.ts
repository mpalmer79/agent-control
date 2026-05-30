import { describe, expect, it } from "vitest";

import {
  approveSchema,
  rejectSchema,
  requestPromotionSchema,
  rollbackSchema,
} from "@/lib/validation";

describe("workflow request validation", () => {
  it("allows an optional reason on approve", () => {
    expect(approveSchema.safeParse({}).success).toBe(true);
    expect(approveSchema.safeParse({ reason: "looks good" }).success).toBe(
      true,
    );
  });

  it("requires a non-empty reason on reject", () => {
    expect(rejectSchema.safeParse({}).success).toBe(false);
    expect(rejectSchema.safeParse({ reason: "" }).success).toBe(false);
    expect(rejectSchema.safeParse({ reason: "no" }).success).toBe(true);
  });

  it("requires a deployment id to request promotion", () => {
    expect(requestPromotionSchema.safeParse({}).success).toBe(false);
    expect(
      requestPromotionSchema.safeParse({ deploymentId: "d1" }).success,
    ).toBe(true);
  });

  it("requires a target deployment id to roll back", () => {
    expect(rollbackSchema.safeParse({}).success).toBe(false);
    expect(rollbackSchema.safeParse({ targetDeploymentId: "d2" }).success).toBe(
      true,
    );
  });
});
