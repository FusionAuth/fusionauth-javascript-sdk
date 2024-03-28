export class CookieHelpers {
  /** Parses document.cookie for the 'app.at_exp' value in milliseconds. */
  static getAuthTokenExpirationTime(): number | null {
    const expCookie = document.cookie
      .split('; ')
      .map(c => c.split('='))
      .find(([name]) => name === 'app.at_exp');
    const cookieValue = expCookie?.[1];
    return cookieValue ? parseInt(cookieValue) * 1000 : null;
  }
}
