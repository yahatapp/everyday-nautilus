import assert from "node:assert/strict";
import { puzzles } from "cubing/puzzles";
import { randomScrambleForEvent } from "cubing/scramble";
import { setSearchDebug } from "cubing/search";

setSearchDebug({ logPerf: false, scramblePrefetchLevel: "none" });
const started = performance.now();
const scramble = await randomScrambleForEvent("fto");
const puzzle = await puzzles.fto.kpuzzle();
const solved = puzzle.defaultPattern();
const scrambled = solved.applyAlg(scramble);
assert(!scrambled.isIdentical(solved), "Scramble must change the solved state");
assert(
  scrambled.applyAlg(scramble.invert()).isIdentical(solved),
  "Inverse must restore the state",
);
console.log(
  `FTO random-state scramble verified (${Math.round(performance.now() - started)} ms)`,
);
console.log(scramble.toString());
