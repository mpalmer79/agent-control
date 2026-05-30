# Seed Data Plan

A realistic demo environment for Agent Control. The seed data must support a
compelling portfolio walkthrough (see DEMO_SCRIPT.md) using no real customer
data, no production secrets, and no live provider calls. All telemetry is
simulated.

## Goals

- Tell a coherent operational story: healthy agents, one agent in trouble, a failed evaluation, a pending approval, a clean audit trail, an incident, and a rollback opportunity.
- Exercise every primary screen with believable data.
- Remain stable and reproducible so the demo runs the same way every time.

## Organization and Users

One demo organization with users covering each role.

| Role | Name | Purpose in demo |
| --- | --- | --- |
| Administrator | Dana Reyes | Platform owner. |
| Platform Engineer | Alex Kim | Creates agents, requests deployments, performs rollback. |
| Reviewer | Priya Shah | Approves or rejects the pending request. |
| Auditor | Sam Cole | Reviews the audit trail. |
| Executive | Morgan Lee | Views cost and risk summaries. |

## Models

A small registry covering multiple providers, with one disabled model to
demonstrate policy enforcement.

- anthropic / claude-sonnet (medium risk, enabled for production).
- anthropic / claude-opus (medium risk, enabled for production).
- openai / gpt-class model (medium risk, enabled for production).
- google / gemini-class model (low risk, enabled for staging only).
- local / local-eval-model (low risk, disabled for production) to show that disabled models cannot be promoted.

Each model carries provider, model_key, display_name, context_window,
input_cost_per_million, output_cost_per_million, risk_level, and enabled flags.
Cost values are representative, not contractual.

## Sample Agents

Five to seven agents so the registry feels real. At least one agent is the
"problem child" for the demo.

1. Customer Support Agent (medium risk, production). The healthy baseline.
2. Billing Assistant (high risk, production). Requires approval; used for the approval flow.
3. Sales Outreach Agent (low risk, production). Low-risk auto-deploy example.
4. Knowledge Base Agent (medium risk, staging). Mid-lifecycle example.
5. Fraud Triage Agent (high risk, production). The problem child: elevated cost and error rate, a failed evaluation, and an open incident.
6. Internal Docs Agent (low risk, development). Early lifecycle example.

Each agent has an owner, status, risk level, and one or more versions referencing
a prompt version and a model.

## Sample Prompts and Versions

Each agent has a prompt with multiple immutable versions so the diff and rollback
story works.

- Fraud Triage Agent prompt: v1, v2, v3. v3 introduced a regression (the demo failed evaluation references v3).
- Billing Assistant prompt: v1, v2. v2 is pending approval for production.
- Customer Support Agent prompt: v1 through v4, all stable, to show healthy history.

Each version records template_text, variables_json, change_reason, created_by,
and created_at. Change reasons are realistic (for example, "Tightened refusal
behavior", "Added structured output format").

## Sample Deployments

A deployment timeline per agent showing promotions and at least one rollback
opportunity.

- Customer Support Agent: a clean series of promotions across environments.
- Fraud Triage Agent: a recent production promotion of v3 that correlates with the incident, with a prior stable deployment (v2) available as the rollback target.
- Billing Assistant: a pending production deployment awaiting approval.
- Sales Outreach Agent: a low-risk auto-deploy with no approval required.

Deployment records include environment, status, deployed_by, approved_by,
deployed_at, and rollback_from_deployment_id where relevant.

## Sample Evaluations

Historical evaluation runs that demonstrate trends and one clear failure.

- Customer Support Agent: a series of passing runs (functional, safety, format), trending stable.
- Fraud Triage Agent v3: a failed safety or regression run (for example, score 0.61, passed false) that blocks production and motivates the rollback.
- Billing Assistant v2: a passing functional run and a pending safety review, tied to the approval.

Each run records suite_name, status, score, passed, started_at, completed_at, and
created_by.

## Sample Approvals

At least one pending and a mix of historical decisions.

- Pending: Billing Assistant v2 production promotion, assigned to the Reviewer. Used live in the demo.
- Approved (historical): Customer Support Agent v4 promotion, with reason recorded.
- Rejected (historical): an earlier Fraud Triage promotion attempt, with reason recorded, to show the rejection path.

Each approval records resource_type, resource_id, requested_by, assigned_to,
status, decision_reason, decided_at, and created_at.

## Sample Incidents

- Open, high severity: "Cost spike and elevated error rate on Fraud Triage Agent", linked by correlation_id to the problematic v3 deployment and its cost records.
- Resolved, medium severity (historical): a prior provider latency incident, to show the resolved state.

## Sample Costs

Simulated cost records spread over recent days so the Cost Dashboard shows trends.

- Steady, modest cost for healthy agents.
- A visible spike for the Fraud Triage Agent aligned with the v3 deployment and the open incident.
- Per-record fields: organization_id, agent_id, model_id, provider, input_tokens, output_tokens, estimated_cost, environment, correlation_id, created_at.

## Audit Records

Seed audit events for the historical actions above (agent and prompt creation,
deployments, the historical approval decisions, evaluation completions, and
incident creation) so the Audit Explorer is populated and correlation IDs join
the story. Live demo actions (approval and rollback) generate fresh audit events.

## Consistency Rules

- correlation_id values tie together related deployments, cost records, incidents, and audit events for the Fraud Triage story.
- All records belong to the single demo organization.
- No secrets, no real names of real people, and no real customer data.
- The seed harness is idempotent and reproducible.

## Maintenance

The seed data is versioned with the schema. Any schema change updates the seed
harness in the same change so the demo never breaks.
