import { CookieHelpers } from 'src/CookieHelpers';

class TokenRefresher {
  url: URL;

  constructor(url: URL) {
    this.url = url;
  }

  /**
   * Calls the configured 'refresh' endpoint to attempt to refresh the access token cookie.
   */
  async refreshToken(): Promise<void> {
    const resp = await fetch(this.url.href, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    if (!(resp.status >= 200 && resp.status < 300)) {
      throw new Error('error refreshing access token in fusionauth');
    }
  }

  /**
   * Checks for the 'app.at_exp' cookie and if present sets a timer to refresh the access token.
   * Will attempt to refresh at the specified time before the access token expires (default is 10 seconds).
   */
  initAutoRefresh(
    secondsBeforeRefresh: number = 10,
    authTokenExpirationCookieName?: string,
  ) {
    const tokenExpirationMoment = CookieHelpers.getAuthTokenExpirationTime(
      authTokenExpirationCookieName,
    );

    if (!tokenExpirationMoment) {
      return;
    }

    const millisecondsBeforeRefresh = secondsBeforeRefresh * 1000;

    const now = new Date().getTime();
    const refreshTime = tokenExpirationMoment - millisecondsBeforeRefresh;

    const timeTillRefresh = Math.max(refreshTime - now, 0);

    const timeout = setTimeout(async () => {
      try {
        await this.refreshToken();
        this.initAutoRefresh(secondsBeforeRefresh);
      } catch (e) {
        console.error(e);
      }
    }, timeTillRefresh);

    return timeout;
  }
}

export { TokenRefresher };
