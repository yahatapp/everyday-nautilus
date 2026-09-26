import type { AverageResult, TimedResult } from "./types";

export function effectiveMilliseconds(result: TimedResult): number {
  if (!Number.isFinite(result.elapsedMs) || result.elapsedMs < 0) {
    throw new RangeError("elapsedMs must be finite and non-negative");
  }
  if (result.penalty === "dnf") return Number.POSITIVE_INFINITY;
  return result.elapsedMs + (result.penalty === "+2" ? 2_000 : 0);
}

/** A chronological window; uses the latest five and trims one best and one worst. */
export function averageOf5(results: readonly TimedResult[]): AverageResult {
  if (results.length < 5) return { status: "insufficient" };
  const middle = results
    .slice(-5)
    .map(effectiveMilliseconds)
    .sort((a, b) => a - b)
    .slice(1, -1);
  const sum = middle.reduce((total, time) => total + time, 0);
  return Number.isFinite(sum)
    ? { status: "ok", milliseconds: sum / 3 }
    : { status: "dnf" };
}
