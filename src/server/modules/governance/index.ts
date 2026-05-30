import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const governanceModule: ModuleDescriptor = {
  name: "governance",
  description:
    "Risk classification, policy evaluation, and immutable human approvals. Fails closed for high risk.",
  phase: "Phase 4",
};
