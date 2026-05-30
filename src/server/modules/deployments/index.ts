import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const deploymentsModule: ModuleDescriptor = {
  name: "deployments",
  description:
    "Promotion and rollback across environments with quality gate enforcement.",
  phase: "Phase 3",
};
