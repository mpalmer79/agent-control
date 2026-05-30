import { describe, expect, it } from "vitest";

import {
  evaluationPassIntent,
  evaluationPassLabel,
  EVALUATION_STATUS_LABELS,
  INCIDENT_STATUS_LABELS,
  PROMPT_VERSION_STATUS_LABELS,
} from "@/lib/constants/status";

describe("status helpers", () => {
  it("maps evaluation pass results to intent and label", () => {
    expect(evaluationPassIntent(true)).toBe("success");
    expect(evaluationPassIntent(false)).toBe("destructive");
    expect(evaluationPassIntent(null)).toBe("muted");
    expect(evaluationPassLabel(true)).toBe("Passed");
    expect(evaluationPassLabel(false)).toBe("Failed");
    expect(evaluationPassLabel(null)).toBe("Pending");
  });

  it("provides labels for evaluation, incident, and prompt statuses", () => {
    expect(EVALUATION_STATUS_LABELS.completed).toBe("Completed");
    expect(INCIDENT_STATUS_LABELS.open).toBe("Open");
    expect(PROMPT_VERSION_STATUS_LABELS.approved).toBe("Approved");
  });
});
