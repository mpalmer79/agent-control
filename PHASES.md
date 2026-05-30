# Phases

Concise progress tracker for Agent Control. Update the status of each checkpoint
as work proceeds. Use this file as the quick status view; see
MASSIVE_ACTION_PLAN.md for full deliverables, risks, and exit criteria.

Status legend: [ ] not started, [~] in progress, [x] complete.

## Phase 0: Repository Foundation

- [x] Read ARCHITECTURE.md and SYSTEM_DESIGN.md
- [x] Author all root documentation files
- [x] Add .env.example with safe placeholders
- [x] Confirm .gitignore and MIT LICENSE
- [x] No em dashes, no secrets, no implementation code
- [x] Self-review pass and gap list

## Phase 1: Repository Shell and Infrastructure

- [x] Next.js App Router skeleton with TypeScript, Prisma, Tailwind, shadcn/ui
- [x] Clerk-ready authentication structure (passthrough when keys absent)
- [x] Environment config that does not crash without optional variables
- [x] Application shell: sidebar, header, environment and demo indicators
- [x] Route group structure with dashboard and placeholder pages
- [x] Prisma schema foundation for core entities and outbox
- [x] Seed framework and demo seed data aligned with SEED_DATA_PLAN.md
- [x] Mock data layer for the shell
- [x] Domain module skeletons under src/server/modules
- [x] Shared types, constants, and validation schemas
- [x] Error, loading, and not-found states
- [x] Quality tooling: lint, typecheck, format, test scripts
- [x] Vitest test foundation with baseline tests
- [ ] Correlation IDs and structured logging in request path (Phase 2)
- [ ] CI pipeline wired in the repository (Phase 2)
- [ ] Health check endpoint (Phase 2)

## Phase 2: Core Data Model

- [ ] Schema for all core entities
- [ ] Migration tooling
- [ ] Outbox table and publisher skeleton
- [ ] Tenant scoping enforced at data access layer

## Phase 3: Control Plane Modules

- [ ] Agent module
- [ ] Prompt module with immutable versions, diff, rollback
- [ ] Model module with cost and risk metadata
- [ ] Deployment module with quality gates
- [ ] Provider abstraction with simulated adapter
- [ ] Audit writes and event emission per action

## Phase 4: Governance and Approvals

- [ ] Risk classification and policy evaluation
- [ ] Approval requests and role-based routing
- [ ] Immutable approval decisions
- [ ] Fail-closed enforcement for high-risk actions
- [ ] RBAC for approval endpoints

## Phase 5: Observability and Incidents

- [ ] Minimum metric set collection
- [ ] Evaluation framework across categories
- [ ] Incident creation on cost spike and error rate
- [ ] Correlation-ID trace lookup
- [ ] Cost aggregation and budget signals

## Phase 6: Demo Polish and Deployment

- [ ] Complete seeded demo environment
- [ ] Verified end-to-end demo flow
- [ ] MVP deployment (Vercel, Railway, PostgreSQL)
- [ ] Accessibility pass on primary screens
- [ ] Final documentation refresh
