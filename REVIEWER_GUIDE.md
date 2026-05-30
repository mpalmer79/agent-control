# Reviewer Guide

A short guide for recruiters, hiring managers, and senior engineers reviewing
Agent Control. It explains what the project demonstrates, the recommended review
path, and what is intentionally simulated.

## What Agent Control Demonstrates

Agent Control is an enterprise control plane for production AI agents. It treats
AI operations with the rigor expected of any production-critical platform:
control, visibility, policy, human review, cost awareness, versioning, rollback,
and evidence. It is not a chatbot, an AI wrapper, or a generic dashboard.

The project shows staff-level thinking across the full lifecycle: a documentation
foundation, a typed persistence layer, read-oriented control plane modules,
governed and transactional workflows, and an operational evidence layer that
joins everything by correlation ID.

## Recommended Review Path (about five minutes)

Run the app locally (see README.md) or read along with the seeded scenario.

1. Open the landing page. It states the product, the demo story, and the safety
   notice.
2. Open the in-app walkthrough at `/walkthrough` (Start here in the sidebar). It
   guides the rest of this path.
3. Dashboard: the operational health score is reduced by an open incident and a
   failed evaluation. The attention banner points at the problem.
4. Fraud Triage Agent: high risk, elevated error rate, active version v3.
5. Deployment detail for `fraud-v3-prod`: a failed safety evaluation, with a
   preserved prior stable v2 deployment as the rollback target.
6. Incident detail for `fraud-cost`: the triggering signal, related metrics,
   audit and outbox evidence, and a recommended action.
7. Trace `corr_fraud_v3`: one correlation ID joins the deployment, the failed
   evaluation, the cost record, the incident, the audit events, and the outbox
   event into one time-ordered timeline.
8. Governance: a separate high-risk change is pending approval; approvals are
   immutable, require a reason to reject, and fail closed.

## What to Look For in the Architecture

- Layering: UI components call services, services call repositories, repositories
  use Prisma. UI never touches Prisma directly. See ARCHITECTURE_MAP.md.
- Demo-safe fallback: every read flows through `load()` in
  `src/server/data-source.ts`, which serves database data when configured and
  seed-derived demo data otherwise, with an honest demo banner.
- Transactional workflows: `src/server/modules/deployments/service.ts` and
  `src/server/modules/governance/service.ts` write the business state change, the
  append-only audit event, and the pending outbox event in a single
  `prisma.$transaction`. Blocked actions mutate nothing.
- Pure rule engines: the policy engine
  (`src/server/modules/governance/policy-engine.ts`) and the incident rules
  (`src/server/modules/incidents/rules.ts`) are pure functions, which makes them
  simple to test.
- Evidence by correlation ID: `src/server/views/observability-views.ts` builds
  the trace that ties the story together.

## Key Code Areas

- Workflows and policy: `src/server/modules/{deployments,governance}/service.ts`, `src/server/modules/governance/policy-engine.ts`.
- Observability and incidents: `src/server/views/observability-views.ts`, `src/server/modules/incidents/rules.ts`.
- Persistence: `prisma/schema.prisma`, `src/server/repositories`, `src/lib/prisma/client.ts`.
- API surface: `src/app/api`. Response envelope: `src/lib/api/responses.ts`.
- Tests: `src/test` (Vitest). Run `npm run test`.

## What Is Simulated

- The runtime is simulated. There are no live AI provider calls.
- Telemetry, costs, and provider health are demo-seeded.
- Without a database, workflow mutations return clearly labeled simulated results
  and claim no persisted evidence.

## What Is Intentionally Not Included

- Real telemetry ingestion from external systems.
- A background outbox publisher to external queues.
- Persisted incident creation from signals (signals report candidates).
- Clerk-backed session-to-principal mapping (a demo principal is used).
- Billing API integration.

These are documented as future work, not presented as complete.

## How to Run Locally

See README.md. The short version: `npm install`, `npm run prisma:generate`,
`npm run dev`. The shell renders without a database or Clerk keys.
