// Seed deployments. Each references an agent and one of its versions. The Fraud
// Triage Agent has an active v3 (the regression) and a superseded v2 that is the
// rollback target.

export const seedDeployments = [
  {
    key: "support-v4-prod",
    agentKey: "support",
    version: "v4",
    environment: "PRODUCTION",
    status: "ACTIVE",
    deployedByKey: "alex",
    approvedByKey: "priya",
    correlationId: "corr_support_v4",
    deployedAt: "2026-05-26T09:30:00Z",
  },
  {
    key: "billing-v2-prod",
    agentKey: "billing",
    version: "v2",
    environment: "PRODUCTION",
    status: "PENDING_APPROVAL",
    deployedByKey: "alex",
    approvedByKey: null,
    correlationId: "corr_billing_v2",
    deployedAt: null,
  },
  {
    key: "fraud-v2-prod",
    agentKey: "fraud",
    version: "v2",
    environment: "PRODUCTION",
    status: "SUPERSEDED",
    deployedByKey: "alex",
    approvedByKey: "priya",
    correlationId: "corr_fraud_v2",
    deployedAt: "2026-05-20T13:00:00Z",
  },
  {
    key: "fraud-v3-prod",
    agentKey: "fraud",
    version: "v3",
    environment: "PRODUCTION",
    status: "ACTIVE",
    deployedByKey: "alex",
    approvedByKey: "priya",
    correlationId: "corr_fraud_v3",
    deployedAt: "2026-05-28T14:10:00Z",
  },
] as const;
