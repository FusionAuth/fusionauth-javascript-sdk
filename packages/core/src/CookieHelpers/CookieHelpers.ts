export class CookieHelpers {
  /**
   * Parses document.cookie for the auth token expiration cookie value.
   * @returns {(number | null)} The moment of expiration in milliseconds since epoch.
   */
  static getAuthTokenExpirationTime(
    cookieName: string = 'app.at_exp',
  ): number | null {
    const expCookie = document.cookie
      .split('; ')
      .map(c => c.split('='))
      .find(([name]) => name === cookieName);
    const cookieValue = expCookie?.[1];
    return cookieValue ? parseInt(cookieValue) * 1000 : null;
  }
}