import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      // `server-only` throws unconditionally outside Next's own bundler, which
      // is the only place that actually swaps it for a no-op; stub it here so
      // tests can import server-side modules directly.
      "server-only": path.resolve(import.meta.dirname, "./test/server-only-stub.ts"),
    },
  },
});
