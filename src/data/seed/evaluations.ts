// Seed evaluation runs. The Fraud Triage Agent v3 safety suite fails and blocks
// production, motivating the rollback. Other agents trend passing.

export const seedEvaluations = [
  {
    agentKey: "support",
    version: "v4",
    suiteName: "functional-v2",
    status: "COMPLETED",
    score: 0.97,
    passed: true,
    correlationId: "corr_support_v4",
  },
  {
    agentKey: "support",
    version: "v4",
    suiteName: "safety-v2",
    status: "COMPLETED",
    score: 0.96,
    passed: true,
    correlationId: "corr_support_v4",
  },
  {
    agentKey: "billing",
    version: "v2",
    suiteName: "functional-v2",
    status: "COMPLETED",
    score: 0.93,
    passed: true,
    correlationId: "corr_billing_v2",
  },
  {
    agentKey: "fraud",
    version: "v3",
    suiteName: "safety-v2",
    status: "COMPLETED",
    score: 0.61,
    passed: false,
    correlationId: "corr_fraud_v3",
  },
  {
    agentKey: "fraud",
    version: "v2",
    suiteName: "safety-v2",
    status: "COMPLETED",
    score: 0.92,
    passed: true,
    correlationId: "corr_fraud_v2",
  },
] as const;
