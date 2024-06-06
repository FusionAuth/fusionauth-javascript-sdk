import { Locator, Page, expect } from '@playwright/test';

const Locators = {
  logInBtn: 'role=button[name="Login"]',
  emailInput: 'role=textbox[name="Email"]',
  passwordInput: 'role=textbox[name="Password"]',
  submitBtn: 'role=button[name="Submit"]',
  createAccountBtn: 'role=button[name="create a new account"]',
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
    await expect(this.locators.emailInput).toBeVisible();
  }

  async authenticate() {
    await this.locators.emailInput.click();
    await this.locators.emailInput.clear();
    await this.locators.emailInput.fill('richard@example.com');
    await this.locators.passwordInput.click();
    await this.locators.passwordInput.clear();
    await this.locators.passwordInput.fill('password');
    await this.locators.submitBtn.click();
  }

  async navToRegister() {
    await this.locators.createAccountBtn.click();
    await expect(this.locators.registerBtn).toBeVisible();
  }

  async logOut() {
    await this.locators.logOutBtn.click();
    await expect(this.locators.logInBtn.nth(0)).toBeVisible();
  }
}
