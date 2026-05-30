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

## Phase 2: Core Data Model and Persistence

- [x] Refined Prisma schema with UUID keys, enums, indexes, and tenant scoping
- [x] Initial migration SQL generated offline (prisma/migrations/0001_init)
- [x] Strengthened Prisma client singleton, import-safe without DATABASE_URL
- [x] Repository layer for all core entities
- [x] Service layer foundation calling repositories with mock fallback
- [x] Typed API response helpers and error utilities
- [x] Correlation ID utility and structured logging utility
- [x] Health, demo status, and guarded demo reset endpoints
- [x] Read-only foundation API endpoints for core resources
- [x] Repeatable seed routine shared by CLI and demo reset
- [x] Repository, utility, API helper, and seed integrity tests
- [ ] Migration executed against a live database (requires DATABASE_URL)
- [ ] CI pipeline wired in the repository (Phase 3)

## Phase 3: Control Plane Modules (read-oriented)

- [x] Rich UI view models for every module (src/types/views.ts)
- [x] Read-oriented view service with seed-derived demo fallback
- [x] Agents module: browsable list and detail
- [x] Prompts module: list and detail with version history
- [x] Deployments module: list and detail with approval and evaluation evidence
- [x] Governance module: approval queue, summary, and risk distribution
- [x] Evaluations module: results with deployment-blocking indicator
- [x] Observability module: agent and provider health, cost summary
- [x] Incidents module: open and resolved incidents
- [x] Audit explorer: append-only events with correlation IDs
- [x] Dashboard upgraded to module summaries with links
- [x] Read-only detail and summary API endpoints
- [x] Clerk principal groundwork (demo principal, no enforcement yet)
- [x] Shared module components and demo-mode banner
- [x] View builder, principal, metric card, and status helper tests
- [ ] Provider abstraction with simulated adapter: later phase

## Phase 4: Governance and Approvals

- [x] Principal role-to-permission model and authorization utilities
- [x] RBAC enforced in the service layer (not only UI)
- [x] Lightweight policy engine for promotion, rollback, and approval decisions
- [x] Approve and reject approval workflows (immutable, reason required to reject)
- [x] Double-decision prevention
- [x] Deployment promotion, request-promotion, and rollback workflows
- [x] Policy blocks prevent mutation and return typed blocked results
- [x] Audit events for successful persisted workflow actions
- [x] Outbox events for successful persisted workflow actions
- [x] Demo-safe simulated mutations clearly labeled, no false evidence IDs
- [x] Guarded mutation API endpoints with zod validation
- [x] Workflow UI panels, confirmation dialog, and result states
- [x] Permission, policy, workflow, validation, and UI tests

## Phase 4 Hardening: Workflow Persistence Integrity

- [x] Shared Prisma transaction client type so repositories run in a transaction
- [x] Approval decisions: decision, audit, and outbox written in one transaction
- [x] Promotion: state change, audit, and outbox written in one transaction
- [x] Rollback: state change, audit, and outbox written in one transaction
- [x] Persisted promotion marks the target active and supersedes prior active deployments for the same agent and environment
- [x] Persisted rollback activates the target and marks the rolled-back-from deployment ROLLED_BACK, preserving the record
- [x] Concurrent or already-decided approvals abort the transaction with no evidence
- [x] Database-backed policy facts when persistence is enabled; seed facts in demo mode
- [x] Repository mutation helpers tenant-scoped and transaction-aware
- [x] Repository scoping and transaction-shape tests
- [ ] Clerk-backed role mapping (currently demo principal): future hardening
- [ ] Database-backed assembly of rich aggregate read views: future phase
- [ ] Outbox publisher process: Phase 5 onward

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
