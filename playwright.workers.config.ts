import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testDir: "./apps/web",
  testMatch: ["**/e2e/*.spec.ts", "**/workers-e2e/*.spec.ts"],
  outputDir: "test-results/workers",
  use: {
    ...base.use,
    baseURL: "http://127.0.0.1:8787",
  },
  webServer: {
    command: "pnpm dev:workers",
    url: "http://127.0.0.1:8787",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
