import { Page, test, BrowserContext, expect } from '@playwright/test';
import { quickstartPage } from '../pages/common.page';

test.describe('Endpoint Tests', () => {
  let page: Page;
  let quickstart: quickstartPage;
  let browserContext: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    browserContext = await browser.newContext();
    page = await browserContext.newPage();
    quickstart = new quickstartPage(page);
    await page.goto('/');
    await quickstart.navToLogIn();
    await quickstart.authenticate();
  });

  test('GET /app/me', async () => {
    const cookies = await browserContext.cookies();
    const appAtCookie = cookies.find(cookie => cookie.name === 'app.at');

    const response = await browserContext.request.get(
      'http://localhost:9011/app/me',
      {
        headers: {
          Authorization: `Bearer ${appAtCookie?.value}`,
          Origin: `http://localhost:${process.env.PORT}`,
          Referer: `http://localhost:${process.env.PORT}/`,
        },
      },
    );

    expect(response.headers()['content-type']).toContain('application/json');
    expect(response.ok()).toBeTruthy();
  });

  test('GET /app/logout', async () => {
    const cookieNames = ['app.at', 'app.idt', 'app.rt', 'app.at_exp'];
    const cookiesBeforeLogout = await browserContext.cookies();

    cookieNames.forEach(cookieName => {
      const cookie = cookiesBeforeLogout.find(
        cookie => cookie.name === cookieName,
      );
      expect(cookie).toBeDefined();
    });

    let is302 = false;

    await page.route('**/app/logout', route => route.continue());

    page.on('response', response => {
      if (response.url().includes('/app/logout') && response.status() === 302) {
        is302 = true;
        expect(response.headers()?.location).toContain('oauth2/logout?');
      }
    });

    await quickstart.logOut();
    expect(is302).toBe(true);

    const cookiesAfterLogout = await browserContext.cookies();
    cookieNames.forEach(cookieName => {
      const cookie = cookiesAfterLogout.find(
        cookie => cookie.name === cookieName,
      );
      expect(cookie).toBeUndefined();
    });
  });

  test('GET /app/login', async () => {
    await quickstart.logOut();

    let is302 = false;
    let codeChallengePassed = false;
    let redirectUrlEncoded: string | null = null;

    await page.route('**/app/login', route => route.continue());

    page.on('response', async response => {
      if (response.url().includes('/app/login') && response.status() === 302) {
        is302 = true;
        const locationHeader = response.headers()?.location;
        if (locationHeader) {
          expect(locationHeader).toContain('oauth2/authorize?');
          const queryParameters = new URLSearchParams(
            locationHeader.split('?')[1],
          );
          const codeChallenge = queryParameters.get('code_challenge');
          const codeChallengeMethod = queryParameters.get(
            'code_challenge_method',
          );
          expect(codeChallenge).toBeDefined();
          expect(codeChallengeMethod).toBe('S256');
          codeChallengePassed = true;
          redirectUrlEncoded = queryParameters.get('redirect_uri');
        }
      }
    });

    await quickstart.navToLogIn();

    expect(is302).toBe(true);
    expect(codeChallengePassed).toBe(true);
    expect(redirectUrlEncoded).not.toBeNull();
    expect(redirectUrlEncoded!).toContain('/app/callback');

    const cookies = await browserContext.cookies();
    const pkceCookie = cookies.find(cookie => cookie.name === 'app.pkce_v');
    expect(pkceCookie).toBeDefined();
  });
});
