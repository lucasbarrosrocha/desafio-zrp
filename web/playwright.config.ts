import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
  },
  // Runs the real backend alongside the web app so these e2e tests exercise
  // the full stack (web -> backend -> live Rick and Morty API), not mocks.
  webServer: [
    {
      command: "npm ci && npm run dev",
      cwd: "../backend",
      url: "http://localhost:3001/health",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "npm run start -- --port 3100",
      url: "http://localhost:3100",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: { BACKEND_API_URL: "http://localhost:3001" },
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
