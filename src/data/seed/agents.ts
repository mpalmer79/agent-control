// Seed agents and their versions. The Fraud Triage Agent is the problem child
// in the demo scenario: elevated cost and error rate, a failed evaluation, and
// an open incident on its v3 production deployment.

export const seedAgents = [
  {
    key: "support",
    name: "Customer Support Agent",
    description: "Handles tier-1 support questions.",
    ownerKey: "alex",
    status: "ACTIVE",
    riskLevel: "MEDIUM",
    promptKey: "support",
    activeVersion: "v4",
    modelKey: "claude-sonnet",
    versions: ["v1", "v2", "v3", "v4"],
  },
  {
    key: "billing",
    name: "Billing Assistant",
    description: "Answers billing questions and handles disputes.",
    ownerKey: "alex",
    status: "ACTIVE",
    riskLevel: "HIGH",
    promptKey: "billing",
    activeVersion: "v2",
    modelKey: "claude-opus",
    versions: ["v1", "v2"],
  },
  {
    key: "fraud",
    name: "Fraud Triage Agent",
    description: "Triages potential fraud cases for human review.",
    ownerKey: "alex",
    status: "ACTIVE",
    riskLevel: "HIGH",
    promptKey: "fraud",
    activeVersion: "v3",
    modelKey: "gpt-class",
    versions: ["v1", "v2", "v3"],
  },
] as const;
