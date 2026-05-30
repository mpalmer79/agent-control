import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { demoApprovals } from "@/lib/mock/demo-data";

export const metadata: Metadata = { title: "Governance" };

export default function GovernancePage() {
  const pending = demoApprovals.filter((a) => a.status === "pending").length;

  return (
    <PlaceholderPage
      title="Governance"
      description="Approvals, policies, and risk controls. High-risk actions fail closed."
      phase="Phase 4: Governance and approvals"
      summary={[
        { label: "Pending approvals", value: String(pending) },
        { label: "Policies", value: "6" },
        { label: "Risk levels", value: "3" },
        { label: "Fail closed", value: "High risk" },
      ]}
      upcoming={[
        "Approval queue with role-based routing",
        "Immutable approval decisions with reasons",
        "Policy evaluation with critical-finding blocking",
        "Fail-closed enforcement for high-risk production actions",
      ]}
    />
  );
}
