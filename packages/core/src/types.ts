export type NautilusStep =
  | "first-block"
  | "centers"
  | "last-triple"
  | "last-layer";
export type CaseSet = "l6x" | "l3c" | "1lll";
export type Penalty = "none" | "+2" | "dnf";
export type PracticeMode =
  | "full-solve"
  | "step"
  | "algorithm"
  | "recognition"
  | "recall";

export interface Scramble {
  id: string;
  event: "fto";
  moves: string;
  generatedAt: string;
  provider: string;
  providerVersion: string;
  mode: PracticeMode;
}

export interface ScrambleProvider {
  generate(): Promise<Scramble>;
}

export interface TimedResult {
  elapsedMs: number;
  penalty: Penalty;
}

export interface Solve extends TimedResult {
  id: string;
  sessionId: string;
  scramble: Scramble;
  recordedAt: string;
  note: string;
}

/** Unavailable, a completed finite average, or a completed DNF average. */
export type AverageResult =
  | { status: "insufficient" }
  | { status: "ok"; milliseconds: number }
  | { status: "dnf" };
