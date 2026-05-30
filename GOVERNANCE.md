# Governance

Risk levels, approval requirements, policy enforcement, fail-closed behavior, and
deployment restrictions for Agent Control. Governance aligns with
ARCHITECTURE.md (Governance and Policy, Human Approval Framework) and
SYSTEM_DESIGN.md section 4.7.

## Goals

- Enforce human oversight for high-risk AI actions by default.
- Block unsafe deployments before they reach production.
- Keep every governance decision traceable and immutable.
- Fail closed when safety cannot be verified.

## Risk Levels

Risk is assigned to agents and models, and evaluated per action. The MVP uses
three levels.

| Level | Meaning | Default deployment behavior |
| --- | --- | --- |
| Low | Limited blast radius, non-sensitive output. | May deploy automatically if all gates pass. |
| Medium | Customer-facing or moderate impact. | Requires human approval for production. |
| High | Sensitive domains (financial, legal, medical), high cost, or policy override. | Requires human approval for any production promotion and stricter checks. |

Risk inputs include the agent risk classification, the model risk rating, the
target environment, and policy findings. The effective risk for an action is the
highest applicable level.

## Approval Requirements

An approval request is created when the effective risk of an action requires
human review.

- Low-risk production deployments: no approval required if all other gates pass.
- Medium-risk production deployments: one Reviewer or Administrator approval required.
- High-risk production deployments: approval required and cannot be bypassed.
- Policy override requests: always require approval and are recorded as high-risk.

Approval states: pending, approved, rejected, expired, canceled.

Every approval decision records reviewer, decision, timestamp, reason, related
resource, and correlation ID. Decisions are immutable. A wrong decision is
corrected by a new corrective action, not by editing the original.

Only Reviewer and Administrator roles can record approval decisions. A requester
cannot approve their own request.

## Policy Enforcement

Policies are versioned rules evaluated during deployment and other guarded
actions. Examples from ARCHITECTURE.md:

- High-risk agents cannot deploy without human approval.
- Production prompts cannot be edited in place; editing creates a new version.
- Disabled models cannot be selected for production.
- Failed evaluations block deployment.
- Cost spikes trigger an incident.
- Audit records cannot be deleted.

Policy evaluation produces findings classified by severity. A critical,
unresolved finding blocks the action. Policy versions are retained so historical
decisions can be reconstructed against the rules in force at the time.

## Deployment Restrictions

A production deployment must satisfy all of the following gates:

1. Approved agent version exists.
2. Approved prompt version is referenced.
3. Approved model is selected and enabled for production.
4. Required evaluation suites pass.
5. No unresolved critical policy violations.
6. Required human approval is recorded when the risk level demands it.

If any gate fails, the deployment is blocked and the API returns a structured
gate result (see API_CONTRACTS.md). Blocked deployments produce an audit event.

Development and staging deployments use relaxed gates appropriate to
non-production environments but still record audit events and emit events.

## Fail-Closed Behavior

When a governance check cannot complete (for example, the policy or approval
subsystem is unavailable):

- High-risk and medium-risk production actions are blocked (fail closed).
- Low-risk runtime calls may continue with graceful degradation and delayed telemetry.
- The failure is recorded, and an incident may be created.

Fail-closed behavior is intentional and tested. The platform prefers a blocked
safe action over an unverified risky one.

## Roles and Responsibilities

- Platform Engineer: requests deployments, runs evaluations, performs rollbacks.
- Reviewer: approves or rejects pending requests.
- Administrator: full governance authority, including user and policy management.
- Auditor: reads governance history; cannot approve or deploy.
- Executive: views risk and governance summaries.

## Auditability of Governance

Every governance action (approval requested, decision recorded, policy
evaluated, deployment blocked or promoted) writes an append-only audit event and
emits a domain event through the outbox. See AUDIT_MODEL.md and
EVENT_CONTRACTS.md.
