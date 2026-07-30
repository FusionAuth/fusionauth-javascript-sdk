import { Locator, Page, expect } from '@playwright/test';

const Locators = {
  logInBtn: 'role=button[name="Login"]',
  loginInput: 'role=textbox[name="Login"]',
  passwordInput: 'role=textbox[name="Password"]',
  submitBtn: 'role=button[name="Submit"]',
  createAccountBtn: 'role=button[name="Create a new account."]',
  registerBtn: 'role=button[name="Register"]',
  logOutBtn: 'text=Logout',
} as const;

type LocatorsKey = keyof typeof Locators;

export class quickstartPage {
  readonly page: Page;
  readonly locators: Record<LocatorsKey, Locator>;

  constructor(page: Page) {
    this.page = page;
    this.locators = Object.keys(Locators).reduce(
      (acc, key) => {
        acc[key as LocatorsKey] = page.locator(Locators[key as LocatorsKey]);
        return acc;
      },
      {} as Record<LocatorsKey, Locator>,
    );
  }

  async navToLogIn() {
    await this.locators.logInBtn.nth(0).click();
    await expect(this.locators.loginInput).toBeVisible();
  }

  async authenticate() {
    await this.locators.loginInput.click();
    await this.locators.loginInput.clear();
    await this.locators.loginInput.fill('richard@example.com');
    await this.locators.passwordInput.click();
    await this.locators.passwordInput.clear();
    await this.locators.passwordInput.fill('password');
    await this.locators.submitBtn.click();
    // Wait for the full OAuth callback chain to complete (form POST → /app/callback
    // code exchange → redirect back to the app). Without this, webkit doesn't finish
    // committing the session cookies before the test body reads them.
    await expect(this.locators.logOutBtn).toBeVisible();
    // Belt-and-suspenders: settle on 'load' in case any trailing navigation
    // (e.g. dev-server tooling reconnecting after the cross-origin
    // authorize/callback round trip) is still in flight, so the caller
    // doesn't read localStorage/cookies mid-navigation.
    await this.page.waitForLoadState('load');
  }

  async navToRegister() {
    await this.locators.createAccountBtn.click();
    await expect(this.locators.registerBtn).toBeVisible();
  }

  async logOut() {
    // Arm before clicking — in DPoP mode, startLogout() is asynchronous (it
    // awaits DPoPManager.clear() before navigating), so the click can return
    // before the actual navigation to FusionAuth's logout endpoint has even
    // started. Without this, the caller (or a subsequent serial test) can
    // proceed while that navigation is still pending, racing with it --
    // observed as an aborted/interrupted navigation in the next test, or
    // even a silent SSO re-authentication on the next login attempt if the
    // FusionAuth-side session was never actually reached/cleared.
    const logoutNavigationPromise = this.page.waitForURL(
      url => /\/(oauth2|app)\/logout/.test(url.pathname),
      { timeout: 10_000 },
    );

    await this.locators.logOutBtn.click();
    await logoutNavigationPromise;

    await expect(this.locators.logInBtn.nth(0)).toBeVisible();
    // See the comment in authenticate() above.
    await this.page.waitForLoadState('load');
  }
}
