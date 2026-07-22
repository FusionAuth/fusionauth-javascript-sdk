/**
 * DPoP Endpoint Tests — quickstart UI-driven coverage (ENG-4800)
 *
 * Mirrors endpoints.test.ts, but for a "FA SDK consuming quickstart
 * application" configured with `useDpop: true`. Unlike endpoints.test.ts,
 * there is no Hosted Backend API involved: in DPoP mode, `SDKCore` talks
 * directly to FusionAuth's own `/oauth2/authorize` and `/oauth2/token`
 * endpoints, so there is no `/app/login`, `/app/callback`, etc. to test.
 *
 * Scope: only the login / authorization-code-exchange flow is covered here,
 * since that's all that's currently DPoP-aware in SDKCore:
 *   - `startLogin()` (ENG-4786)
 *   - `handlePostRedirect()` (ENG-4800)
 *
 * The following are intentionally NOT covered yet, because SDKCore doesn't
 * branch on `useDpop` for them (they fall back to the old cookie-mode
 * Hosted Backend behavior, which doesn't apply to a DPoP-only quickstart):
 *   - Logout — `startLogout()` doesn't call `DPoPManager.clear()` (ENG-4802)
 *   - Register — `startRegister()` has no DPoP branch
 *   - "me" / user info — `fetchUserInfo()` has no DPoP branch
 *   - Refresh — `refreshToken()` has no DPoP branch (ENG-4801)
 * Extend this file once those land.
 *
 * IMPORTANT: This suite must be run on its own, against a quickstart
 * instance started with `useDpop: true` — it cannot be combined with
 * endpoints.test.ts / cookies.test.ts in the same run, since those require
 * a cookie-mode quickstart instance instead.
 *
 * Prerequisites
 *   - A FusionAuth instance backing the quickstart, configured the same way
 *     as dpop-smoke.test.ts requires (PKCE required, `DPoP` allowed in CORS
 *     headers, etc.)
 *   - A "FA SDK consuming quickstart application" instance configured with
 *     `useDpop: true` (and, if applicable, `dpopTokenStorage: 'localStorage'`
 *     so tokens are readable via `page.evaluate()` below).
 *
 * Run with:
 *   SERVER_COMMAND="your-dpop-quickstart-start-command" PORT=your-port-number \
 *     npx playwright test e2e/tests/dpop-endpoints.test.ts
 */

import { Page, test, BrowserContext, expect } from '@playwright/test';
import { quickstartPage } from '../pages/common.page';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Decode the payload of a JWT without verifying the signature. */
function decodeJwt(jwt: string): Record<string, unknown> {
  const [, payload] = jwt.split('.');
  if (!payload) {
    throw new Error(`Not a valid JWT: ${jwt}`);
  }
  return JSON.parse(
    Buffer.from(
      payload.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf8'),
  );
}

/**
 * Shape persisted by `DPoPTokenStore` under the
 * `fusionauth-sdk:tokens:<clientId>` localStorage key.
 */
interface DPoPTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: 'DPoP';
}

/**
 * Reads back the DPoP tokens `SDKCore` persisted in `localStorage`, without
 * needing to know the quickstart's client ID up front — scans for the first
 * key matching `DPoPTokenStore`'s `fusionauth-sdk:tokens:<clientId>` format.
 * Returns `null` if no such key is present.
 */
async function readDpopTokens(page: Page): Promise<DPoPTokens | null> {
  const raw = await page.evaluate(() => {
    const key = Object.keys(localStorage).find(k =>
      k.startsWith('fusionauth-sdk:tokens:'),
    );
    return key ? localStorage.getItem(key) : null;
  });
  return raw ? (JSON.parse(raw) as DPoPTokens) : null;
}

/**
 * Clears all DPoP client-side state between tests: the `RedirectHelper`
 * marker/code_verifier, the `DPoPTokenStore` entry (both live in
 * `localStorage`), and the persisted key pair (IndexedDB). `logOut()` can't
 * be relied on for this today — `startLogout()` isn't DPoP-aware, so it
 * won't clear any of this itself (see file header).
 *
 * Navigates back to the quickstart app's own origin first — a test may
 * leave `page` sitting on FusionAuth's hosted login page (a different
 * origin), where `localStorage`/`indexedDB` calls would target the wrong
 * storage partition entirely.
 */
async function clearDpopState(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.evaluate(() => indexedDB.deleteDatabase('fusionauth-sdk:dpop'));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('DPoP Endpoint Tests', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;
  let quickstart: quickstartPage;
  let browserContext: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    browserContext = await browser.newContext();
    page = await browserContext.newPage();
    quickstart = new quickstartPage(page);
  });

  test.afterAll(async () => {
    await page?.close();
    await browserContext?.close();
  });

  test.afterEach(async () => {
    await clearDpopState(page);
  });

  test('Login redirects to /oauth2/authorize directly with dpop_jkt and code_challenge', async () => {
    await page.goto('/');

    let authorizeUrl: URL | null = null;
    page.on('request', request => {
      if (request.url().includes('/oauth2/authorize')) {
        authorizeUrl = new URL(request.url());
      }
    });

    // In DPoP mode, startLogin() redirects the browser directly to
    // FusionAuth's /oauth2/authorize — there is no intermediate /app/login
    // 302 to intercept, unlike the cookie-mode 'GET /app/login' test.
    await quickstart.navToLogIn();

    expect(authorizeUrl).not.toBeNull();
    expect(authorizeUrl!.searchParams.get('response_type')).toBe('code');

    const dpopJkt = authorizeUrl!.searchParams.get('dpop_jkt');
    expect(dpopJkt).not.toBeNull();
    expect(dpopJkt).toMatch(/^[A-Za-z0-9\-_]{43}$/);

    const codeChallenge = authorizeUrl!.searchParams.get('code_challenge');
    expect(codeChallenge).not.toBeNull();
    expect(codeChallenge).toMatch(/^[A-Za-z0-9\-_]{43}$/);
    expect(authorizeUrl!.searchParams.get('code_challenge_method')).toBe(
      'S256',
    );

    // No Hosted Backend hop — redirect_uri points back at the SPA itself,
    // not an /app/callback route.
    const redirectUri = authorizeUrl!.searchParams.get('redirect_uri');
    expect(redirectUri).not.toBeNull();
    expect(redirectUri).not.toContain('/app/callback');

    // PKCE state is persisted client-side via RedirectHelper (localStorage),
    // not via an app.pkce_v cookie.
    const cookies = await browserContext.cookies();
    expect(
      cookies.find(cookie => cookie.name === 'app.pkce_v'),
    ).toBeUndefined();
  });

  test('Completes the authorization code grant and stores DPoP-bound tokens', async () => {
    await page.goto('/');
    await quickstart.navToLogIn();
    await quickstart.authenticate();

    // authenticate() already waits for the Logout button to appear, which
    // reflects SDKCore.isLoggedIn reading true from DPoPManager (i.e. valid,
    // unexpired tokens are present) — no further wait needed here.

    const tokens = await readDpopTokens(page);
    expect(tokens).not.toBeNull();
    expect(tokens!.tokenType).toBe('DPoP');
    expect(tokens!.accessToken).toBeDefined();
    expect(tokens!.expiresAt).toBeGreaterThan(Date.now());

    // Decode the access token and confirm it carries a DPoP `cnf.jkt`
    // confirmation claim — proof the token is DPoP-bound, not a bearer token.
    const atPayload = decodeJwt(tokens!.accessToken);
    expect(atPayload.cnf).toBeDefined();
    expect((atPayload.cnf as { jkt?: string })?.jkt).toBeDefined();

    // DPoP mode never touches cookies — confirms the Hosted Backend API
    // (cookie mode) path was never engaged.
    const cookies = await browserContext.cookies();
    ['app.at', 'app.at_exp', 'app.rt'].forEach(name => {
      expect(cookies.find(cookie => cookie.name === name)).toBeUndefined();
    });
  });
});
