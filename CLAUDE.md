# CLAUDE.md

Working instructions for future Claude Code sessions on Agent Control. Read this
before making changes. The source of truth is ARCHITECTURE.md and
SYSTEM_DESIGN.md; when this file and those documents disagree, those documents win.

## Product

Agent Control is an enterprise control plane for production AI agents. It is not
a chatbot, an AI wrapper, or a generic dashboard. Keep that framing in all code,
comments, and documentation.

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
