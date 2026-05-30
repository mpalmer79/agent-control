import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkflowResultAlert } from "@/components/workflows/workflow-result-alert";
import type { WorkflowActionResult } from "@/types/workflows";

function result(
  overrides: Partial<WorkflowActionResult>,
): WorkflowActionResult {
  return {
    action: "approval.approve",
    status: "success",
    message: "Done",
    correlationId: "corr-1",
    simulated: false,
    policyDecision: {
      allowed: true,
      action: "approval.approve",
      requiredApprovals: 0,
      blockingIssues: [],
      warnings: [],
      reasons: [],
    },
    ...overrides,
  };
}

describe("WorkflowResultAlert", () => {
  it("renders a success result with the correlation id", () => {
    render(<WorkflowResultAlert result={result({})} />);
    expect(screen.getByText("Action completed")).toBeInTheDocument();
    expect(screen.getByText("corr-1")).toBeInTheDocument();
  });

  it("renders a simulated result label", () => {
    render(
      <WorkflowResultAlert
        result={result({ status: "simulated", simulated: true })}
      />,
    );
    expect(screen.getByText("Simulated action")).toBeInTheDocument();
  });

  it("lists blocking issues for a blocked result", () => {
    render(
      <WorkflowResultAlert
        result={result({
          status: "blocked",
          message: "Blocked",
          policyDecision: {
            allowed: false,
            action: "approval.approve",
            requiredApprovals: 0,
            blockingIssues: [
              {
                code: "x",
                message: "Evaluations failing",
                severity: "blocking",
              },
            ],
            warnings: [],
            reasons: [],
          },
        })}
      />,
    );
    expect(screen.getByText("Action blocked by policy")).toBeInTheDocument();
    expect(screen.getByText("Evaluations failing")).toBeInTheDocument();
  });
});
