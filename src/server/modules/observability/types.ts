export interface MetricPoint {
  name: string;
  value: number;
  unit: string;
  correlationId?: string;
}

export interface TraceLookup {
  correlationId: string;
}
