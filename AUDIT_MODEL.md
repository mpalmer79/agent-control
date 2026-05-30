# Audit Model

The audit model for Agent Control. It defines what is audited, required fields,
retention, export, and immutability expectations. Audit is the system of record.
This aligns with ARCHITECTURE.md (Audit Architecture) and SYSTEM_DESIGN.md
sections 4.11 and 11.4.

## Principles

- Every significant action produces an audit event.
- Audit data is append-only. The system never hard-deletes or edits audit records.
- Audit is separate from domain events: domain events drive projections, audit proves what happened.
- Audit records are scoped by organization and linked by correlation ID.

## Audited Actions

At minimum, the following actions write an audit event:

- Agent created or updated.
- Agent version created.
- Prompt created.
- Prompt version created (immutable).
- Model registered, enabled, or disabled.
- Deployment requested, promoted, rolled back, or blocked.
- Approval requested and approval decision recorded.
- Evaluation run started and completed.
- Policy evaluated with a critical finding.
- Incident created and resolved.
- User or role changes.

## Required Fields

Each audit event records:

- id: unique audit event identifier.
- organization_id: tenant scope.
- actor_user_id: the user who performed the action; null for system actions, with a system actor label.
- action: the action name (for example, deployment.promoted).
- resource_type: the type of the affected resource (for example, deployment).
- resource_id: the affected resource identifier.
- previous_state_json: relevant prior state, when applicable.
- new_state_json: relevant resulting state, when applicable.
- correlation_id: links the event to the request, domain events, cost records, traces, and incidents.
- created_at: ISO 8601 UTC timestamp.

State snapshots capture the fields relevant to the action, not entire tables.
Sensitive values are minimized and never include secrets.

## Action Naming

- Lowercase, dot-separated: resource.action (for example, prompt_version.created, approval.decision_recorded, deployment.blocked).
- Past tense for the action segment.
- Stable once published; new semantics get new names.

## Immutability Expectations

- No update or delete operations are exposed for audit records through any API.
- The write path is append-only.
- Corrections are represented as new audit events that reference the prior record, never as edits.
- Application roles cannot bypass these constraints.

## Retention Strategy

- MVP: retain all audit events for the life of the demo environment. Daily PostgreSQL backups protect against loss.
- Audit and deployment tables receive stronger retention guarantees than temporary telemetry.
- Future production: define a retention lifecycle with partitioning for high-volume periods and an archival tier for older records. Retention policy is configurable per organization.
- Retention never permits hard deletion of records still within the required window.

## Export Requirements

- Auditors can export audit events via GET /api/audit-events/export.
- Exports are filterable by actor, action, resource type, resource id, and time range.
- Export output is a stable, documented format (JSON or CSV) suitable for compliance review.
- Large exports are produced by background workers and delivered through object storage (see SYSTEM_DESIGN.md section 5.3).

## Future Integrity Enhancements

For an enterprise-grade version, audit records can be strengthened with:

- Hash chaining, so each record references the hash of the prior record to make tampering detectable.
- Signed exports, so an exported set can be cryptographically verified.
- WORM storage for archived records.
- Formal retention and legal-hold policies.

These are out of scope for the MVP but the schema and write path are designed not
to preclude them.

## Relationship to Correlation IDs

The correlation_id is the spine of traceability. Given one correlation_id, an
auditor can reconstruct the API request, the resulting domain events, the audit
events, any cost records, the trace, and any incident. See OBSERVABILITY.md.
