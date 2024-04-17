import { CookieHelpers } from '#/CookieHelpers';

/** A class responsible for handling access token refresh. */
class TokenRefresher {
  url: URL;

  constructor(url: URL) {
    this.url = url;
  }

  /** Refresh token a single time */
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

  /** Initializes continuous automatic token refresh. */
  initAutoRefresh(
    secondsBeforeRefresh: number = 10,
    accessTokenExpirationCookieName?: string,
  ) {
    const tokenExpirationMoment = CookieHelpers.getAccessTokenExpirationMoment(
      accessTokenExpirationCookieName,
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
