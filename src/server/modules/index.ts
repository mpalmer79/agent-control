// Registry of domain module descriptors. This makes the modular monolith
// boundaries explicit and gives later phases a single place to discover modules.

import { agentsModule } from "./agents";
import { promptsModule } from "./prompts";
import { modelsModule } from "./models";
import { deploymentsModule } from "./deployments";
import { governanceModule } from "./governance";
import { evaluationsModule } from "./evaluations";
import { observabilityModule } from "./observability";
import { auditModule } from "./audit";
import { costsModule } from "./costs";
import { incidentsModule } from "./incidents";
import { demoModule } from "./demo";
import type { ModuleDescriptor } from "./module";

export const MODULES: ModuleDescriptor[] = [
  agentsModule,
  promptsModule,
  modelsModule,
  deploymentsModule,
  governanceModule,
  evaluationsModule,
  observabilityModule,
  auditModule,
  costsModule,
  incidentsModule,
  demoModule,
];

export type { ModuleDescriptor };
