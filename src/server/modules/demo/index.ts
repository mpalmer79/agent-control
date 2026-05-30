import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const demoModule: ModuleDescriptor = {
  name: "demo",
  description:
    "Seeded demo scenario and simulated runtime. No live provider calls.",
  phase: "Phase 1 onward",
};
