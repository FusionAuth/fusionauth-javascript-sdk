export class CookieHelpers {
  /** Parses document.cookie for the 'app.at_exp' value. */
  static getAuthTokenExpirationTime = (): number | null => {
    const expCookie = document.cookie
      .split('; ')
      .map(c => c.split('='))
      .find(([name]) => name === 'app.at_exp');
    return expCookie ? parseInt(expCookie?.[1] ?? '0') * 1000 : null;
  };
}
