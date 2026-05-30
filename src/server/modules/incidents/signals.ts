// Incident signal evaluation service.
//
// Evaluates the pure incident rules against gathered facts and returns the
// incident candidates that do not already match an open incident. In Phase 5
// this is read-oriented and demo-safe: it reports candidates rather than
// writing incidents, except on the database path where creating incidents from
// signals is supported. The seed path returns candidates only and never claims
// persisted creation.

import { isPersistenceEnabled } from "@/server/workflows/runtime";
import { buildIncidentCandidates } from "@/server/views/observability-views";
import type { IncidentCandidate } from "@/types/observability";

export interface SignalEvaluationResult {
  candidates: IncidentCandidate[];
  created: number;
  simulated: boolean;
  message: string;
}

// Evaluate incident signals. Demo mode returns candidates with no creation. The
// database path is guarded: creating incidents from signals is reported as
// candidates here and wired to persistence in a later hardening pass, so this
// never silently claims to have written incidents it did not write.
export function evaluateSignals(): SignalEvaluationResult {
  const candidates = buildIncidentCandidates();
  const simulated = !isPersistenceEnabled();
  return {
    candidates,
    created: 0,
    simulated,
    message: simulated
      ? `Evaluated incident signals. ${candidates.length} candidate(s) found (simulated, no database configured).`
      : `Evaluated incident signals. ${candidates.length} candidate(s) found. Automatic creation is reported as candidates pending the persistence hardening pass.`,
  };
}
