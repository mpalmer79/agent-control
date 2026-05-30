// Shared API envelope types aligned with API_CONTRACTS.md.
//
// These describe the response and error shapes the API layer will return in
// later phases. They are defined now so the UI and services share one contract.

export interface ApiResource<T> {
  data: T;
  correlationId: string;
}

export interface ApiCollection<T> {
  data: T[];
  page: {
    nextCursor: string | null;
    limit: number;
  };
  correlationId: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  correlationId: string;
}
