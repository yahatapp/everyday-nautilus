import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { cubingWorker } from "./build/cubing-worker.ts";

export default defineConfig({
  plugins: [cubingWorker(), react()],
  server: { port: 5187, strictPort: true },
  optimizeDeps: { exclude: ["cubing"] },
  worker: { format: "es" },
});
