# CLAUDE.md

Working instructions for future Claude Code sessions on Agent Control. Read this
before making changes. The source of truth is ARCHITECTURE.md and
SYSTEM_DESIGN.md; when this file and those documents disagree, those documents win.

## Product

Agent Control is an enterprise control plane for production AI agents. It is not
a chatbot, an AI wrapper, or a generic dashboard. Keep that framing in all code,
comments, and documentation.

## Mandatory Reading

Before creating any routes, layouts, dashboards, navigation, services, or data
models, you must read all three of the following files:

- ARCHITECTURE.md
- SYSTEM_DESIGN.md
- UI_ARCHITECTURE.md

These files are not optional and may not be bypassed. ARCHITECTURE.md and
SYSTEM_DESIGN.md are the source of truth for the system; UI_ARCHITECTURE.md is
the source of truth for navigation and information architecture. When this file
disagrees with those documents, those documents win.

## Product Naming

- Use Agent Control as the public product name everywhere: code, comments, documentation, and UI copy.
- Treat AI Deployment Command Center as the original concept name only. Do not use it as the public product name.
- Keep terminology consistent across all files.

## Technology Stack (Locked for MVP)

The MVP stack is locked. Do not introduce alternatives or parallel backend paths.

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- shadcn/ui
- Clerk for authentication

Do not propose FastAPI or alternative backends for the MVP. Future service
extraction is allowed once scale or team boundaries justify it, but the MVP
architecture is Next.js with TypeScript, Prisma, and PostgreSQL.

## Project Structure (from Phase 1)

The application shell exists. Match the established layout when adding code.

- Routes and layouts: `src/app` with route groups `(marketing)`, `(app)`, `(auth)`.
- UI components: `src/components` (ui, layout, navigation, dashboard, shared, providers).
- Domain modules: `src/server/modules/<domain>` with `index.ts` and `types.ts`. Keep modules isolated; communicate through service calls or events.
- Shared types: `src/types`. Constants, config, mock data, prisma client, utils, validation: `src/lib`.
- Prisma schema and seed: `prisma/schema.prisma` and `prisma/seed.ts`. Seed data: `src/data/seed`.
- Tests: `src/test` using Vitest and React Testing Library.

The MVP uses a mock data layer (`src/lib/mock`) for the shell. Database-backed
reads arrive in later phases. The shell renders without Clerk keys or a database.

## Persistence Layer (from Phase 2)

- Prisma schema: `prisma/schema.prisma`. Client singleton: `src/lib/prisma/client.ts` (import-safe without DATABASE_URL).
- Repositories: `src/server/repositories`. Services call repositories, never Prisma directly.
- Services: `src/server/modules/<domain>/service.ts`. They prefer the database when configured and fall back to seed-derived mock data otherwise (`src/server/data-source.ts`, `src/server/mock-source.ts`).
- API helpers: `src/lib/api/responses.ts`. Errors: `src/lib/errors`. Observability: `src/lib/observability`.
- Shared seed routine: `src/server/modules/demo/seed-runner.ts`, used by both the seed CLI and the guarded demo reset.
- Every tenant-owned query is scoped by organizationId via `tenantWhere`. The correlation header is `x-correlation-id`.

## Control Plane Modules (from Phase 3)

- UI view models: `src/types/views.ts`. Server components consume these, never raw Prisma models.
- View service: `src/server/views/index.ts` returns `{ data, source }` via the `load()` fallback. Rich aggregate views are assembled by the seed-derived builders in `src/server/views/demo-views.ts`; database-backed assembly of these aggregates lands with the Phase 4 write workflows. Lean repository reads remain in `src/server/repositories`.
- Server components read the correlation ID with `correlationIdFromHeaders()` (`src/server/request.ts`) and call the view service. The `DemoModeBanner` shows when seed-derived data is served.
- Auth principal groundwork: `src/server/auth/principal.ts`.

## Governance Workflows (from Phase 4)

- Roles and permissions: `src/server/auth/principal.ts` (ROLE_PERMISSIONS) and `src/server/auth/permissions.ts`. Enforce permissions in the service layer with `requirePermission`, never only in the UI.
- Policy engine: `src/server/modules/governance/policy-engine.ts` is pure (facts in, decision out). Facts are gathered in `src/server/workflows/facts.ts`.
- Workflow services: approvals in `src/server/modules/governance/service.ts`, deployments in `src/server/modules/deployments/service.ts`. They resolve the principal, enforce permission, evaluate policy, and either block (no mutation), route to pending approval, persist with audit and outbox evidence, or return a simulated result when no database is configured.
- Workflow result types: `src/types/workflows.ts`. API routes return these in the standard envelope and use 422 for blocked actions.
- UI: client panels in `src/components/workflows` drive the mutation endpoints and render success, blocked, pending, simulated, and error states.
- Blocked actions never mutate state and never create outbox events. Simulated results never claim persisted evidence IDs.
- Do not add real AI runtime execution or a live outbox publisher yet.

## Architecture Rules

- Build as a modular monolith first. Do not extract services prematurely.
- Keep domain modules isolated: agents, prompts, models, deployments, governance, evaluations, observability, costs, audit.
- Cross-module communication happens through explicit service calls or domain events, never direct database coupling.
- PostgreSQL is the source of truth for business state. Redis and object storage are optional and never authoritative.
- All significant actions emit events. Critical events use the outbox pattern (write business record and outbox row in the same transaction).
- All external AI access flows through the provider adapter layer (generate, stream, countTokens, estimateCost, healthCheck). No core logic depends on a single vendor.
- The MVP uses a simulated runtime. Real provider calls live behind a protected admin mode only.
- Audit is append-only. Never hard-delete or edit audit records.
- Every tenant-owned record includes organization_id. All queries are scoped by organization. Cross-tenant access fails closed.
- High-risk governance failures fail closed.

## Coding Standards

- Match the style, naming, and idioms of surrounding code.
- Keep modules cohesive; expose intent through clear function and type names.
- Validate input at the boundary; do not trust caller-supplied state.
- Attach a correlation ID to every request and propagate it through logs, events, audit records, and traces.
- Prefer explicit, readable code over cleverness.
- Do not introduce secrets into source code, configuration, or seed data.

## Documentation Standards

- Professional markdown at staff-engineer quality.
- No marketing fluff and no AI buzzword spam.
- Clear, concise, and implementation-ready.
- Keep generated files consistent with ARCHITECTURE.md and SYSTEM_DESIGN.md.
- When you add a behavior, update the relevant document (data model, events, API, governance, audit, observability) in the same change.

## No-Em-Dash Rule

Do not use em dashes anywhere in this repository. Replace them with commas,
periods, colons, semicolons, or parentheses. This applies to documentation,
code comments, commit messages, and pull request text.

## Governance Requirements

- High-risk and medium-risk production actions fail closed when a governance or evaluation check cannot complete.
- A production deployment must satisfy all quality gates: approved agent version, approved prompt version, approved and production-enabled model, passing evaluations, no unresolved critical policy violations, and required human approval.
- Approval decisions are immutable; a wrong decision is corrected with a new corrective action, never an edit.
- A requester cannot approve their own approval request.
- Every governance action writes an append-only audit event and emits a domain event through the outbox.
- See GOVERNANCE.md for risk levels, approval rules, and enforcement details.

## Testing Requirements

- Add unit tests for business rules (gates, immutability, risk classification).
- Add integration tests for module interactions and persistence.
- Add contract tests for event envelopes and API request and response shapes.
- Validate the demo flow end to end before claiming a phase complete.
- Include accessibility checks for primary screens.
- See TESTING_STRATEGY.md for the full approach.

## Repository Conventions

- Develop on the assigned feature branch. Do not push to a different branch without explicit permission.
- Commit with clear, descriptive messages. End commit and pull request bodies with the session link footer required by the harness.
- After pushing, ensure a pull request exists for the branch, marked ready for review.
- Keep the PHASES.md tracker current as work progresses.
- Do not include the model identifier in any committed artifact.

## Definition of Done for a Change

- Aligns with the two source documents.
- Updates affected documentation.
- Includes tests appropriate to the layer.
- Preserves audit, tenancy, and fail-closed guarantees.
- Contains no secrets and no em dashes.
