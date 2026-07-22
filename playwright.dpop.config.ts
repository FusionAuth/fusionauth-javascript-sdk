/**
 * Playwright config for DPoP smoke tests.
 *
 * Unlike the main playwright.config.ts, this does NOT require a running
 * quickstart app (no SERVER_COMMAND / PORT env vars). The smoke tests talk
 * directly to FusionAuth at http://localhost:9011 and bypass SDKCore entirely.
 *
 * Usage:
 *   npx playwright test e2e/tests/dpop-smoke.test.ts \
 *     --config playwright.dpop.config.ts
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/dpop-smoke.test.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  use: {
    screenshot: 'on',
    // No baseURL — tests construct all URLs explicitly using FA_URL.
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
