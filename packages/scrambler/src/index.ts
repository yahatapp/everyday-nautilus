import type { ScrambleProvider } from "@everyday-nautilus/core";
import { randomScrambleForEvent } from "cubing/scramble";

function scrambleId(): string {
  if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  // getRandomValues is also available when testing a phone over an HTTP LAN URL.
  return Array.from(
    globalThis.crypto.getRandomValues(new Uint8Array(16)),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

/** Browser/Node adapter. Native mobile worker support must be validated separately. */
export const ftoScrambleProvider: ScrambleProvider = {
  async generate() {
    const alg = await randomScrambleForEvent("fto");
    return {
      id: scrambleId(),
      event: "fto",
      moves: alg.toString(),
      generatedAt: new Date().toISOString(),
      provider: "cubing.js/randomScrambleForEvent",
      providerVersion: "0.63.7",
      mode: "full-solve",
    };
  },
};
