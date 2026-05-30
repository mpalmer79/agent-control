# Event Contracts

Event naming rules, the shared envelope, and example payloads for Agent Control.
Events align with ARCHITECTURE.md and SYSTEM_DESIGN.md section 7. Critical events
are published through the outbox pattern and delivered at least once, so
consumers must be idempotent.

## Naming Rules

- Event types use PascalCase.
- Names are past tense and describe a fact that has occurred (for example, DeploymentPromoted, not PromoteDeployment).
- Names are subject then verb in past tense (Resource + PastTenseAction).
- Names are stable contract identifiers; once published, a name is not repurposed.
- A new shape for an existing concept gets a new name or an explicit schema version, not a silent change.

## Envelope Structure

Every event shares a common envelope. The payload varies by event type.

```json
{
  "event_id": "uuid",
  "event_type": "PromptVersionCreated",
  "schema_version": 1,
  "organization_id": "uuid",
  "actor_user_id": "uuid",
  "correlation_id": "uuid",
  "occurred_at": "2026-05-30T15:42:10Z",
  "payload": {}
}
```

Envelope field rules:

- event_id: unique identifier for the event instance; used for idempotent consumption.
- event_type: one of the registered names below.
- schema_version: integer, incremented on a breaking payload change.
- organization_id: tenant scope; required on all events.
- actor_user_id: the user who triggered the action, when applicable; may be null for system-generated events.
- correlation_id: links the event to the originating request and related records.
- occurred_at: ISO 8601 UTC timestamp.
- payload: event-specific body described per type below.

## Registered Events

The MVP registers the following event types.

### AgentCreated

```json
{
  "event_type": "AgentCreated",
  "payload": {
    "agent_id": "uuid",
    "name": "Customer Support Agent",
    "owner_user_id": "uuid",
    "risk_level": "medium"
  }
}
```

### PromptVersionCreated

```json
{
  "event_type": "PromptVersionCreated",
  "payload": {
    "prompt_id": "uuid",
    "prompt_version_id": "uuid",
    "version": "v4",
    "change_reason": "Improved refusal behavior"
  }
}
```

### DeploymentRequested

```json
{
  "event_type": "DeploymentRequested",
  "payload": {
    "deployment_id": "uuid",
    "agent_id": "uuid",
    "agent_version_id": "uuid",
    "environment": "production"
  }
}
```

### DeploymentPromoted

```json
{
  "event_type": "DeploymentPromoted",
  "payload": {
    "deployment_id": "uuid",
    "agent_id": "uuid",
    "agent_version_id": "uuid",
    "environment": "production",
    "approved_by": "uuid"
  }
}
```

### DeploymentRolledBack

```json
{
  "event_type": "DeploymentRolledBack",
  "payload": {
    "deployment_id": "uuid",
    "agent_id": "uuid",
    "rolled_back_to_deployment_id": "uuid",
    "environment": "production",
    "reason": "Elevated error rate after promotion"
  }
}
```

### ApprovalRequested

```json
{
  "event_type": "ApprovalRequested",
  "payload": {
    "approval_id": "uuid",
    "resource_type": "deployment",
    "resource_id": "uuid",
    "requested_by": "uuid",
    "assigned_to": "uuid"
  }
}
```

### ApprovalDecisionRecorded

```json
{
  "event_type": "ApprovalDecisionRecorded",
  "payload": {
    "approval_id": "uuid",
    "status": "approved",
    "decision_reason": "Passed evaluation and policy checks"
  }
}
```

### EvaluationCompleted

```json
{
  "event_type": "EvaluationCompleted",
  "payload": {
    "evaluation_run_id": "uuid",
    "agent_version_id": "uuid",
    "suite_name": "safety-v2",
    "score": 0.94,
    "passed": true
  }
}
```

### CostRecorded

```json
{
  "event_type": "CostRecorded",
  "payload": {
    "agent_id": "uuid",
    "model_id": "uuid",
    "input_tokens": 1200,
    "output_tokens": 600,
    "estimated_cost": 0.017,
    "environment": "production"
  }
}
```

### IncidentCreated

```json
{
  "event_type": "IncidentCreated",
  "payload": {
    "incident_id": "uuid",
    "agent_id": "uuid",
    "severity": "high",
    "title": "Cost spike detected",
    "trigger": "cost_spike"
  }
}
```

## Consumption Rules

- Consumers deduplicate on event_id.
- Consumers tolerate at-least-once delivery and out-of-order arrival.
- Consumers scope all derived state by organization_id.
- Unknown event types are ignored, not rejected, to allow forward compatibility.
- A consumer that cannot process an event records the failure and does not block source-of-truth writes.

## Relationship to Audit

Events are not a substitute for audit records. A significant action both writes
an append-only audit event (see AUDIT_MODEL.md) and emits a domain event through
the outbox. Audit is the system of record; events drive projections, dashboards,
and future automation.
