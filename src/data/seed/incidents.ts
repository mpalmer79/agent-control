// Seed incidents. One open high-severity incident tied to the Fraud Triage v3
// cost spike, plus a resolved historical incident.

export const seedIncidents = [
  {
    key: "fraud-cost",
    title: "Cost spike and elevated error rate on Fraud Triage Agent",
    agentKey: "fraud",
    severity: "HIGH",
    status: "OPEN",
    description:
      "Estimated spend and error rate rose sharply after the v3 production deployment.",
    correlationId: "corr_fraud_v3",
    createdAt: "2026-05-28T15:00:00Z",
    resolvedAt: null,
  },
  {
    key: "support-latency",
    title: "Elevated provider latency on Customer Support Agent",
    agentKey: "support",
    severity: "MEDIUM",
    status: "RESOLVED",
    description: "Temporary provider latency increase, since recovered.",
    correlationId: "corr_support_latency",
    createdAt: "2026-05-21T08:20:00Z",
    resolvedAt: "2026-05-21T10:05:00Z",
  },
] as const;
