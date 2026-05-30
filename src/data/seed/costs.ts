// Seed cost records spread over recent days. The Fraud Triage Agent shows a
// visible spike aligned with its v3 deployment and the open incident.

export const seedCosts = [
  {
    agentKey: "support",
    modelKey: "claude-sonnet",
    provider: "anthropic",
    inputTokens: 480000,
    outputTokens: 240000,
    estimatedCost: 5.04,
    environment: "PRODUCTION",
    correlationId: "corr_support_v4",
    createdAt: "2026-05-27T12:00:00Z",
  },
  {
    agentKey: "billing",
    modelKey: "claude-opus",
    provider: "anthropic",
    inputTokens: 120000,
    outputTokens: 60000,
    estimatedCost: 6.3,
    environment: "PRODUCTION",
    correlationId: "corr_billing_v2",
    createdAt: "2026-05-27T12:00:00Z",
  },
  {
    agentKey: "fraud",
    modelKey: "gpt-class",
    provider: "openai",
    inputTokens: 900000,
    outputTokens: 450000,
    estimatedCost: 11.25,
    environment: "PRODUCTION",
    correlationId: "corr_fraud_v2",
    createdAt: "2026-05-27T12:00:00Z",
  },
  {
    agentKey: "fraud",
    modelKey: "gpt-class",
    provider: "openai",
    inputTokens: 2400000,
    outputTokens: 1200000,
    estimatedCost: 30,
    environment: "PRODUCTION",
    correlationId: "corr_fraud_v3",
    createdAt: "2026-05-28T18:00:00Z",
  },
] as const;
