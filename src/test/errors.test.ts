import { describe, expect, it } from "vitest";

import {
  AppError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  isAppError,
  toAppError,
} from "@/lib/errors";

describe("application errors", () => {
  it("assigns stable codes and statuses", () => {
    expect(new ValidationError().status).toBe(400);
    expect(new NotFoundError().status).toBe(404);
    expect(new ForbiddenError().status).toBe(403);
    expect(new ValidationError().code).toBe("validation_error");
  });

  it("identifies application errors", () => {
    expect(isAppError(new NotFoundError())).toBe(true);
    expect(isAppError(new Error("plain"))).toBe(false);
  });

  it("converts unknown values into a safe internal error", () => {
    const converted = toAppError(new Error("boom"));
    expect(converted).toBeInstanceOf(AppError);
    expect(converted.code).toBe("internal_error");
    expect(converted.status).toBe(500);
    // The original message is not leaked.
    expect(converted.message).toBe("An unexpected error occurred");
  });

  it("passes through existing application errors", () => {
    const original = new NotFoundError("Agent not found");
    expect(toAppError(original)).toBe(original);
  });
});
