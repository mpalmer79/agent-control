export { cn } from "./cn";

// Format a number as United States dollars.
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

// Format a number with thousands separators.
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

// Format a fraction (0 to 1) as a whole-number percentage.
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

// Format an ISO date string as a short, readable date.
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
