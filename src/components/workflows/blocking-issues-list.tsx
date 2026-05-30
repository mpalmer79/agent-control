import { CircleSlash, TriangleAlert } from "lucide-react";

import type { PolicyIssue } from "@/types/workflows";

// Lists blocking issues and warnings from a policy decision.
export function BlockingIssuesList({ issues }: { issues: PolicyIssue[] }) {
  if (issues.length === 0) {
    return null;
  }
  return (
    <ul className="space-y-2">
      {issues.map((issue) => {
        const Icon =
          issue.severity === "blocking" ? CircleSlash : TriangleAlert;
        return (
          <li key={issue.code} className="flex items-start gap-2 text-sm">
            <Icon
              className={
                issue.severity === "blocking"
                  ? "mt-0.5 h-4 w-4 text-destructive"
                  : "mt-0.5 h-4 w-4 text-warning"
              }
              aria-hidden="true"
            />
            <span>{issue.message}</span>
          </li>
        );
      })}
    </ul>
  );
}
