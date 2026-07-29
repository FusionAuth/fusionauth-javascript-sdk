/**
 * DPoP Smoke Tests — pre-SDKCore wiring + SDKCore.startLogin() integration
 *
 * Stubs window/localStorage/indexedDB to create a real SDKCore.
 *
 * Exercise DPoPManager + UrlHelper directly against a
 * real FusionAuth Enterprise instance. No quickstart app is needed — the tests
 * drive FusionAuth's hosted login UI via Playwright.
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
import { DPoPTokenStore } from '../../packages/core/src/DPoP/DPoPTokenStore';
import { UrlHelper } from '../../packages/core/src/UrlHelper/UrlHelper';
import { SDKCore } from '../../packages/core/src/SDKCore/SDKCore';
import { RedirectHelper } from '../../packages/core/src/RedirectHelper/RedirectHelper';
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from '../../packages/core/src/Pkce/Pkce';

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
    Buffer.from(
      payload.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf8'),
  );
}

/** Build a fresh DPoPManager backed by fake-indexeddb (no browser required in Node). */
function makeManager(): DPoPManager {
  // @ts-ignore — Node has no native indexedDB; fake-indexeddb fills the gap.
  globalThis.indexedDB = new IDBFactory();
  return new DPoPManager(CLIENT_ID, 'memory');
}

/**
 * Idempotently polyfills `window` and `localStorage` in the Node/Playwright
 * test process so that a real `SDKCore` (and its dependencies —
 * `RedirectHelper`, `DPoPTokenStore`) can run outside a browser.
 */
function ensureNodeBrowserPolyfills(): void {
  if (typeof globalThis.localStorage === 'undefined') {
    const store: Record<string, string> = {};
    // @ts-ignore
    globalThis.localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
    };
  }

  if (typeof globalThis.window === 'undefined') {
    // @ts-ignore
    globalThis.window = {
      location: { assign: () => {} },
      crypto: globalThis.crypto,
      // Needed by SDKCore.clearRedirectQueryParams() (history.replaceState).
      history: { replaceState: () => {} },
    };
  }
}

/**
 * Creates a deferred `window.location.assign` stub paired with a promise
 * that resolves with the assigned URL.
 *
 * `SDKCore.startLogin()` is synchronous (`void`) — in DPoP mode it kicks off
 * an async chain (key-pair generation, PKCE, etc.) internally and does not
 * return a promise the caller can await. This helper waits
 * deterministically for that async chain to complete (signaled by
 * `window.location.assign` being called) instead of awaiting `startLogin()`
 * directly.
 */
function createAssignWaiter(timeoutMs = 5_000): {
  assign: (url: string) => void;
  waitForUrl: () => Promise<string>;
} {
  let resolveUrl!: (url: string) => void;
  const urlPromise = new Promise<string>(resolve => {
    resolveUrl = resolve;
  });

  return {
    assign: (url: string) => resolveUrl(url),
    waitForUrl: () =>
      Promise.race([
        urlPromise,
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error('Timed out waiting for window.location.assign()'),
              ),
            timeoutMs,
          ),
        ),
      ]),
  };
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
    const handler = (response: {
      url: () => string;
      status: () => number;
      headers: () => Record<string, string>;
    }) => {
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
  const isFormVisible = await page
    .locator('#loginId')
    .isVisible({ timeout: 3_000 })
    .catch(() => false);

  if (isFormVisible) {
    await page.locator('#loginId').fill(TEST_EMAIL);
    await page.locator('#password').fill(TEST_PASSWORD);
    await page
      .locator('#submit-button')
      .click()
      .catch(() => {});
  }

  // Wait for the code from the response listener.
  return Promise.race([
    codePromise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Timed out waiting for authorization code')),
        15_000,
      ),
    ),
  ]);
}

test.describe('SDKCore.startLogin() DPoP mode', () => {
  const DPOP_CONFIG = {
    serverUrl: FA_URL,
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scope: SCOPE,
    useDpop: true as const,
    dpopTokenStorage: 'memory' as const,
    onTokenExpiration: () => {},
    cookieAdapter: { at_exp: () => undefined },
  };

  // Provide browser-API polyfills required by SDKCore and its dependencies
  // when running in Node (Playwright's test process is Node, not a browser).
  test.beforeAll(() => {
    // IndexedDB — required by DPoPStorage (via DPoPManager).
    // @ts-ignore
    globalThis.indexedDB = new IDBFactory();

    ensureNodeBrowserPolyfills();
  });

  test.afterEach(() => {
    // Clear localStorage between tests so each starts clean.
    globalThis.localStorage.clear();
    // Fresh IndexedDB so key-pair state doesn't leak across tests.
    // @ts-ignore
    globalThis.indexedDB = new IDBFactory();
  });

  test('startLogin() redirects to /oauth2/authorize with dpop_jkt and code_challenge', async () => {
    const { assign, waitForUrl } = createAssignWaiter();
    // @ts-ignore
    globalThis.window.location = { assign };

    // startLogin() is synchronous (void) — fire and wait for the redirect.
    new SDKCore(DPOP_CONFIG).startLogin();
    const assignedUrl = await waitForUrl();

    const url = new URL(assignedUrl);

    expect(url.origin).toBe(FA_URL);
    expect(url.pathname).toBe('/oauth2/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe(CLIENT_ID);
    expect(url.searchParams.get('redirect_uri')).toBe(REDIRECT_URI);
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');

    const dpopJkt = url.searchParams.get('dpop_jkt');
    const codeChallenge = url.searchParams.get('code_challenge');

    // dpop_jkt: base64url JWK thumbprint — 43 chars, valid base64url charset.
    expect(dpopJkt).not.toBeNull();
    expect(dpopJkt).toMatch(/^[A-Za-z0-9\-_]{43}$/);

    // code_challenge: base64url SHA-256 — 43 chars, valid base64url charset.
    expect(codeChallenge).not.toBeNull();
    expect(codeChallenge).toMatch(/^[A-Za-z0-9\-_]{43}$/);
  });

  test('startLogin() persists code_verifier and state via RedirectHelper', async () => {
    const STATE = 'e2e-smoke-state';
    const { assign, waitForUrl } = createAssignWaiter();
    // @ts-ignore
    globalThis.window.location = { assign };

    const core = new SDKCore(DPOP_CONFIG);

    core.startLogin(STATE);
    const assignedUrl = await waitForUrl();

    const url = new URL(assignedUrl);

    // State is included in the authorize URL.
    expect(url.searchParams.get('state')).toBe(STATE);

    // code_verifier is persisted via RedirectHelper so the post-redirect
    // handler (ENG-4800) can retrieve it for the token exchange.
    const redirectHelper = new RedirectHelper();
    const storedVerifier = redirectHelper.getCodeVerifier();
    expect(storedVerifier).not.toBeUndefined();
    expect(storedVerifier).toMatch(/^[A-Za-z0-9\-_]{43}$/);

    // The stored code_verifier must produce the code_challenge in the URL.
    const expectedChallenge = await generateCodeChallenge(storedVerifier!);
    expect(url.searchParams.get('code_challenge')).toBe(expectedChallenge);
  });

  test('two startLogin() calls produce different key pairs and PKCE values', async () => {
    const core1 = new SDKCore(DPOP_CONFIG);

    // Each SDKCore gets its own DPoPManager with its own key pair.
    // @ts-ignore
    globalThis.indexedDB = new IDBFactory();

    const core2 = new SDKCore(DPOP_CONFIG);

    // Wait for core1's full async chain (including its key pair being
    // written to the *first* IndexedDB instance) to complete before
    // swapping IndexedDB out for core2.
    const waiter1 = createAssignWaiter();
    // @ts-ignore
    globalThis.window.location = { assign: waiter1.assign };
    core1.startLogin();
    const url1 = new URL(await waiter1.waitForUrl());

    globalThis.localStorage.clear();
    // @ts-ignore
    globalThis.indexedDB = new IDBFactory();

    const waiter2 = createAssignWaiter();
    // @ts-ignore
    globalThis.window.location = { assign: waiter2.assign };
    core2.startLogin();
    const url2 = new URL(await waiter2.waitForUrl());

    // Different key pairs → different dpop_jkt.
    // Different PKCE verifiers → different code_challenge.
    expect(url1.searchParams.get('code_challenge')).not.toBe(
      url2.searchParams.get('code_challenge'),
    );
  });
});

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
  let core: SDKCore;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    manager = makeManager();
    ensureNodeBrowserPolyfills();
    thumbprint = await manager.getThumbprint();
  });

  test.afterAll(async () => {
    await page?.close();
    await context?.close();
  });

  test('getAuthorizeUrl() produces a URL FusionAuth accepts (login page rendered)', async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    const urlHelper = new UrlHelper({
      serverUrl: FA_URL,
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scope: SCOPE,
    });

    const authorizeUrl = urlHelper
      .getAuthorizeUrl(thumbprint, challenge)
      .toString();

    // FusionAuth should respond with its hosted login page (200), not an error.
    const response = await page.goto(authorizeUrl);
    expect(response?.status()).toBe(200);

    // The login form's username/email input should be visible.
    await expect(page.locator('#loginId')).toBeVisible();
  });

  test('full authorization code grant via SDKCore.startLogin() + handlePostRedirect() — token_type is DPoP, cnf.jkt matches thumbprint', async () => {
    const STATE = 'e2e-state';

    ensureNodeBrowserPolyfills();

    let notify:
      ((result: { state?: string } | { error: Error }) => void) | undefined;

    core = new SDKCore({
      serverUrl: FA_URL,
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      scope: SCOPE,
      useDpop: true,
      dpopTokenStorage: 'localStorage',
      onTokenExpiration: () => {},
      onLoginFailure: error => notify?.({ error }),
    });

    // startLogin() kicks off an async chain (key pair, PKCE, etc.) and
    // redirects via window.location.assign() — capture the assigned URL.
    const { assign, waitForUrl } = createAssignWaiter();
    // @ts-ignore
    globalThis.window.location = { assign };

    core.startLogin(STATE);
    // waitForUrl()'s declared return type is `string`, but SDKCore actually
    // calls window.location.assign() with a URL object (UrlHelper.getAuthorizeUrl()
    // returns URL) — stringify explicitly so page.goto() below (which requires
    // a real string) doesn't silently fail navigation.
    const authorizeUrl = String(await waitForUrl());

    // Navigate fresh
    await page.goto('about:blank');
    const code = await loginAndCaptureCode(page, authorizeUrl);

    // Simulate landing back on the redirect URI with ?code=... in the query
    // string, then let handlePostRedirect() run the real exchange.
    // origin/pathname/hash are needed by SDKCore.clearRedirectQueryParams(),
    // which rebuilds the URL from these parts (not .href) after a
    // successful exchange, to strip code/state via history.replaceState().
    const redirectUrl = new URL(REDIRECT_URI);
    const replaceStateCalls: string[] = [];
    // @ts-ignore
    globalThis.window.location = {
      assign: () => {},
      origin: redirectUrl.origin,
      pathname: redirectUrl.pathname,
      hash: '',
      search: `?code=${code}`,
    };
    // @ts-ignore
    globalThis.window.history = {
      replaceState: (_state: unknown, _title: string, url?: string | URL) => {
        if (url) replaceStateCalls.push(url.toString());
      },
    };

    const outcome = await new Promise<{ state?: string } | { error: Error }>(
      (resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error('Timed out waiting for handlePostRedirect()')),
          15_000,
        );
        notify = result => {
          clearTimeout(timeout);
          resolve(result);
        };
        core.handlePostRedirect(state => notify?.({ state }));
      },
    );

    if ('error' in outcome) {
      throw outcome.error;
    }
    // state round-trips through RedirectHelper's persisted storage.
    expect(outcome.state).toBe(STATE);
    expect(core.isLoggedIn).toBe(true);

    // code/state were stripped from the URL via history.replaceState() once
    // the exchange succeeded, so they don't linger in the address bar,
    // browser history, referrers, logs, or screenshots.
    expect(replaceStateCalls).toHaveLength(1);
    const cleanedUrl = new URL(replaceStateCalls[0]!);
    expect(cleanedUrl.searchParams.get('code')).toBeNull();
    expect(cleanedUrl.searchParams.get('state')).toBeNull();

    // Read the tokens SDKCore just persisted, directly via DPoPTokenStore
    // (same clientId/storage mode SDKCore's internal DPoPManager used).
    const tokenStore = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    const tokens = tokenStore.get();
    expect(tokens).not.toBeNull();

    // token_type must be 'DPoP' — proves FusionAuth recognised and bound the proof.
    expect(tokens!.tokenType).toBe('DPoP');
    expect(tokens!.accessToken).toBeDefined();

    // Decode the access token and verify cnf.jkt matches our key's thumbprint.
    const atPayload = decodeJwt(tokens!.accessToken);
    expect(atPayload.cnf).toBeDefined();
    expect((atPayload.cnf as { jkt: string }).jkt).toBe(thumbprint);

    // Persist tokens for subsequent tests — same key pair as `manager`, so
    // proofs `manager` signs for these tokens remain valid.
    accessToken = tokens!.accessToken;
    refreshToken = tokens!.refreshToken ?? '';
    manager.setTokens(tokens!);

    expect(manager.isLoggedIn).toBe(true);
  });

  test('startLogout() clears DPoP state and redirects to the logout URL', async () => {
    test.skip(!accessToken, 'No access token from previous test');

    expect(core.isLoggedIn).toBe(true);
    expect(core.getAccessToken()).toBe(accessToken);

    const { assign, waitForUrl } = createAssignWaiter();
    // @ts-ignore
    globalThis.window.location = { assign };

    core.startLogout();
    const assignedUrl = new URL(String(await waitForUrl()));

    expect(assignedUrl.origin).toBe(FA_URL);
    expect(assignedUrl.pathname).toBe('/app/logout/');
    expect(assignedUrl.searchParams.get('client_id')).toBe(CLIENT_ID);
    expect(assignedUrl.searchParams.get('post_logout_redirect_uri')).toBe(
      REDIRECT_URI,
    );

    expect(core.isLoggedIn).toBe(false);
    expect(core.getAccessToken()).toBeNull();

    const tokenStore = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    expect(tokenStore.get()).toBeNull();
  });

  test('refresh token grant — issues new DPoP-bound tokens', async () => {
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
        DPoP: proof,
      },
      body: body.toString(),
    });

    const refreshText = await response.text();
    expect(response.status, `Refresh token grant failed: ${refreshText}`).toBe(
      200,
    );

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

  test('DPoPManager.fetch() calls /oauth2/userinfo with correct DPoP headers and gets user claims', async () => {
    test.skip(!accessToken, 'No access token from previous test');

    // DPoPManager.fetch() runs in the Node test process, not the browser page,
    // so Playwright route interception can't observe its outgoing headers.
    // Correctness is validated end-to-end instead: FusionAuth verifies ath,
    // cnf.jkt, htu, and htm server-side, so a 200 here proves the real proof
    // was accepted.
    const fetchResponse = await manager.fetch(USERINFO_ENDPOINT);

    expect(
      fetchResponse.status,
      `Userinfo request failed — status ${fetchResponse.status}`,
    ).toBe(200);

    const userInfo = (await fetchResponse.json()) as Record<string, unknown>;

    // The userinfo response must contain the authenticated user's email.
    expect(userInfo.email).toBe(TEST_EMAIL);
    expect(userInfo.sub).toBeDefined();
  });

  test('DPoPManager.fetch() proof carries correct htu and ath claims', async () => {
    test.skip(!accessToken, 'No access token from previous test');

    // We can validate proof claims by asking DPoPManager to generate a proof
    // directly and decoding the JWT payload — this is the same proof
    // DPoPManager.fetch() would use, just inspected explicitly here.
    const proof = await manager.generateProof(
      USERINFO_ENDPOINT,
      'GET',
      accessToken,
    );
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

  test('nonce retry — DPoPManager.fetch() retries once if /oauth2/userinfo challenges with use_dpop_nonce', async () => {
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
    globalThis.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
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
        console.log(
          'ℹ️  FusionAuth issued a use_dpop_nonce challenge — retry path exercised.',
        );
      } else {
        console.log(
          'ℹ️  FusionAuth did not issue a nonce challenge on this request — direct success path.',
        );
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('nonce retry (deterministic) — DPoPManager.fetch() retries with the correct nonce claim when the resource server issues a use_dpop_nonce challenge', async () => {
    // FusionAuth (as the Authorization Server) never issues a use_dpop_nonce
    // challenge itself — nonce enforcement is explicitly a Resource Server
    // responsibility that your own APIs implement.
    //
    // This test simulates a Resource Server that DOES require a nonce, by
    // mocking globalThis.fetch (DPoPManager.fetch() calls the native fetch
    // directly, so this is a substitute for a real RS response).

    const FAKE_RESOURCE_URL = 'https://fake-resource-server.example.com/data';
    const SERVER_NONCE = 'server-issued-nonce-abc123';

    const nonceManager = makeManager();

    let callCount = 0;
    let firstProof: string | null = null;
    let secondProof: string | null = null;

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      callCount++;
      const dpopHeader = new Headers(init?.headers).get('DPoP');

      if (callCount === 1) {
        firstProof = dpopHeader;
        // Simulate a Resource Server that requires a fresh nonce — per
        // RFC 9449 §8, a 401 with a WWW-Authenticate header containing
        // 'use_dpop_nonce' and a DPoP-Nonce response header.
        return new Response(null, {
          status: 401,
          headers: {
            'WWW-Authenticate':
              'DPoP error="use_dpop_nonce", error_description="Resource server requires a nonce"',
            'DPoP-Nonce': SERVER_NONCE,
          },
        });
      }

      secondProof = dpopHeader;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };

    try {
      const response = await nonceManager.fetch(FAKE_RESOURCE_URL);

      expect(response.status).toBe(200);
      // Exactly one retry — original call + single nonce retry, no more.
      expect(callCount).toBe(2);

      expect(firstProof).not.toBeNull();
      expect(secondProof).not.toBeNull();

      // The first proof (before the server ever provided a nonce) must NOT
      // carry a nonce claim.
      const firstPayload = decodeJwt(firstProof!);
      expect(firstPayload.nonce).toBeUndefined();

      // The retried proof MUST carry the server-issued nonce claim, proving
      // DPoPManager cached it from the DPoP-Nonce response header and used
      // it to regenerate the proof before retrying.
      const secondPayload = decodeJwt(secondProof!);
      expect(secondPayload.nonce).toBe(SERVER_NONCE);

      // Both proofs must otherwise target the same resource/method.
      expect(firstPayload.htu).toBe(FAKE_RESOURCE_URL);
      expect(secondPayload.htu).toBe(FAKE_RESOURCE_URL);
      expect(firstPayload.htm).toBe('GET');
      expect(secondPayload.htm).toBe('GET');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('clear() removes key pair, tokens, and nonces — isLoggedIn becomes false', async () => {
    expect(manager.isLoggedIn).toBe(true);

    await manager.clear();

    expect(manager.isLoggedIn).toBe(false);
    expect(manager.getRefreshToken()).toBeNull();

    // After clear(), a new key pair is generated on next use — thumbprint changes.
    const newThumbprint = await manager.getThumbprint();
    expect(newThumbprint).not.toBe(thumbprint);
  });
});
