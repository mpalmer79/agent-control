# Agent Control

Enterprise Control Plane for Production AI Agents

## Overview

Agent Control is an enterprise operations platform for managing, governing, and
observing production AI systems. It provides a single control plane for AI
agents, prompt versions, model registries, deployments, human approvals,
governance policies, evaluations, observability, cost tracking, incidents, and
immutable audit history.

This is not a chatbot, an AI wrapper, or a generic dashboard. It is a control
plane that treats production AI with the same rigor expected of any other
production-critical software platform: control, visibility, policy, human
review, cost awareness, versioning, rollback, and evidence.

## Problem Statement

Organizations are deploying AI into production faster than they can govern it.
Most teams cannot answer basic operational questions:

- Which agents, prompts, and models are live, and in which environment?
- What changed recently, and who approved it?
- Why did a deployment fail, and how do we roll it back safely?
- What does each agent cost to operate?
- Can we prove what happened after the fact?

Existing tooling tends to focus on experimentation rather than operational
governance. Agent Control fills the operational gap between model providers and
the applications that depend on them.

## Core Capabilities

- Agent Registry: identity, versions, ownership, and risk classification.
- Prompt Registry: immutable, versioned prompts with diff and rollback.
- Model Registry: provider-agnostic model metadata and usage rules.
- Deployment Management: promote, roll back, and gate environment changes.
- Governance and Approvals: risk-based, human-in-the-loop review that fails closed.
- Evaluations: functional, safety, cost, quality, regression, and format checks.
- Observability: metrics, traces, correlation IDs, and incidents.
- Cost Tracking: token usage, estimated spend, and budget signals.
- Immutable Audit History: append-only record of every significant action.

## Architecture References

The two source-of-truth documents define the platform. Read them first:

- [ARCHITECTURE.md](./ARCHITECTURE.md): product architecture, domains, and principles.
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md): service boundaries, data flow, contracts, and failure handling.

Key constraints: modular monolith first, PostgreSQL as source of truth,
event-driven with the outbox pattern, provider abstraction, simulated runtime
for the MVP, and audit-first design.

## Technology Stack (MVP)

The MVP stack is locked (see [DECISIONS.md](./DECISIONS.md)):

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- shadcn/ui
- Clerk for authentication

## Documentation Map

| Document                                             | Purpose                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                 | Product architecture and domain model (source of truth).   |
| [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)               | Technical system design (source of truth).                 |
| [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) | Personas, user stories, scope, and acceptance criteria.    |
| [MASSIVE_ACTION_PLAN.md](./MASSIVE_ACTION_PLAN.md)   | Multi-phase implementation roadmap.                        |
| [PHASES.md](./PHASES.md)                             | Concise progress tracker and checkpoints.                  |
| [CLAUDE.md](./CLAUDE.md)                             | Working rules for future Claude Code sessions.             |
| [DECISIONS.md](./DECISIONS.md)                       | Architecture decision records.                             |
| [DATA_MODEL.md](./DATA_MODEL.md)                     | Domain entities, relationships, and ownership.             |
| [EVENT_CONTRACTS.md](./EVENT_CONTRACTS.md)           | Event naming, envelope, and examples.                      |
| [API_CONTRACTS.md](./API_CONTRACTS.md)               | Planned resources, routes, and error model.                |
| [UI_ARCHITECTURE.md](./UI_ARCHITECTURE.md)           | Navigation, information architecture, and core user flows. |
| [GOVERNANCE.md](./GOVERNANCE.md)                     | Risk levels, approvals, and fail-closed behavior.          |
| [AUDIT_MODEL.md](./AUDIT_MODEL.md)                   | Audit events, retention, and immutability.                 |
| [OBSERVABILITY.md](./OBSERVABILITY.md)               | Logs, metrics, traces, and incidents.                      |
| [SEED_DATA_PLAN.md](./SEED_DATA_PLAN.md)             | Demo data design.                                          |
| [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)                   | Five-minute reviewer walkthrough.                          |
| [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)         | Testing approach across layers.                            |
| [DEPLOYMENT.md](./DEPLOYMENT.md)                     | MVP and future production deployment.                      |
| [SECURITY.md](./SECURITY.md)                         | Auth, tenancy, secrets, and audit integrity.               |
| [CONTRIBUTING.md](./CONTRIBUTING.md)                 | Branching, commits, and review expectations.               |
| [REVIEWER_GUIDE.md](./REVIEWER_GUIDE.md)             | Reviewer path and what to look for in the code.            |
| [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md)         | Code-level request flow and layer boundaries.              |

## Reviewer Walkthrough

A reviewer can understand the platform in under five minutes:

1. Skim this README for the problem and capabilities.
2. Open the in-app walkthrough at `/walkthrough` (Start here in the sidebar), or read [REVIEWER_GUIDE.md](./REVIEWER_GUIDE.md).
3. Follow the demo spine: dashboard, the Fraud Triage Agent, its failed deployment, the incident, and the `corr_fraud_v3` trace that joins all the evidence. See [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for the scripted version.

The seeded demo (see [SEED_DATA_PLAN.md](./SEED_DATA_PLAN.md)) ships a realistic
environment so the story works without real customer data or live provider calls.

For the code-level flow, see [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md).

## Screenshots

Screenshots are not committed to keep the repository lean. To capture them, run
the app locally and capture these pages into a local `docs/screenshots`
directory:

- Dashboard (`/dashboard`): operational health and the attention banner.
- Incident detail (`/incidents/fraud-cost`): triggering signal and evidence.
- Trace detail (`/traces/corr_fraud_v3`): the joined evidence timeline.
- Deployment detail (`/deployments/fraud-v3-prod`): gates and rollback readiness.
- Observability (`/observability`): health, cost, evaluations, and outbox.
- Governance approval (`/governance`): the approval queue and policy notice.

## Future Roadmap Summary

Future work, documented honestly and not presented as complete:

- Real telemetry ingestion from external systems (currently demo-seeded).
- A background outbox publisher to external systems (events remain pending).
- Persisted incident creation from signals (signals report candidates today).
- Clerk-backed session-to-principal mapping (a demo principal is used today).

See [MASSIVE_ACTION_PLAN.md](./MASSIVE_ACTION_PLAN.md) for the phase history.

## Status

Phase 6 complete: the MVP is reviewable, deployment-ready, and portfolio-ready.
A guided in-app walkthrough, a polished landing page, a real settings page, a
reviewer guide, and an architecture map round out the operational evidence
platform. This is a portfolio MVP: the runtime is simulated, all telemetry is
demo-seeded, there are no live AI provider calls, no real customer data, and no
secrets. The control plane renders without a database or Clerk keys.

Phase 5 added observability and operational evidence. On top of the governed
workflows, the platform now explains what happened, how serious it is, what it
costs, and what evidence proves it: an operational health score, agent and
provider health, cost aggregation by agent, provider, and environment with
budget signals, evaluation trends by category, a pure incident rule engine (cost
spike, error rate, evaluation failure, outbox backlog) with incident detail and
recommended actions, correlation-ID trace lookup joining audit, deployment,
cost, incident, and outbox evidence, and outbox visibility. All telemetry is
demo-seeded with a simulated runtime. The earlier phases are preserved: the
governed workflows remain transactional, and the shell still renders without a
database or Clerk keys.

Earlier: Phase 4 added governed, auditable workflows (approve, reject, request
promotion, promote, roll back) with service-layer RBAC, a policy engine, and
transactional audit and outbox evidence. Full Clerk-backed role mapping, real
telemetry ingestion, persisted incident creation from signals, and an outbox
publisher remain future work.

### Workflow API Endpoints (Phase 4)

Guarded mutations returning the standard envelope with a correlation ID and a
typed workflow result:

- `POST /api/approvals/[id]/approve`, `POST /api/approvals/[id]/reject`.
- `POST /api/deployments/request-promotion`.
- `POST /api/deployments/[id]/promote`, `POST /api/deployments/[id]/rollback`.
- `GET /api/deployments/[id]/rollback-candidates`.

### Module and Foundation API Endpoints

All endpoints return a consistent envelope and a correlation ID. They serve
database data when DATABASE_URL is configured and seed-derived demo data
otherwise.

- `GET /api/health`, `GET /api/demo/status`, `POST /api/demo/reset` (guarded).
- `GET /api/agents`, `/api/agents/[id]`, and `[id]/versions`, `[id]/deployments`, `[id]/incidents`.
- `GET /api/prompts`, `/api/prompts/[id]`, `/api/prompts/[id]/versions`.
- `GET /api/models`.
- `GET /api/deployments`, `/api/deployments/[id]`.
- `GET /api/approvals`, `/api/approvals/summary`.
- `GET /api/evaluations`, `/api/evaluations/summary`.
- `GET /api/incidents`, `/api/incidents/summary`.
- `GET /api/audit-events`, `/api/audit-events/resource`.
- `GET /api/metrics/summary`.

Phase 5 added observability and evidence endpoints: `GET /api/observability/overview`,
`/agent-health`, `/provider-health`, `/outbox`; `GET /api/traces`,
`/api/traces/[correlationId]`; `GET /api/incidents/[id]`; `GET /api/costs/summary`,
`/by-agent`, `/by-provider`, `/by-environment`; `GET /api/evaluations/trends`;
`GET /api/audit-events/correlation/[correlationId]`; and the guarded
`POST /api/incidents/evaluate-signals`.

### Local Development

Prerequisites: Node.js 20 or newer and npm. PostgreSQL is required only to run
migrations and the seed; the static shell renders without a database or Clerk
keys.

```bash
npm install
cp .env.example .env        # fill in values as needed; safe to leave Clerk blank for the shell
npm run prisma:generate     # generate the Prisma client
npm run dev                 # start the app at http://localhost:3000
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test
npm run build
```

Database and seed (requires DATABASE_URL):

```bash
npm run prisma:migrate
npm run seed
```

### Where Things Live

- Application shell and routes: `src/app` (route groups `(marketing)`, `(app)`, `(auth)`).
- UI components: `src/components` (ui, layout, navigation, dashboard, shared).
- Domain modules and services: `src/server/modules` (one folder per domain).
- Repository layer: `src/server/repositories`.
- API response helpers: `src/lib/api`. Errors: `src/lib/errors`.
- Observability utilities: `src/lib/observability` (correlation, logger).
- Mock data layer (shell): `src/lib/mock`. Seed-derived mock source (API): `src/server/mock-source.ts`.
- Shared types, constants, config, validation: `src/types` and `src/lib`.
- Prisma schema, migrations, and seed: `prisma/schema.prisma`, `prisma/migrations`, `prisma/seed.ts`.
- Seed data: `src/data/seed`. Shared seed routine: `src/server/modules/demo/seed-runner.ts`.
- API routes: `src/app/api`.
- Tests: `src/test`.

The correlation ID header is `x-correlation-id`. Demo reset is guarded by
`NEXT_PUBLIC_DEMO_MODE` and `ALLOW_DEMO_RESET` and never runs in production
unless explicitly allowed.

## License

MIT. See [LICENSE](./LICENSE).
