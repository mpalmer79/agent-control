// Seed approvals. One pending (used live in the demo), plus historical approved
// and rejected decisions to show both paths.

export const seedApprovals = [
  {
    key: "billing-v2",
    resourceType: "deployment",
    resourceId: "billing-v2-prod",
    resourceLabel: "Billing Assistant v2 to production",
    requestedByKey: "alex",
    assignedToKey: "priya",
    status: "PENDING",
    decisionReason: null,
    correlationId: "corr_billing_v2",
    createdAt: "2026-05-29T16:45:00Z",
  },
  {
    key: "support-v4",
    resourceType: "deployment",
    resourceId: "support-v4-prod",
    resourceLabel: "Customer Support Agent v4 to production",
    requestedByKey: "alex",
    assignedToKey: "priya",
    status: "APPROVED",
    decisionReason: "Passed evaluation and policy checks",
    correlationId: "corr_support_v4",
    createdAt: "2026-05-26T09:10:00Z",
  },
  {
    key: "fraud-v3",
    resourceType: "deployment",
    resourceId: "fraud-v3-prod",
    resourceLabel: "Fraud Triage Agent v3 to production",
    requestedByKey: "alex",
    assignedToKey: "priya",
    status: "REJECTED",
    decisionReason: "Safety evaluation failed; do not promote",
    correlationId: "corr_fraud_v3",
    createdAt: "2026-05-28T13:50:00Z",
  },
] as const;
