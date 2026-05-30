// Seed prompts and their immutable versions. The Fraud Triage prompt has a v3
// regression that motivates the failed evaluation and rollback in the demo.

export const seedPrompts = [
  {
    key: "support",
    name: "Customer Support Prompt",
    description: "Tier-1 customer support assistant prompt.",
    createdByKey: "alex",
    versions: [
      { version: "v1", changeReason: "Initial version" },
      { version: "v2", changeReason: "Added structured output format" },
      { version: "v3", changeReason: "Tightened refusal behavior" },
      { version: "v4", changeReason: "Improved tone and escalation rules" },
    ],
  },
  {
    key: "billing",
    name: "Billing Assistant Prompt",
    description: "Handles billing questions and disputes.",
    createdByKey: "alex",
    versions: [
      { version: "v1", changeReason: "Initial version" },
      { version: "v2", changeReason: "Added dispute handling guidance" },
    ],
  },
  {
    key: "fraud",
    name: "Fraud Triage Prompt",
    description: "Triages potential fraud cases for human review.",
    createdByKey: "alex",
    versions: [
      { version: "v1", changeReason: "Initial version" },
      { version: "v2", changeReason: "Improved precision on edge cases" },
      {
        version: "v3",
        changeReason: "Expanded autonomy, later found to regress safety",
      },
    ],
  },
] as const;
