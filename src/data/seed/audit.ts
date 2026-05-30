// Seed audit events for historical actions. Correlation IDs join these to the
// related deployments, evaluations, approvals, and incidents.

export const seedAuditEvents = [
  {
    action: "deployment.promoted",
    actorKey: "alex",
    resourceType: "deployment",
    resourceId: "support-v4-prod",
    correlationId: "corr_support_v4",
    createdAt: "2026-05-26T09:30:00Z",
  },
  {
    action: "evaluation.completed",
    actorKey: null,
    resourceType: "evaluation_run",
    resourceId: "fraud-v3-safety",
    correlationId: "corr_fraud_v3",
    createdAt: "2026-05-28T13:40:00Z",
  },
  {
    action: "deployment.promoted",
    actorKey: "alex",
    resourceType: "deployment",
    resourceId: "fraud-v3-prod",
    correlationId: "corr_fraud_v3",
    createdAt: "2026-05-28T14:10:00Z",
  },
  {
    action: "incident.created",
    actorKey: null,
    resourceType: "incident",
    resourceId: "fraud-cost",
    correlationId: "corr_fraud_v3",
    createdAt: "2026-05-28T15:00:00Z",
  },
  {
    action: "approval.requested",
    actorKey: "alex",
    resourceType: "approval",
    resourceId: "billing-v2",
    correlationId: "corr_billing_v2",
    createdAt: "2026-05-29T16:45:00Z",
  },
] as const;
