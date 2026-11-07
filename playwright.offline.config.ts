import { defineConfig, devices } from "@playwright/test";

// Tests the offline edition exactly as a user opens it: from disk via file://, with the network blocked.
export default defineConfig({
  testDir: "e2e-offline",
  timeout: 60_000,
  reporter: process.env.CI ? [["github"]] : [["list"]],
  use: { viewport: { width: 1600, height: 900 }, offline: true },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1600, height: 900 }, offline: true } }],
});
