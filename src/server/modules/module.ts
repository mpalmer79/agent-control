// Shared shape for domain module descriptors.
//
// Each domain module under src/server/modules owns its business rules,
// validation, and persistence in later phases. Cross-module communication
// happens through explicit service calls or domain events, never direct
// database coupling. These descriptors make the module boundaries explicit
// during the foundation phase.

export interface ModuleDescriptor {
  name: string;
  description: string;
  phase: string;
}
