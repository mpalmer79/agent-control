import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const modelsModule: ModuleDescriptor = {
  name: "models",
  description:
    "Provider-agnostic model registry with cost, risk, and production rules.",
  phase: "Phase 3",
};
