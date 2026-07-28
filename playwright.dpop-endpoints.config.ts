/**
 * Playwright config for DPoP endpoint tests.
 *
 * Mirrors the main playwright.config.ts, but only runs
 * e2e/tests/dpop-endpoints.test.ts. Unlike playwright.dpop.config.ts (which
 * bypasses SDKCore entirely), this drives a real consuming quickstart
 * application through its UI — the app must be configured with
 * `useDpop: true` and pointed at a real FusionAuth instance.
 *
 * Requires SERVER_COMMAND / PORT env vars, same as the main config, and
 * cannot be combined with endpoints.test.ts / cookies.test.ts in the same
 * invocation — those require a hosted-backend-mode quickstart instead.
 *
 * Usage:
 *   SERVER_COMMAND="your-dpop-quickstart-start-command" PORT=your-port-number \
 *     npx playwright test e2e/tests/dpop-endpoints.test.ts \
 *     --config playwright.dpop-endpoints.config.ts
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/dpop-endpoints.test.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  use: {
    baseURL: `http://localhost:${process.env.PORT}`,
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `${process.env.SERVER_COMMAND}`,
    url: `http://localhost:${process.env.PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
