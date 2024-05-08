import { UrlHelper } from '#/UrlHelper';
import { SDKConfig } from '#/SDKConfig';
import { UserInfo } from '#/SDKContext';
import { RedirectHelper } from '#/RedirectHelper';
import { getAccessTokenExpirationMoment } from '#/CookieHelpers';

/** A class containing framework-agnostic SDK methods */
export class SDKCore {
  private config: SDKConfig;
  private urlHelper: UrlHelper;
  private redirectHelper: RedirectHelper = new RedirectHelper();
  private tokenExpirationTimeout?: NodeJS.Timeout;

  constructor(config: SDKConfig) {
    this.config = config;
    this.urlHelper = new UrlHelper({
      serverUrl: config.serverUrl,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scope: config.scope,
      mePath: config.mePath,
      loginPath: config.loginPath,
      registerPath: config.registerPath,
      logoutPath: config.logoutPath,
      tokenRefreshPath: config.tokenRefreshPath,
    });
    this.scheduleTokenExpiration();
  }

  startLogin(state?: string) {
    this.redirectHelper.handlePreRedirect(state);
    window.location.assign(this.urlHelper.getLoginUrl(state));
  }

  startRegister(state?: string) {
    this.redirectHelper.handlePreRedirect(state);
    window.location.assign(this.urlHelper.getRegisterUrl(state));
  }

  startLogout() {
    window.location.assign(this.urlHelper.getLogoutUrl());
  }

  async fetchUserInfo() {
    const userInfoResponse = await fetch(this.urlHelper.getMeUrl(), {
      credentials: 'include',
    });

    if (!userInfoResponse.ok) {
      throw new Error(
        `Unable to fetch userInfo in fusionauth. Request failed with status code ${userInfoResponse?.status}`,
      );
    }

    const userInfo: UserInfo = await userInfoResponse.json();
    return userInfo;
  }

  async refreshToken(): Promise<Response> {
    const response = await fetch(this.urlHelper.getTokenRefreshUrl(), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!(response.status >= 200 && response.status < 300)) {
      const message =
        (await response?.text()) ||
        'Error refreshing access token in fusionauth';
      throw new Error(message);
    }

    // a successful request means that app_exp was bumped into the future.
    // reschedule the access token expiration event.
    this.scheduleTokenExpiration();

    return response;
  }

  initAutoRefresh(): NodeJS.Timeout | undefined {
    const tokenExpirationMoment = this.at_exp;
    const secondsBeforeRefresh =
      this.config.autoRefreshSecondsBeforeExpiry ?? 10;

    if (!tokenExpirationMoment) {
      return;
    }

    const millisecondsBeforeRefresh = secondsBeforeRefresh * 1000;

    const now = new Date().getTime();
    const refreshTime = tokenExpirationMoment - millisecondsBeforeRefresh;
    const timeTillRefresh = Math.max(refreshTime - now, 0);

    return setTimeout(async () => {
      try {
        await this.refreshToken();
        this.initAutoRefresh();
      } catch (error) {
        this.config.onAutoRefreshFailure?.(error as Error);
      }
    }, timeTillRefresh);
  }

  handlePostRedirect(callback?: (state?: string) => void) {
    if (this.isLoggedIn && this.redirectHelper.didRedirect) {
      this.redirectHelper.handlePostRedirect(callback);
    }
  }

  get isLoggedIn() {
    if (!this.at_exp) {
      return false;
    }

    return this.at_exp > new Date().getTime();
  }

  /** The moment of access token expiration in milliseconds since epoch. */
  private get at_exp(): number | null {
    return getAccessTokenExpirationMoment(
      this.config.accessTokenExpireCookieName,
    );
  }

  /** Schedules `onTokenExpiration` at moment of access token expiration. */
  private scheduleTokenExpiration(): void {
    clearTimeout(this.tokenExpirationTimeout);

    const expirationMoment = this.at_exp ?? -1;

    const now = new Date().getTime();
    const millisecondsTillExpiration = expirationMoment - now;

    if (millisecondsTillExpiration > 0) {
      this.tokenExpirationTimeout = setTimeout(
        this.config.onTokenExpiration,
        millisecondsTillExpiration,
      );
    }
  }
}
