import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const evaluationsModule: ModuleDescriptor = {
  name: "evaluations",
  description:
    "Functional, safety, cost, quality, regression, and format evaluations with history.",
  phase: "Phase 5",
};
