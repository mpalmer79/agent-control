import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const observabilityModule: ModuleDescriptor = {
  name: "observability",
  description:
    "Metrics, traces, and correlation-ID lookup across logs, costs, and audit.",
  phase: "Phase 5",
};
