# Demo Script

A reviewer walkthrough of Agent Control. It runs entirely on seeded data with a
simulated runtime (see SEED_DATA_PLAN.md). The goal is to show operational
thinking: control, visibility, governance, audit, and rollback. There are no
live AI provider calls and no real customer data.

The in-app version of this script lives at `/walkthrough` (Start here in the
sidebar). This document gives three review paths and the talking points.

## Five-Minute Path

Follow the evidence spine, correlation ID `corr_fraud_v3`:

1. Dashboard: operational health score, attention banner, top risk agent.
2. Fraud Triage Agent (`/agents/fraud`): high risk, elevated error rate, v3 active.
3. Deployment detail (`/deployments/fraud-v3-prod`): failed safety evaluation, v2 rollback target preserved.
4. Incident detail (`/incidents/fraud-cost`): triggering signal, related metrics, recommended action.
5. Trace (`/traces/corr_fraud_v3`): one timeline joining deployment, evaluation, cost, incident, audit, and outbox.
6. Governance (`/governance`): a separate high-risk change pending approval, fail-closed.

Talking point: a regression shipped, evaluations and metrics caught it, an
incident was raised, governance enforced review on a separate change, and the
operator can roll back safely, all provable by one correlation ID.

## Ten-Minute Deeper Path

Add to the five-minute path:

- Observability (`/observability`): agent and provider health, cost summary with
  budget signals, evaluation trends by category, outbox summary.
- Costs (`/observability/costs`): estimated spend by agent, provider, and
  environment, with the budget warning on the Fraud Triage Agent.
- Outbox (`/observability/outbox`): pending events written transactionally with
  workflow state changes; no external publisher yet.
- Audit (`/audit`): append-only events; note the disabled filter preview and the
  trace links.
- Approval detail (`/governance/approvals/...`): approve and reject actions with
  the policy decision and immutable evidence (simulated without a database).

## Technical Inspection Path

For engineers reviewing the code:

- Layering and fallback: `src/server/data-source.ts` (`load()`), services in
  `src/server/modules`, repositories in `src/server/repositories`.
- Transactional workflows: `src/server/modules/deployments/service.ts` and
  `governance/service.ts` (`prisma.$transaction` with state change, audit, and
  outbox).
- Pure logic: `src/server/modules/governance/policy-engine.ts` and
  `src/server/modules/incidents/rules.ts`.
- Evidence: `src/server/views/observability-views.ts` (`buildTraceDetail`).
- Tests: `src/test` (run `npm run test`).

See REVIEWER_GUIDE.md and ARCHITECTURE_MAP.md.

## Limitations to Disclose Honestly

- The runtime is simulated; telemetry, costs, and provider health are demo-seeded.
- Without a database, workflow mutations return labeled simulated results.
- Real telemetry ingestion, an outbox publisher, persisted incident creation from
  signals, and Clerk-backed role mapping are future work.

## Scripted Step-by-Step (about five minutes)

Each step below lists what to show and the point it makes.

## Operational Evidence Walkthrough (from Phase 5)

The strongest path through the platform follows the evidence:

1. Open the Dashboard. Note the operational health score, the attention banner, and the top risk agent (Fraud Triage Agent).
2. Open Incidents, then the cost spike and elevated error rate incident. Read the triggering signal, related metrics, and recommended action.
3. Follow the correlation ID from the incident to the trace (`/traces/corr_fraud_v3`). See audit, deployment, cost, and outbox evidence on one timeline.
4. Open Evaluations. The Fraud Triage v3 safety evaluation failed and blocks production.
5. Open Observability for agent and provider health, cost by agent and provider, budget signals, and the outbox summary.
6. Return to the Fraud Triage deployment detail and roll back to the prior stable version.

This shows how Agent Control explains what happened, how serious it is, what it costs, and what evidence proves it.

## Before You Start

- Ensure the seeded demo environment is loaded.
- Sign in as the Platform Engineer (Alex Kim) for most steps; switch to the Reviewer (Priya Shah) for the approval step.
- Confirm the Fraud Triage Agent shows elevated cost and an open incident.

## Step 1: Agent Overview (about 40 seconds)

Open the Agent Registry.

- Show several deployed agents with owner, environment, status, and risk level.
- Point out that the Fraud Triage Agent stands out with elevated cost and error rate.

Point: this is a control plane that shows the live state of production AI at a
glance, not a chatbot.

## Step 2: Deployment History (about 40 seconds)

Open the Fraud Triage Agent detail page and view its Deployment Timeline.

- Show the recent production promotion of prompt version v3.
- Show the prior stable deployment (v2) still recorded in history.

Point: every deployment is recorded; nothing is silently overwritten.

## Step 3: Failed Evaluation (about 45 seconds)

Open the Evaluation Results for the Fraud Triage Agent.

- Show the failed evaluation on v3 (for example, a safety or regression suite with a low score and passed false).
- Compare prompt v2 and v3 with the diff view to show what changed.

Point: quality gates catch regressions, and prompt history makes the cause
visible.

## Step 4: Approval Workflow (about 60 seconds)

Open the Approval Queue.

- Show the pending approval for the Billing Assistant v2 production promotion.
- Switch to the Reviewer role (Priya Shah).
- Open the request, review the context (evaluation results and policy findings), and record a decision with a reason.

Point: high-risk changes require human review, and decisions are captured
immutably.

## Step 5: Audit Trail (about 45 seconds)

Open the Audit Explorer.

- Filter by the Fraud Triage Agent or by the correlation ID from the v3 deployment.
- Show the linked records: deployment requested, evaluation completed, incident created, and the approval decision just recorded.

Point: the platform can prove what happened, who did it, and when, with a single
correlation ID joining everything.

## Step 6: Incident Review (about 40 seconds)

Open the Incident Dashboard.

- Open the high-severity incident for the Fraud Triage Agent (cost spike and elevated error rate).
- Show how it links by correlation ID to the v3 deployment and the cost spike on the Cost Dashboard.

Point: observability turns raw metrics into actionable incidents tied to a cause.

## Step 7: Rollback Demonstration (about 50 seconds)

Return to the Fraud Triage Agent Deployment Timeline as the Platform Engineer.

- Trigger a rollback to the prior stable deployment (v2) in demo mode.
- Show that a new rollback deployment record is created, the v3 deployment is marked inactive, and the failed deployment record is preserved.
- Show the fresh audit event and the DeploymentRolledBack event.

Point: the platform makes production AI reversible, with a clean record of the
recovery.

## Wrap Up (about 20 seconds)

Summarize the story: a regression shipped, evaluations and metrics caught it, an
incident was raised, governance enforced review on a separate high-risk change,
and the operator rolled back safely with a complete audit trail.

Closing line: production AI requires control, visibility, policy, human review,
cost awareness, versioning, rollback, and evidence. Agent Control provides all of
it.

## Notes for the Presenter

- Keep moving; the data is designed so each screen has something to point at.
- If asked about live AI calls, explain the simulated runtime and the protected admin mode for real providers.
- If asked about scale, reference the enterprise scale path in SYSTEM_DESIGN.md section 13.3.
