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

| Document | Purpose |
| --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Product architecture and domain model (source of truth). |
| [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) | Technical system design (source of truth). |
| [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) | Personas, user stories, scope, and acceptance criteria. |
| [MASSIVE_ACTION_PLAN.md](./MASSIVE_ACTION_PLAN.md) | Multi-phase implementation roadmap. |
| [PHASES.md](./PHASES.md) | Concise progress tracker and checkpoints. |
| [CLAUDE.md](./CLAUDE.md) | Working rules for future Claude Code sessions. |
| [DECISIONS.md](./DECISIONS.md) | Architecture decision records. |
| [DATA_MODEL.md](./DATA_MODEL.md) | Domain entities, relationships, and ownership. |
| [EVENT_CONTRACTS.md](./EVENT_CONTRACTS.md) | Event naming, envelope, and examples. |
| [API_CONTRACTS.md](./API_CONTRACTS.md) | Planned resources, routes, and error model. |
| [UI_ARCHITECTURE.md](./UI_ARCHITECTURE.md) | Navigation, information architecture, and core user flows. |
| [GOVERNANCE.md](./GOVERNANCE.md) | Risk levels, approvals, and fail-closed behavior. |
| [AUDIT_MODEL.md](./AUDIT_MODEL.md) | Audit events, retention, and immutability. |
| [OBSERVABILITY.md](./OBSERVABILITY.md) | Logs, metrics, traces, and incidents. |
| [SEED_DATA_PLAN.md](./SEED_DATA_PLAN.md) | Demo data design. |
| [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) | Five-minute reviewer walkthrough. |
| [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) | Testing approach across layers. |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | MVP and future production deployment. |
| [SECURITY.md](./SECURITY.md) | Auth, tenancy, secrets, and audit integrity. |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Branching, commits, and review expectations. |

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

Foundation stage. This repository currently contains documentation only. No
application code has been written. Implementation begins at Phase 1.

## License

MIT. See [LICENSE](./LICENSE).
