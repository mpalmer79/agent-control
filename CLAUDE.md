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
