# UI Architecture

Product-level user interface architecture for Agent Control. This document
defines navigation, information architecture, dashboard structure, core user
flows, application states, and the reviewer walkthrough path. It is information
architecture only. It does not contain visual mockups or component
implementations.

This document is a required read for any future session before creating routes,
layouts, dashboards, navigation, services, or data models. It aligns with
ARCHITECTURE.md and SYSTEM_DESIGN.md, and assumes the locked MVP stack: Next.js
App Router, TypeScript, Prisma, PostgreSQL, Tailwind CSS, and shadcn/ui.

## Principles

- The frontend renders server-provided state and calls APIs. It contains no business rules.
- Every screen is scoped to the authenticated organization; cross-tenant data never appears.
- Navigation maps to the domain modules so the structure mirrors the architecture.
- Status and risk are communicated with text and icons, not color alone (see TESTING_STRATEGY.md accessibility checks).
- Every primary screen supports loading, empty, error, seeded-demo, and maintenance states.

## Primary Navigation

The top-level navigation has eight destinations:

1. Dashboard
2. Agents
3. Prompts
4. Deployments
5. Governance
6. Observability
7. Audit
8. Settings

Navigation is role-aware. Items the current role cannot use are hidden or shown
in a disabled state with an explanation. Role-to-area mapping:

| Area | Primary roles |
| --- | --- |
| Dashboard | All roles |
| Agents | Platform Engineer, Administrator |
| Prompts | Platform Engineer, Administrator |
| Deployments | Platform Engineer, Administrator |
| Governance | Reviewer, Administrator (Auditor read-only) |
| Observability | All roles (Executive summary view) |
| Audit | Auditor, Administrator |
| Settings | Administrator |

## Information Architecture

Page hierarchy and parent-child relationships. App Router segments are shown for
orientation only; this is not an implementation.

- Dashboard (`/`)
- Agents (`/agents`)
  - Agent detail (`/agents/[agentId]`)
    - Versions (`/agents/[agentId]/versions`)
    - Deployments (`/agents/[agentId]/deployments`)
    - Evaluations (`/agents/[agentId]/evaluations`)
    - Cost (`/agents/[agentId]/cost`)
- Prompts (`/prompts`)
  - Prompt detail (`/prompts/[promptId]`)
    - Versions (`/prompts/[promptId]/versions`)
    - Version detail and diff (`/prompts/[promptId]/versions/[versionId]`)
- Deployments (`/deployments`)
  - Deployment detail (`/deployments/[deploymentId]`)
- Governance (`/governance`)
  - Approval queue (`/governance/approvals`)
  - Approval detail (`/governance/approvals/[approvalId]`)
  - Policies (`/governance/policies`)
- Observability (`/observability`)
  - Incidents (`/observability/incidents`)
  - Incident detail (`/observability/incidents/[incidentId]`)
  - Metrics (`/observability/metrics`)
  - Cost dashboard (`/observability/cost`)
- Audit (`/audit`)
  - Audit event detail (`/audit/[auditEventId]`)
- Settings (`/settings`)
  - Members and roles (`/settings/members`)
  - Models registry (`/settings/models`)
  - Environments (`/settings/environments`)

Navigation flow: the Dashboard links into each area. Agent detail is the hub that
connects versions, deployments, evaluations, and cost. Governance and Audit are
reachable both from the top navigation and contextually from a deployment or
approval through correlation IDs.

## Dashboard Structure

The Dashboard is the operational landing surface. It is composed of the following
regions, ordered top to bottom.

### Executive Summary Cards

A row of summary cards:

- Active agents by environment.
- Open incidents by severity.
- Pending approvals.
- Estimated spend for the current period with trend.

### Incident Overview

A compact list of open incidents, highest severity first, each linking to the
incident detail and its correlated deployment.

### Agent Health

A grid or list of agents with status, risk level, error-rate signal, and latest
evaluation result. The problem agent in the seeded demo surfaces here.

### Cost Overview

A trend visualization of estimated spend over recent days, with a breakdown by
agent. Driven by simulated cost data in the MVP.

### Approval Queue

A short list of pending approvals assigned to or visible by the current role,
linking to the approval detail.

### Deployment Activity

A recent-activity timeline of promotions and rollbacks across environments, each
entry linking to the deployment detail.

## Core User Flows

### Reviewer Flow

1. Land on Dashboard, see the Approval Queue card.
2. Open Governance, Approval Queue.
3. Open a pending approval detail.
4. Review context: prompt diff, evaluation results, and policy findings.
5. Record an approve or reject decision with a reason.
6. Return to the queue; the item reflects the recorded, immutable decision.

### Engineer Flow

1. Land on Dashboard, notice an agent with elevated cost or error rate.
2. Open the Agent detail page.
3. Inspect Deployments and Evaluations; compare prompt versions via diff.
4. Request a deployment, or trigger a rollback to a prior stable deployment.
5. Observe the resulting deployment record, audit event, and emitted event.

### Auditor Flow

1. Open Audit.
2. Filter by actor, action, resource, time, or correlation ID.
3. Open an audit event detail and follow the correlation ID to related records.
4. Export a filtered set for compliance review.

### Executive Flow

1. Land on Dashboard.
2. Review Executive Summary cards and Cost Overview.
3. Open Observability for cost and risk trends.
4. No operational actions; read-only summaries.

## Application States

Every primary screen defines these states:

- Loading: skeletons or progress indicators; no layout shift on resolve.
- Empty: a clear explanation and the next action (for example, no agents yet).
- Error: a recoverable message with the correlation ID for support, never a raw stack trace.
- Seeded demo: the populated portfolio state used for the walkthrough.
- Maintenance: a read-only or degraded notice when a dependency is unavailable; high-risk actions are disabled and fail closed.

## Reviewer Walkthrough Path

The navigation sequence used during portfolio demonstrations. It mirrors
DEMO_SCRIPT.md and is optimized so each stop has something to show.

1. Dashboard: agent overview and the standout problem agent.
2. Agents, then the problem Agent detail: Deployment history.
3. Agent Evaluations: the failed evaluation, with a prompt version diff.
4. Governance, Approval Queue: open the pending approval and record a decision.
5. Audit: filter by correlation ID to show the joined records.
6. Observability, Incidents: the open incident linked to the cost spike.
7. Back to the Agent Deployment timeline: trigger a rollback to the prior stable deployment.

The path is a loop that starts and ends at the agent in trouble, telling a
complete operational story: regression shipped, detected, governed, audited, and
reversed.

## Out of Scope for This Document

- Visual design, theming, and spacing.
- Component APIs and props.
- Concrete React or Next.js code.

Those are produced during implementation phases, guided by this architecture.
