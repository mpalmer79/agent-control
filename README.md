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

## Reviewer Walkthrough

A reviewer can understand the platform in under five minutes:

1. Skim this README for the problem and capabilities.
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) and [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the engineering story.
3. Follow [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) to experience agent overview, deployment history, a failed evaluation, an approval workflow, the audit trail, an incident, and a rollback.

The seeded demo (see [SEED_DATA_PLAN.md](./SEED_DATA_PLAN.md)) ships a realistic
environment so the story works without real customer data or live provider calls.

## Future Roadmap Summary

- Phase 1: single-agent management, prompt registry, deployment tracking, audit logging, seeded demo data.
- Phase 2: multi-agent management, approval workflows, evaluation framework, rollback simulation.
- Phase 3: cost intelligence, executive dashboards, risk scoring, incident management.
- Phase 4: autonomous remediation, self-healing workflows, policy enforcement engine, provider failover.

See [MASSIVE_ACTION_PLAN.md](./MASSIVE_ACTION_PLAN.md) for the full plan.

## Status

Phase 3 complete: read-oriented control plane modules. On top of the Phase 1
shell and Phase 2 persistence foundation, the repository now has browsable
Agents, Prompts, Deployments, Governance, Evaluations, Observability, Incidents,
and Audit modules, with detail pages for agents, prompts, and deployments, and a
dashboard that links to module summaries. A read-oriented view service produces
rich UI view models, serving seed-derived demo data with a clear demo banner
when no database is configured. Clerk principal groundwork is in place without
enforcing roles yet. Write workflows (promote, rollback, approve, reject) arrive
in Phase 4. The shell still renders without a database or Clerk keys.

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

### Foundation API Endpoints

All endpoints return a consistent envelope and a correlation ID. They serve
database data when DATABASE_URL is configured and seed-derived mock data
otherwise.

- `GET /api/health`: service, environment, version, and database status.
- `GET /api/demo/status`: demo mode and reset eligibility.
- `POST /api/demo/reset`: guarded demo dataset reset (development or demo mode).
- `GET /api/agents`, `GET /api/prompts`, `GET /api/deployments`.
- `GET /api/approvals`, `GET /api/evaluations`, `GET /api/incidents`.
- `GET /api/audit-events`, `GET /api/metrics/summary`.

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
