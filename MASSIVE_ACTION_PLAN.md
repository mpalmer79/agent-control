# Massive Action Plan

A multi-phase implementation roadmap for Agent Control. Each phase lists
deliverables, risks, and exit criteria. The plan aligns with ARCHITECTURE.md and
SYSTEM_DESIGN.md and respects the modular monolith, PostgreSQL-first,
event-driven, audit-first, and simulated-runtime constraints.

Phases are sequential by default. A phase begins only when the prior phase meets
its exit criteria.

## Phase 0: Repository Foundation

### Deliverables

- Complete documentation set in the repository root (this phase).
- Source-of-truth alignment with ARCHITECTURE.md and SYSTEM_DESIGN.md.
- Decision log, data model, event contracts, API contracts, governance, audit, observability, seed, demo, testing, deployment, security, and contribution docs.
- Safe .env.example, .gitignore, and MIT LICENSE.

### Risks

- Documentation drifts from the two source documents.
- Naming inconsistency across files.
- Scope creep into implementation detail before code exists.

### Exit Criteria

- All listed root documents exist and cross-reference correctly.
- No em dashes anywhere.
- No secrets and no implementation code.
- Self-review pass recorded with a gap list for human decisions.

## Phase 1: Repository Shell and Infrastructure

### Deliverables

- Modular monolith project skeleton on the locked stack: Next.js App Router, TypeScript, Prisma, PostgreSQL, Tailwind CSS, and shadcn/ui.
- App Router route groups and server module directories per UI_ARCHITECTURE.md and SYSTEM_DESIGN.md section 20.1.
- Clerk authentication wired with organization and role resolution.
- Local development setup: PostgreSQL, optional Redis, environment configuration from .env.example.
- Request concerns: correlation ID injection, request validation scaffold, structured JSON logging.
- CI pipeline: lint, type check, unit test, and build.
- Health check endpoint and baseline observability wiring.

### Risks

- Premature service extraction that adds operational complexity.
- Tooling sprawl that slows delivery.
- Inconsistent module boundaries.

### Exit Criteria

- Next.js application builds and runs locally against PostgreSQL via Prisma.
- Clerk authentication resolves organization and role.
- CI passes on the default branch.
- Correlation IDs flow through logs.
- Module boundaries match the documented structure in UI_ARCHITECTURE.md and SYSTEM_DESIGN.md.

## Phase 2: Core Data Model

### Deliverables

- Schema for organizations, users, agents, agent versions, prompts, prompt versions, models, deployments, approvals, evaluation runs, audit events, cost records, incidents, and environments.
- Migration tooling and seed harness foundation.
- Outbox table and the publisher skeleton.
- Tenant scoping (organization_id) enforced at the data access layer.

### Risks

- Schema changes after dependent modules are built.
- Missing tenant scoping creating cross-tenant leakage.
- Outbox added too late to be consistent with writes.

### Exit Criteria

- Migrations apply cleanly from empty database.
- Every tenant-owned table includes organization_id.
- Outbox writes occur in the same transaction as business writes.
- Domain entities match DATA_MODEL.md.

## Phase 3: Control Plane Modules

### Deliverables

- Agent module: create, update, list, version registration.
- Prompt module: create prompts, create immutable versions, diff, mark active, roll back.
- Model module: register models, store cost and risk metadata, enable or disable by environment.
- Deployment module: request, promote, roll back, with quality gate checks.
- Provider abstraction layer interface (generate, stream, countTokens, estimateCost, healthCheck) with a simulated adapter.
- Audit writes and event emission for each significant action.

### Risks

- Cross-module database coupling instead of service calls or events.
- Mutable prompt versions slipping in.
- Deploy gates implemented inconsistently across paths.

### Exit Criteria

- Prompt versions are immutable; edits create new versions.
- Deployment gates enforce approved prompt, approved model, passing evaluations, and policy checks.
- Every action emits an event through the outbox and writes an audit record.
- Provider calls flow only through the adapter layer.

## Phase 4: Governance and Approvals

### Deliverables

- Risk classification and policy evaluation.
- Approval request creation and routing by role.
- Approval decision recording (immutable) with reason and correlation ID.
- Fail-closed enforcement for high-risk actions.
- Role-based access control for approval endpoints.

### Risks

- Approval bypass paths for high-risk deployments.
- Fail-open behavior when governance checks error.
- Decisions that can be edited after the fact.

### Exit Criteria

- High-risk deployments cannot proceed without a recorded decision.
- Governance failures fail closed for high-risk actions.
- Approval decisions are append-only.
- RBAC matches the authorization model in SYSTEM_DESIGN.md section 10.

## Phase 5: Observability and Incidents

### Deliverables

- Metrics collection for the documented minimum metric set.
- Evaluation framework with functional, safety, cost, quality, regression, and format checks.
- Incident creation on cost spikes and elevated error rates.
- Correlation-ID trace lookup across logs, cost records, audit events, and incidents.
- Cost aggregation and budget signal logic with simulated data.

### Risks

- Telemetry coupling that blocks core runtime when storage degrades.
- Incident noise from poor thresholds.
- Evaluation results not retained historically.

### Exit Criteria

- Cost dashboard and agent metrics render from seeded and simulated data.
- A simulated cost spike creates an incident.
- Evaluation history is queryable for trend analysis.
- Degraded telemetry does not block low-risk runtime calls.

## Phase 6: Demo Polish and Deployment

### Deliverables

- Complete seeded demo environment per SEED_DATA_PLAN.md.
- End-to-end demo flow per DEMO_SCRIPT.md verified.
- MVP deployment to Vercel (frontend), Railway (backend and PostgreSQL), optional Redis.
- Accessibility pass on primary screens.
- Final documentation refresh and reviewer-facing polish.

### Risks

- Demo data that does not tell a coherent story.
- Deployment configuration drift from local development.
- Accessibility gaps on key screens.

### Exit Criteria

- The five-minute walkthrough runs end to end on the deployed MVP.
- Seeded data supports every demo step including a failed evaluation and a rollback.
- No real secrets or customer data in the deployed environment.
- Primary screens pass the accessibility checks in TESTING_STRATEGY.md.

## Cross-Phase Principles

- PostgreSQL is the source of truth; Redis and object storage are optional and never authoritative.
- Critical events use the outbox pattern.
- Audit data is append-only and never hard-deleted.
- The MVP uses a simulated runtime; real provider calls live behind a protected admin mode.
- Governance before autonomy: prove visibility, control, approval, and rollback before adding self-healing behavior.
