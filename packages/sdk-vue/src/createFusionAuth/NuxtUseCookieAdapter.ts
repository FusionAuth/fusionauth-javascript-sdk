import { CookieAdapter } from '@fusionauth-sdk/core';

/**
 * See docs for more info [useCookie](https://nuxt.com/docs/api/composables/use-cookie).
 */
export class NuxtUseCookieAdapter implements CookieAdapter {
  constructor(private useCookie: UseCookie) {
    this.useCookie = useCookie;
  }

  at_exp(cookieName: string = 'app.at_exp') {
    // useCookie must be invoked with the cookie name every time to get the up-to-date value
    return this.useCookie(cookieName).value;
  }
}

export type UseCookie = (key: string) => {
  value: string | number | undefined;
};
