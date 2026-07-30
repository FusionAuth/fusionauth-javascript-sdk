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

import { Page, test, BrowserContext, expect } from '@playwright/test';
import { quickstartPage } from '../pages/common.page';

interface DPoPTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
}

/**
 * Reads the DPoP token store entry from `localStorage` on the current page,
 * without needing to know the exact `clientId` ahead of time — finds the
 * first key matching `DPoPTokenStore`'s `fusionauth-sdk:tokens:<clientId>`
 * format. Returns `null` if no tokens are stored (e.g. logged out).
 *
 * Belt-and-suspenders: retries once on a destroyed execution context, in
 * case a trailing navigation is still in flight right after a redirect
 * round trip lands back on the app, which would otherwise fail the
 * `page.evaluate()` call below with "Execution context was destroyed".
 */
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

    // DPoP mode's startLogin() calls window.location.assign() straight to
    // FusionAuth — there is no intermediate /app/login redirect to
    // intercept, so the current page URL *is* the authorize request.
    const authorizeUrl = new URL(page.url());
    expect(authorizeUrl.pathname).toBe('/oauth2/authorize');
    expect(authorizeUrl.searchParams.get('response_type')).toBe('code');
    expect(authorizeUrl.searchParams.get('code_challenge_method')).toBe('S256');

    const dpopJkt = authorizeUrl.searchParams.get('dpop_jkt');
    const codeChallenge = authorizeUrl.searchParams.get('code_challenge');
    expect(dpopJkt).toBeTruthy();
    expect(codeChallenge).toBeTruthy();

    // Arm the listener before authenticating — handlePostRedirect() fires a
    // direct fetch() to /oauth2/token as soon as the app lands back on its
    // redirect_uri with the authorization code.
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

    // Tokens land in localStorage (DPoPTokenStore), not app.* cookies.
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
    // access token lifetime and the quickstart's autoRefreshSecondsBeforeExpiry
    // — allow more time than Playwright's default 30s test timeout.
    test.setTimeout(90_000);

    await quickstart.navToLogIn();

    // Arm the listener before authenticating — shouldAutoFetchUserInfo
    // triggers fetchUserInfo() right after login, which in DPoP mode calls
    // /oauth2/userinfo directly (via DPoPManager.fetch()) instead of the
    // hosted backend's /app/me.
    const userInfoResponsePromise = page.waitForResponse(response =>
      response.url().includes('/oauth2/userinfo'),
    );

    await quickstart.authenticate();

    const userInfoResponse = await userInfoResponsePromise;
    const userInfoRequest = userInfoResponse.request();
    expect(new URL(userInfoRequest.url()).pathname).toBe('/oauth2/userinfo');
    expect(userInfoRequest.headers()['dpop']).toBeTruthy();
    expect(userInfoResponse.ok()).toBe(true);

    // The app surfaces the fetched claims via userInfo.email.
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
    // A new access token must be issued on every refresh.
    expect(refreshedTokens!.accessToken).not.toBe(initialTokens!.accessToken);

    await quickstart.logOut();
  });

  test('Logout redirects directly to /oauth2/logout and clears local DPoP state', async () => {
    await quickstart.navToLogIn();
    await quickstart.authenticate();

    expect(await readDpopTokens(page)).not.toBeNull();

    // Arm the listener before logging out — startLogout() clears local
    // state, then navigates straight to FusionAuth (no /app/logout proxy).
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
});
