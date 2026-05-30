import type { ModuleDescriptor } from "@/server/modules/module";

export * from "./types";

export const incidentsModule: ModuleDescriptor = {
  name: "incidents",
  description:
    "Durable incidents raised from cost spikes, error rates, and provider outages.",
  phase: "Phase 5",
};
