# Decision Log

Architecture decision records (ADRs) for Agent Control. Each record captures the
context, decision, and consequences for a significant choice. New decisions are
appended; superseded decisions are marked rather than deleted.

ADR status values: Accepted, Superseded, Deprecated.

## ADR 0001: Modular Monolith First

- Status: Accepted
- Context: The platform spans many domains (agents, prompts, models, deployments, governance, evaluations, observability, costs, audit). A microservice architecture would add operational complexity (deployment, networking, distributed transactions) before the team or scale justifies it.
- Decision: Build the MVP as a modular monolith with strict domain module boundaries. Cross-module communication uses explicit service calls or domain events, not shared database access.
- Consequences: Faster delivery, simpler deployment, and clear boundaries that can be extracted into services later. Requires discipline to avoid hidden coupling. Module boundaries must be enforced in review.

## ADR 0002: PostgreSQL as Source of Truth

- Status: Accepted
- Context: The platform needs strong consistency, relational integrity, and flexible JSON storage for config and state snapshots. Audit and deployment data require durable, queryable history.
- Decision: Use PostgreSQL as the single source of truth for business state. Use JSONB where flexible structure is needed. Redis and object storage are optional and never authoritative.
- Consequences: Strong consistency and simple operations. Specialized stores for high-volume traces or metrics can be added later without changing the source of truth.

## ADR 0003: Simulated Runtime for the MVP

- Status: Accepted
- Context: Live AI provider calls introduce cost, latency, reliability, and abuse risk that undermine a public portfolio demo.
- Decision: Ship a simulated runtime that produces realistic telemetry and mock provider responses. Real provider integration lives behind a protected admin mode.
- Consequences: The demo is reliable and affordable, and attention stays on architecture. Real provider behavior is deferred and must be validated separately when enabled.

## ADR 0004: Seeded Demo Data

- Status: Accepted
- Context: A reviewer needs a coherent, populated environment to understand the platform quickly, without onboarding or real data.
- Decision: Ship seeded demo data covering agents, deployments, incidents, evaluations, approvals, and costs that tells a clear operational story. Use no real customer data and no production secrets.
- Consequences: The demo works immediately and supports the full walkthrough. Seed data must be maintained alongside schema changes.

## ADR 0005: Outbox Pattern for Critical Events

- Status: Accepted
- Context: Event-driven flows risk losing events if a service crashes after writing database state but before publishing. Dual writes to the database and an event bus are not atomic.
- Decision: Write critical events to an outbox table in the same transaction as the business record. A background publisher reads the outbox, publishes to the event bus, and marks rows published.
- Consequences: Database state and emitted events stay consistent. Adds a publisher process and at-least-once delivery semantics that consumers must handle idempotently.

## ADR 0006: Provider Abstraction Layer

- Status: Accepted
- Context: The platform must support multiple model providers (OpenAI, Anthropic, Gemini, local models) and run comparative evaluations without rewriting core logic.
- Decision: Define a common adapter interface (generate, stream, countTokens, estimateCost, healthCheck). Keep provider-specific details inside adapters. No core domain logic depends on a single vendor.
- Consequences: Providers can be swapped or compared with minimal change. Requires maintaining adapters and a stable interface contract.

## ADR 0007: Audit-First Architecture

- Status: Accepted
- Context: The platform exists to make production AI provable and reversible. Trust depends on a complete, tamper-evident history.
- Decision: Record an append-only audit event for every significant action, including actor, action, resource, previous and new state, correlation ID, and organization ID. Never hard-delete or edit audit data. Reserve hash chaining, signed exports, and WORM storage for a future enterprise version.
- Consequences: Strong traceability and incident reconstruction. Audit tables grow and need retention and partitioning strategy at scale. Destructive operations on audit data are prohibited by design.

## ADR 0008: Governance Before Autonomy

- Status: Accepted
- Context: Autonomous remediation is attractive but risky before the platform can reliably show visibility, control, approval, and rollback.
- Decision: Prioritize human-in-the-loop governance and rollback in early phases. Defer self-healing and autonomous remediation to a later roadmap phase.
- Consequences: The platform earns trust through demonstrable control first. Autonomy is added on a proven foundation.

## ADR 0009: Fail-Closed for High-Risk Actions

- Status: Accepted
- Context: When governance or evaluation checks cannot complete, allowing high-risk actions to proceed would defeat the platform purpose.
- Decision: High-risk deployments fail closed when required checks or approvals are unavailable. Low-risk runtime calls may degrade gracefully with delayed telemetry.
- Consequences: Safety is preserved under partial failure. Operators may see blocked high-risk actions during outages, which is the intended behavior.
