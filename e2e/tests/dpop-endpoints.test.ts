/**
 * DPoP Endpoint Tests
 *
 * Mirrors `endpoints.test.ts`, but for a consuming quickstart application
 * configured with `useDpop: true`. Since DPoP mode has no hosted backend to
 * proxy through (`SDKCore` talks directly to FusionAuth), these tests
 * validate the *direct* calls to FusionAuth's `/oauth2/authorize`,
 * `/oauth2/token`, `/oauth2/userinfo`, and `/oauth2/logout` endpoints, and
 * check for tokens in `localStorage` instead of `app.*` HttpOnly cookies.
 *
 * Run with:
 *   SERVER_COMMAND="your-dpop-quickstart-start-command" PORT=your-port-number \
 *     npx playwright test e2e/tests/dpop-endpoints.test.ts \
 *     --config playwright.dpop-endpoints.config.ts
 *
 * Prerequisites:
 *   - A consuming quickstart application (e.g. fusionauth-quickstart-javascript-react-web)
 *     configured with `useDpop: true`, `shouldAutoRefresh: true`, and
 *     `shouldAutoFetchUserInfo: true`
 *   - short access token (JWT) lifetime configured — e.g. 30-60 seconds —
 *     so the auto-refresh test below doesn't need a long wall-clock wait.
 *     Set `autoRefreshSecondsBeforeExpiry` so the refresh fires comfortably
 *     before expiry (e.g. 20s before a 30s token lifetime).
 *   - CORS must be configured in FusionAuth (Settings -> System -> CORS)
 *     to allow the quickstart's origin (e.g. http://localhost:3000) to call
 *     `/oauth2/userinfo` directly: enable the filter, add the origin to
 *     Allowed origins, and add `DPoP` and `Authorization` to Allowed
 *     headers. Without this, the userinfo request's CORS preflight fails
 *     with "No 'Access-Control-Allow-Origin' header is present"

 */

import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { Page, Route, test, BrowserContext, expect } from '@playwright/test';
import { quickstartPage } from '../pages/common.page';

interface DPoPTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
}

interface DpopSdkConfig {
  clientId: string;
  serverUrl: string;
  redirectUri: string;
}

const CORE_BUNDLE_PATH = path.resolve(
  __dirname,
  '../../packages/core/dist/index.js',
);

async function readDpopTokens(page: Page): Promise<DPoPTokens | null> {
  const evaluateTokens = () =>
    page.evaluate(() => {
      const key = Object.keys(localStorage).find(k =>
        k.startsWith('fusionauth-sdk:tokens:'),
      );
      return key ? localStorage.getItem(key) : null;
    });

  let raw: string | null;
  try {
    raw = await evaluateTokens();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Execution context was destroyed')
    ) {
      await page.waitForLoadState('load');
      raw = await evaluateTokens();
    } else {
      throw error;
    }
  }
  return raw ? JSON.parse(raw) : null;
}

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const payload = jwt.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}

/** `ath` claim value per RFC 9449: `base64url(SHA-256(accessToken))`. */
function computeAth(accessToken: string): string {
  return createHash('sha256').update(accessToken).digest('base64url');
}

/**
 * Reads `client_id`, `redirect_uri`, and the FusionAuth origin off the
 * `/oauth2/authorize` URL. Call this immediately after
 * `quickstart.navToLogIn()` (before `authenticate()`), while `page.url()`
 * still points at the authorize redirect.
 */
function captureSdkConfig(page: Page): DpopSdkConfig {
  const authorizeUrl = new URL(page.url());
  const clientId = authorizeUrl.searchParams.get('client_id');
  const redirectUri = authorizeUrl.searchParams.get('redirect_uri');
  if (!clientId || !redirectUri) {
    throw new Error(
      'Expected client_id and redirect_uri on the /oauth2/authorize URL. ' +
        'Call captureSdkConfig() right after quickstart.navToLogIn().',
    );
  }
  return { clientId, redirectUri, serverUrl: authorizeUrl.origin };
}

/**
 * Injects a second, independent `SDKCore` instance into the page.
 * This is needed because `dpopFetch()` and `getAccessToken()` are only
 * available on the SDKCore instance, and none of these tests drive them
 * through UI interaction.
 */
async function injectDpopSdkCore(
  page: Page,
  config: DpopSdkConfig,
): Promise<void> {
  let bundleSource: string;
  try {
    bundleSource = fs.readFileSync(CORE_BUNDLE_PATH, 'utf-8');
  } catch {
    throw new Error(
      `Could not read ${CORE_BUNDLE_PATH}. Build @fusionauth-sdk/core first ` +
        '(e.g. `yarn build:core`).',
    );
  }

  const exportMatch = bundleSource.match(/(\S+)\s+as\s+SDKCore/);
  if (!exportMatch) {
    throw new Error(
      `Could not locate the SDKCore export in ${CORE_BUNDLE_PATH}.`,
    );
  }
  const localName = exportMatch[1];

  const script = `${bundleSource}
window.__e2eSdkCore = new ${localName}({
  clientId: ${JSON.stringify(config.clientId)},
  serverUrl: ${JSON.stringify(config.serverUrl)},
  redirectUri: ${JSON.stringify(config.redirectUri)},
  useDpop: true,
  dpopTokenStorage: 'localStorage',
  onTokenExpiration: () => {},
});`;

  await page.addScriptTag({ content: script, type: 'module' });
  await page.waitForFunction(() => (window as any).__e2eSdkCore !== undefined);
}

/**
 * Answers a CORS preflight `OPTIONS` request directly and returns `true`,
 * or returns `false` for any other method so the caller can run its real
 * request logic.
 *
 * `dpopFetch()` sends `Authorization`/`DPoP` headers, which are not
 * CORS-safelisted, so cross-origin requests to the mocked
 * `https://api.example.com` routes below trigger a browser preflight
 * `OPTIONS` request before the real `GET`. Since `page.route()` matches by
 * URL regardless of method, the preflight would otherwise hit the same
 * handler as the real request — inflating request counters and, if
 * answered with the real handler's status code (e.g. `401`), failing the
 * preflight outright and blocking the real request from ever being sent.
 */
function handleCorsPreflight(route: Route): boolean {
  if (route.request().method() !== 'OPTIONS') {
    return false;
  }
  route.fulfill({
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'Authorization, DPoP',
    },
  });
  return true;
}

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

  test.beforeEach(async () => {
    await page.goto('/');
  });

  test('Login redirects directly to /oauth2/authorize with dpop_jkt and code_challenge, then exchanges the code at /oauth2/token', async () => {
    await quickstart.navToLogIn();

    const authorizeUrl = new URL(page.url());
    expect(authorizeUrl.pathname).toBe('/oauth2/authorize');
    expect(authorizeUrl.searchParams.get('response_type')).toBe('code');
    expect(authorizeUrl.searchParams.get('code_challenge_method')).toBe('S256');

    const dpopJkt = authorizeUrl.searchParams.get('dpop_jkt');
    const codeChallenge = authorizeUrl.searchParams.get('code_challenge');
    expect(dpopJkt).toBeTruthy();
    expect(codeChallenge).toBeTruthy();

    const tokenExchangeResponsePromise = page.waitForResponse(
      response =>
        response.url().includes('/oauth2/token') &&
        response.request().method() === 'POST',
    );

    await quickstart.authenticate();

    const tokenExchangeResponse = await tokenExchangeResponsePromise;
    const tokenExchangeRequest = tokenExchangeResponse.request();
    expect(new URL(tokenExchangeRequest.url()).pathname).toBe('/oauth2/token');
    expect(tokenExchangeRequest.headers()['dpop']).toBeTruthy();

    const body = new URLSearchParams(tokenExchangeRequest.postData() ?? '');
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code_verifier')).toBeTruthy();

    const tokens = await readDpopTokens(page);
    expect(tokens).not.toBeNull();
    expect(tokens!.tokenType).toBe('DPoP');
    expect(tokens!.accessToken).toBeTruthy();

    const cookies = await browserContext.cookies();
    ['app.at', 'app.idt', 'app.rt', 'app.at_exp'].forEach(name => {
      expect(cookies.find(cookie => cookie.name === name)).toBeUndefined();
    });

    await quickstart.logOut();
  });

  test('User info is fetched after login, and the access token auto-refreshes via a direct /oauth2/token refresh_token grant', async () => {
    // The refresh window depends on the FusionAuth Application's configured
    // access token lifetime and the quickstart's autoRefreshSecondsBeforeExpiry.
    test.setTimeout(90_000);

    await quickstart.navToLogIn();

    const userInfoResponsePromise = page.waitForResponse(response =>
      response.url().includes('/oauth2/userinfo'),
    );

    await quickstart.authenticate();

    const userInfoResponse = await userInfoResponsePromise;
    const userInfoRequest = userInfoResponse.request();
    expect(new URL(userInfoRequest.url()).pathname).toBe('/oauth2/userinfo');
    expect(userInfoRequest.headers()['dpop']).toBeTruthy();
    expect(userInfoResponse.ok()).toBe(true);

    await expect(page.getByText('richard@example.com')).toBeVisible();

    const initialTokens = await readDpopTokens(page);
    expect(initialTokens).not.toBeNull();

    const refreshResponse = await page.waitForResponse(
      response =>
        response.url().includes('/oauth2/token') &&
        (response.request().postData() ?? '').includes(
          'grant_type=refresh_token',
        ),
      { timeout: 60_000 },
    );

    const refreshRequest = refreshResponse.request();
    expect(refreshRequest.headers()['dpop']).toBeTruthy();
    const body = new URLSearchParams(refreshRequest.postData() ?? '');
    expect(body.get('refresh_token')).toBeTruthy();

    const refreshedTokens = await readDpopTokens(page);
    expect(refreshedTokens).not.toBeNull();
    expect(refreshedTokens!.accessToken).not.toBe(initialTokens!.accessToken);

    await quickstart.logOut();
  });

  test('Logout redirects directly to /oauth2/logout and clears local DPoP state', async () => {
    await quickstart.navToLogIn();
    await quickstart.authenticate();

    expect(await readDpopTokens(page)).not.toBeNull();

    const logoutRequestPromise = page.waitForRequest(request =>
      request.url().includes('/oauth2/logout'),
    );

    await quickstart.logOut();

    const logoutRequest = await logoutRequestPromise;
    const logoutUrl = new URL(logoutRequest.url());
    expect(logoutUrl.pathname).toBe('/oauth2/logout');
    expect(logoutUrl.searchParams.get('client_id')).toBeTruthy();

    expect(await readDpopTokens(page)).toBeNull();
  });

  test('dpopFetch() sends Authorization: DPoP and DPoP proof headers with a correct ath claim', async () => {
    await quickstart.navToLogIn();
    const sdkConfig = captureSdkConfig(page);
    await quickstart.authenticate();

    await injectDpopSdkCore(page, sdkConfig);

    const accessToken = await page.evaluate(
      () => (window as any).__e2eSdkCore.getAccessToken() as string | null,
    );
    expect(accessToken).toBeTruthy();

    let capturedAuthHeader: string | undefined;
    let capturedDpopHeader: string | undefined;

    await page.route('https://api.example.com/data', route => {
      if (handleCorsPreflight(route)) return;

      const headers = route.request().headers();
      capturedAuthHeader = headers['authorization'];
      capturedDpopHeader = headers['dpop'];
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    const result = await page.evaluate(async () => {
      const response = await (window as any).__e2eSdkCore.dpopFetch(
        'https://api.example.com/data',
        { method: 'GET' },
      );
      return { status: response.status, ok: response.ok };
    });

    expect(result.ok).toBe(true);
    expect(capturedAuthHeader).toBe(`DPoP ${accessToken}`);
    expect(capturedDpopHeader).toBeTruthy();
    expect(capturedDpopHeader!.split('.').length).toBe(3);

    const proofPayload = decodeJwtPayload(capturedDpopHeader!);
    expect(proofPayload.ath).toBe(computeAth(accessToken!));
    expect(proofPayload.htm).toBe('GET');
    expect(new URL(proofPayload.htu as string).pathname).toBe('/data');

    const accessTokenAfterFetch = await page.evaluate(
      () => (window as any).__e2eSdkCore.getAccessToken() as string | null,
    );
    expect(accessTokenAfterFetch).toBe(accessToken);

    await quickstart.logOut();
  });

  test('dpopFetch() retries exactly once with the server nonce after a 401 use_dpop_nonce challenge', async () => {
    await quickstart.navToLogIn();
    const sdkConfig = captureSdkConfig(page);
    await quickstart.authenticate();

    await injectDpopSdkCore(page, sdkConfig);

    const serverNonce = 'e2e-test-nonce-abc123';
    let requestCount = 0;
    let retryDpopHeader: string | undefined;

    await page.route('https://api.example.com/nonce-protected', route => {
      if (handleCorsPreflight(route)) return;

      requestCount += 1;
      if (requestCount === 1) {
        route.fulfill({
          status: 401,
          headers: {
            'access-control-allow-origin': '*',
            'access-control-expose-headers': 'WWW-Authenticate, DPoP-Nonce',
            'www-authenticate': 'DPoP error="use_dpop_nonce"',
            'dpop-nonce': serverNonce,
          },
          body: '',
        });
        return;
      }
      retryDpopHeader = route.request().headers()['dpop'];
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      });
    });

    const result = await page.evaluate(async () => {
      const response = await (window as any).__e2eSdkCore.dpopFetch(
        'https://api.example.com/nonce-protected',
        { method: 'GET' },
      );
      return { status: response.status };
    });

    expect(requestCount).toBe(2);
    expect(result.status).toBe(200);
    expect(retryDpopHeader).toBeTruthy();
    expect(decodeJwtPayload(retryDpopHeader!).nonce).toBe(serverNonce);

    await quickstart.logOut();
  });

  test('dpopFetch() does not retry a second time when the retry also returns a 401 use_dpop_nonce', async () => {
    await quickstart.navToLogIn();
    const sdkConfig = captureSdkConfig(page);
    await quickstart.authenticate();

    await injectDpopSdkCore(page, sdkConfig);

    let requestCount = 0;

    await page.route('https://api.example.com/always-nonce', route => {
      if (handleCorsPreflight(route)) return;

      requestCount += 1;
      route.fulfill({
        status: 401,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-expose-headers': 'WWW-Authenticate, DPoP-Nonce',
          'www-authenticate': 'DPoP error="use_dpop_nonce"',
          'dpop-nonce': `e2e-test-nonce-${requestCount}`,
        },
        body: '',
      });
    });

    const result = await page.evaluate(async () => {
      const response = await (window as any).__e2eSdkCore.dpopFetch(
        'https://api.example.com/always-nonce',
        { method: 'GET' },
      );
      return { status: response.status };
    });

    // Exactly the initial request plus one retry - no further retries even
    // though the retry itself also returned 401 use_dpop_nonce.
    expect(requestCount).toBe(2);
    expect(result.status).toBe(401);

    await quickstart.logOut();
  });
});
