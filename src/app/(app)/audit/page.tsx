import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/shared/placeholder-page";
import { demoAuditActivity } from "@/lib/mock/demo-data";

export const metadata: Metadata = { title: "Audit" };

export default function AuditPage() {
  return (
    <PlaceholderPage
      title="Audit"
      description="Append-only history of significant actions, searchable and exportable."
      phase="Phase 3 onward: Audit across modules"
      summary={[
        { label: "Recent events", value: String(demoAuditActivity.length) },
        { label: "Append only", value: "Yes" },
        { label: "Export", value: "Planned" },
        { label: "Correlation", value: "Linked" },
      ]}
      upcoming={[
        "Audit explorer with filter by actor, action, resource, and time",
        "Correlation-ID drill-down to related records",
        "Audit export for compliance review",
        "Immutability guarantees enforced in the service layer",
      ]}
    />
  );
}
