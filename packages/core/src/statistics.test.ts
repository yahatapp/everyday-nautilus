import { describe, expect, it } from "vitest";
import { averageOf5, effectiveMilliseconds } from "./statistics";
import type { TimedResult } from "./types";

const solve = (
  elapsedMs: number,
  penalty: TimedResult["penalty"] = "none",
): TimedResult => ({ elapsedMs, penalty });

describe("Ao5", () => {
  it("requires five attempts", () => {
    expect(averageOf5([solve(10_000)])).toEqual({ status: "insufficient" });
  });
  it("trims one fastest and slowest attempt in the latest window", () => {
    const times = [1, 10, 12, 14, 16, 100].map((seconds) =>
      solve(seconds * 1_000),
    );
    expect(averageOf5(times)).toEqual({ status: "ok", milliseconds: 14_000 });
  });
  it("includes a +2 penalty before ranking attempts", () => {
    expect(
      averageOf5([
        solve(10_000, "+2"),
        solve(11_000),
        solve(12_000),
        solve(13_000),
        solve(20_000),
      ]),
    ).toEqual({ status: "ok", milliseconds: 37_000 / 3 });
  });
  it("discards a single DNF as the worst attempt", () => {
    expect(
      averageOf5([
        solve(10_000),
        solve(11_000),
        solve(12_000),
        solve(13_000),
        solve(0, "dnf"),
      ]),
    ).toEqual({ status: "ok", milliseconds: 12_000 });
  });
  it("reports DNF when two attempts are DNF", () => {
    expect(
      averageOf5([
        solve(10_000),
        solve(11_000),
        solve(12_000),
        solve(0, "dnf"),
        solve(0, "dnf"),
      ]),
    ).toEqual({ status: "dnf" });
  });
  it("discards exactly two attempts even when all times tie", () => {
    expect(averageOf5(Array.from({ length: 5 }, () => solve(12_000)))).toEqual({
      status: "ok",
      milliseconds: 12_000,
    });
  });
});

it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
  "rejects invalid elapsed time %s",
  (elapsedMs) => {
    expect(() => effectiveMilliseconds(solve(elapsedMs))).toThrow(RangeError);
  },
);
