import { defineConfig, devices } from "@playwright/test";

const API = "http://localhost:3000";
const WEB = "http://localhost:5173";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: WEB,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // In-memory MongoDB + seed data; never touches a real database.
      command: "npm run demo",
      cwd: "../backend",
      url: `${API}/health`,
      env: { PORT: "3000", FRONTEND_URL: WEB, NODE_ENV: "test" },
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run build && npm run start",
      cwd: "../client",
      url: WEB,
      env: { NEXT_PUBLIC_API_URL: API },
      timeout: 300_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
