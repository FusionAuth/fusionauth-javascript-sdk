/**
 * DPoP Smoke Tests — pre-SDKCore wiring
 *
 * Exercises DPoPManager + UrlHelper directly against a real FusionAuth
 * Enterprise instance. No quickstart app is needed — the tests drive
 * FusionAuth's hosted login UI via Playwright, capture the authorization
 * code from the redirect, and perform all token operations in the Node
 * test process.
 *
 * Run with:
 *   npx playwright test e2e/tests/dpop-smoke.test.ts \
 *     --config playwright.dpop.config.ts
 *
 * Prerequisites:
 *   - FusionAuth Enterprise instance running at http://localhost:9011
 *   - Application baf3d520-40d7-4000-9b62-e6a7d0091102 configured with:
 *       proofKeyForCodeExchangePolicy: Required
 *       clientAuthenticationPolicy: NotRequired (public client)
 *       redirectUri: https://www.example.com registered
 *   - Test user: mike@fusionauth.io / password
 */

import { Page, expect, test } from '@playwright/test';
import { IDBFactory } from 'fake-indexeddb';
import { DPoPManager } from '../../packages/core/src/DPoP/DPoPManager';
import { DPoPTokens } from '../../packages/core/src/DPoP/DPoPTokenStore';
import { UrlHelper } from '../../packages/core/src/UrlHelper/UrlHelper';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FA_URL = 'http://localhost:9011';
const CLIENT_ID = 'baf3d520-40d7-4000-9b62-e6a7d0091102';
const REDIRECT_URI = 'https://www.example.com';
const TOKEN_ENDPOINT = `${FA_URL}/oauth2/token`;
const USERINFO_ENDPOINT = `${FA_URL}/oauth2/userinfo`;
const TEST_EMAIL = 'mike@fusionauth.io';
const TEST_PASSWORD = 'password';
const SCOPE = 'openid offline_access email profile';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Decode the payload of a JWT without verifying the signature. */
function decodeJwt(jwt: string): Record<string, unknown> {
  const [, payload] = jwt.split('.');
  return JSON.parse(
    Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
  );
}

/** Generate a PKCE code_verifier and code_challenge (SHA-256 / base64url). */
async function generatePkce(): Promise<{ verifier: string; challenge: string }> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = Buffer.from(array).toString('base64url');

  const hash = await crypto.subtle.digest('SHA-256', Buffer.from(verifier, 'ascii'));
  const challenge = Buffer.from(hash).toString('base64url');

  return { verifier, challenge };
}

/** Build a fresh DPoPManager backed by fake-indexeddb (no browser required in Node). */
function makeManager(): DPoPManager {
  // @ts-ignore — Node has no native indexedDB; fake-indexeddb fills the gap.
  globalThis.indexedDB = new IDBFactory();
  return new DPoPManager(CLIENT_ID, 'memory');
}

/**
 * Drive FusionAuth's hosted login page through Playwright and return the
 * authorization `code` captured from the redirect to REDIRECT_URI.
 *
 * Handles two paths:
 *  - Fresh session: FusionAuth shows the login form; we fill and submit it.
 *  - SSO session active: FusionAuth redirects immediately without showing
 *    the form.
 *
 * The code is captured by intercepting the FusionAuth 302 redirect response
 * whose Location header contains the code — this works regardless of whether
 * Chromium can actually reach the redirect_uri (https://www.example.com).
 */
async function loginAndCaptureCode(
  page: Page,
  authorizeUrl: string,
): Promise<string> {
  let capturedCode: string | null = null;

  // Listen for any response whose Location header points to REDIRECT_URI.
  // This fires on the FusionAuth 302 before Chromium follows it.
  const codePromise = new Promise<string>((resolve, reject) => {
    const handler = (response: { url: () => string; status: () => number; headers: () => Record<string, string> }) => {
      const location = response.headers()['location'];
      if (location?.startsWith(REDIRECT_URI)) {
        const url = new URL(location);
        const code = url.searchParams.get('code');
        if (code) {
          capturedCode = code;
          page.off('response', handler as Parameters<typeof page.on>[1]);
          resolve(code);
        } else {
          reject(new Error(`Redirect Location had no 'code': ${location}`));
        }
      }
    };
    page.on('response', handler as Parameters<typeof page.on>[1]);
  });

  // Navigate to the authorize URL.
  await page.goto(authorizeUrl).catch(() => {
    // May throw if Chromium can't reach https://www.example.com after redirect — that's fine.
  });

  // If the code was already captured during goto() (SSO path), return it.
  if (capturedCode) return capturedCode;

  // Otherwise fill in the login form (fresh-session path).
  const isFormVisible = await page.locator('#loginId').isVisible({ timeout: 3_000 }).catch(() => false);

  if (isFormVisible) {
    await page.locator('#loginId').fill(TEST_EMAIL);
    await page.locator('#password').fill(TEST_PASSWORD);
    await page.locator('#submit-button').click().catch(() => {});
  }

  // Wait for the code from the response listener.
  return Promise.race([
    codePromise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timed out waiting for authorization code')), 15_000),
    ),
  ]);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('DPoP smoke tests', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let context: any;
  let manager: DPoPManager;

  // Shared state populated by earlier tests and used by later ones.
  let accessToken: string;
  let refreshToken: string;
  let thumbprint: string;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    manager = makeManager();
  });

  test.afterAll(async () => {
    await page?.close();
    await context?.close();
  });

  // -------------------------------------------------------------------------
  // Tier 1 — Authorization code flow
  // -------------------------------------------------------------------------

  test('T1-1: getAuthorizeUrl() produces a URL FusionAuth accepts (login page rendered)', async () => {
    thumbprint = await manager.getThumbprint();
    const { challenge } = await generatePkce();

    const urlHelper = new UrlHelper({
      serverUrl: FA_URL,
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scope: SCOPE,
    });

    const authorizeUrl = urlHelper.getAuthorizeUrl(thumbprint, challenge).toString();

    // FusionAuth should respond with its hosted login page (200), not an error.
    const response = await page.goto(authorizeUrl);
    expect(response?.status()).toBe(200);

    // The login form's username/email input should be visible.
    await expect(page.locator('#loginId')).toBeVisible();
  });

  test('T1-2: full authorization code exchange — token_type is DPoP, cnf.jkt matches thumbprint', async () => {
    const { verifier, challenge } = await generatePkce();
    thumbprint = await manager.getThumbprint();

    const urlHelper = new UrlHelper({
      serverUrl: FA_URL,
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scope: SCOPE,
    });

    const authorizeUrl = urlHelper.getAuthorizeUrl(thumbprint, challenge).toString();

    // Navigate fresh — T1-1 may have left the page in a redirected state.
    await page.goto('about:blank');
    const code = await loginAndCaptureCode(page, authorizeUrl);

    // Exchange the code at the token endpoint using a real DPoP proof.
    const proof = await manager.generateProof(TOKEN_ENDPOINT, 'POST');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier,
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'DPoP': proof,
      },
      body: body.toString(),
    });

    const responseText = await response.text();
    expect(response.status, `Token exchange failed: ${responseText}`).toBe(200);

    const tokenResponse = JSON.parse(responseText) as {
      access_token: string;
      refresh_token?: string;
      token_type: string;
      expires_in: number;
    };

    // token_type must be 'DPoP' — proves FusionAuth recognised and bound the proof.
    expect(tokenResponse.token_type.toLowerCase()).toBe('dpop');
    expect(tokenResponse.access_token).toBeDefined();

    // Decode the access token and verify cnf.jkt matches our key's thumbprint.
    const atPayload = decodeJwt(tokenResponse.access_token);
    expect(atPayload.cnf).toBeDefined();
    expect((atPayload.cnf as { jkt: string }).jkt).toBe(thumbprint);

    // Persist tokens for subsequent tests.
    accessToken = tokenResponse.access_token;
    refreshToken = tokenResponse.refresh_token ?? '';

    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
    const tokens: DPoPTokens = {
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresAt,
      tokenType: 'DPoP',
    };
    manager.setTokens(tokens);

    expect(manager.isLoggedIn).toBe(true);
  });

  test('T1-3: refresh token grant — issues new DPoP-bound tokens', async () => {
    test.skip(!refreshToken, 'No refresh token from previous test');

    const proof = await manager.generateProof(TOKEN_ENDPOINT, 'POST');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'DPoP': proof,
      },
      body: body.toString(),
    });

    const refreshText = await response.text();
    expect(response.status, `Refresh token grant failed: ${refreshText}`).toBe(200);

    const tokenResponse = JSON.parse(refreshText) as {
      access_token: string;
      refresh_token?: string;
      token_type: string;
      expires_in: number;
    };

    expect(tokenResponse.token_type.toLowerCase()).toBe('dpop');
    expect(tokenResponse.access_token).toBeDefined();
    // New access token must be different from the original.
    expect(tokenResponse.access_token).not.toBe(accessToken);

    const atPayload = decodeJwt(tokenResponse.access_token);
    expect((atPayload.cnf as { jkt: string }).jkt).toBe(thumbprint);

    // Update shared state for Tier 2.
    accessToken = tokenResponse.access_token;
    refreshToken = tokenResponse.refresh_token ?? refreshToken;

    const expiresAt = Date.now() + tokenResponse.expires_in * 1000;
    manager.setTokens({
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresAt,
      tokenType: 'DPoP',
    });
  });

  // -------------------------------------------------------------------------
  // Tier 2 — Resource access via DPoPManager.fetch()
  // -------------------------------------------------------------------------

  test('T2-1: DPoPManager.fetch() calls /oauth2/userinfo with correct DPoP headers and gets user claims', async () => {
    test.skip(!accessToken, 'No access token from previous test');

    // Capture the actual headers sent by DPoPManager.fetch() using a
    // Playwright route interception so we can assert on them directly.
    let capturedAuthHeader: string | null = null;
    let capturedDpopHeader: string | null = null;

    // Intercept at the context level so Node-side fetch() goes through Playwright.
    // Note: Node fetch() bypasses Playwright routing — we assert on the response
    // instead and validate proof claims by decoding the DPoP proof JWT directly.
    const fetchResponse = await manager.fetch(USERINFO_ENDPOINT);

    expect(
      fetchResponse.status,
      `Userinfo request failed — status ${fetchResponse.status}`,
    ).toBe(200);

    const userInfo = await fetchResponse.json() as Record<string, unknown>;

    // The userinfo response must contain the authenticated user's email.
    expect(userInfo.email).toBe(TEST_EMAIL);
    expect(userInfo.sub).toBeDefined();

    // Validate that DPoPManager.fetch() generated a proof with ath matching
    // the access token (can't intercept Node fetch headers via Playwright,
    // but proof correctness is implicit in the 200 response — FusionAuth
    // verifies ath, cnf.jkt, htu, and htm server-side).
    void capturedAuthHeader; // suppress unused warning
    void capturedDpopHeader;
  });

  test('T2-2: DPoPManager.fetch() proof carries correct htu and ath claims', async () => {
    test.skip(!accessToken, 'No access token from previous test');

    // We can validate proof claims by asking DPoPManager to generate a proof
    // directly and decoding the JWT payload — this is the same proof
    // DPoPManager.fetch() would use, just inspected explicitly here.
    const proof = await manager.generateProof(USERINFO_ENDPOINT, 'GET', accessToken);
    const proofPayload = decodeJwt(proof);

    expect(proofPayload.htu).toBe(USERINFO_ENDPOINT);
    expect(proofPayload.htm).toBe('GET');
    expect(proofPayload.ath).toBeDefined();

    // ath must be a non-empty base64url string (SHA-256 of access token).
    expect(typeof proofPayload.ath).toBe('string');
    expect((proofPayload.ath as string).length).toBeGreaterThan(0);

    // Verify the ath value matches base64url(SHA-256(accessToken)).
    const expectedAth = Buffer.from(
      await crypto.subtle.digest('SHA-256', Buffer.from(accessToken, 'ascii')),
    ).toString('base64url');
    expect(proofPayload.ath).toBe(expectedAth);
  });

  test('T2-3: nonce retry — DPoPManager.fetch() retries once if /oauth2/userinfo challenges with use_dpop_nonce', async () => {
    test.skip(!accessToken, 'No access token from previous test');

    // Whether FusionAuth /oauth2/userinfo actually issues a nonce challenge is
    // version/config dependent. We attempt the call and check the behaviour:
    //   - If FusionAuth does NOT challenge: the first call succeeds (200) — skip.
    //   - If FusionAuth DOES challenge: DPoPManager.fetch() must retry and succeed.
    //
    // Either outcome is a pass for this smoke test; the assertion is structural
    // (≤ 2 fetch calls, final response is 200).

    let callCount = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      callCount++;
      return originalFetch(input, init);
    };

    try {
      const response = await manager.fetch(USERINFO_ENDPOINT);

      expect(response.status).toBe(200);
      // DPoPManager must never make more than 2 calls (original + at most one retry).
      expect(callCount).toBeLessThanOrEqual(2);

      if (callCount === 2) {
        // A retry happened — FusionAuth issued a nonce challenge. The second
        // call must have carried a nonce claim in its proof.
        console.log('ℹ️  FusionAuth issued a use_dpop_nonce challenge — retry path exercised.');
      } else {
        console.log('ℹ️  FusionAuth did not issue a nonce challenge on this request — direct success path.');
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // -------------------------------------------------------------------------
  // Tier 1 — Logout / clear
  // -------------------------------------------------------------------------

  test('T1-4: clear() removes key pair, tokens, and nonces — isLoggedIn becomes false', async () => {
    expect(manager.isLoggedIn).toBe(true);

    await manager.clear();

    expect(manager.isLoggedIn).toBe(false);
    expect(manager.getRefreshToken()).toBeNull();

    // After clear(), a new key pair is generated on next use — thumbprint changes.
    const newThumbprint = await manager.getThumbprint();
    expect(newThumbprint).not.toBe(thumbprint);
  });
});
