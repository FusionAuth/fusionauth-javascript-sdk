import { Page, test, BrowserContext, expect, Cookie } from '@playwright/test';
import { quickstartPage } from '../pages/common.page';

test.describe('Login Endpoint Tests', () => {
  let page: Page;
  let quickstart: quickstartPage;
  let browserContext: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    browserContext = await browser.newContext();
    page = await browserContext.newPage();
    quickstart = new quickstartPage(page);
    await page.goto('/');
    await quickstart.navToLogIn();
  });

  test.afterAll(async () => {
    await page.close();
    await browserContext.close();
  });

  const checkCookieExistsAndHttpOnly = (
    cookies: Cookie[],
    name: string,
    httpOnly: boolean,
  ) => {
    const cookie = cookies.find(cookie => cookie.name === name);
    expect(cookie).toBeDefined();
    expect(cookie?.httpOnly).toBe(httpOnly);
  };

  const checkCookieDoesNotExist = (cookies: Cookie[], name: string) => {
    const cookie = cookies.find(cookie => cookie.name === name);
    expect(cookie).toBeUndefined();
  };

  test('Unauthenticated Cookies', async () => {
    const cookies = await browserContext.cookies();
    checkCookieDoesNotExist(cookies, 'app.at');
    checkCookieDoesNotExist(cookies, 'app.at_exp');
    checkCookieDoesNotExist(cookies, 'app.idt');
    checkCookieDoesNotExist(cookies, 'app.rt');
  });

  test('Authenticated Cookies', async () => {
    await quickstart.authenticate();
    const cookies = await browserContext.cookies();
    checkCookieExistsAndHttpOnly(cookies, 'app.at', true);
    checkCookieExistsAndHttpOnly(cookies, 'app.at_exp', false);
    checkCookieExistsAndHttpOnly(cookies, 'app.idt', false);
    checkCookieExistsAndHttpOnly(cookies, 'app.rt', true);
  });

  test('Post Logout Cookies', async () => {
    await quickstart.authenticate();
    await quickstart.logOut();
    const cookies = await browserContext.cookies();
    checkCookieDoesNotExist(cookies, 'app.at');
    checkCookieDoesNotExist(cookies, 'app.at_exp');
    checkCookieDoesNotExist(cookies, 'app.idt');
    checkCookieDoesNotExist(cookies, 'app.rt');
  });
});
