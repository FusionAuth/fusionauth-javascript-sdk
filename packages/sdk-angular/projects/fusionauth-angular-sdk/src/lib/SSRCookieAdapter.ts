import { CookieAdapter } from '../sdkcore';

/** An adapter class that supports accessing cookies with SSR */
export class SSRCookieAdapter implements CookieAdapter {
  constructor(private isBrowser: boolean) {}

  at_exp(cookieName: string = 'app.at_exp') {
    if (!this.isBrowser) {
      return;
    }

    try {
      const expCookie = document.cookie
        .split('; ')
        .map(c => c.split('='))
        .find(([name]) => name === cookieName);
      return expCookie?.[1];
    } catch (error) {
      console.error('Error within the SSRCookieAdapter: ', error);
      return -1;
    }
  }
}
