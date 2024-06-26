import { UrlHelper } from '../UrlHelper';
import { SDKConfig } from '../SDKConfig';
import { UserInfo } from '../SDKContext';
import { RedirectHelper } from '../RedirectHelper';
import { getAccessTokenExpirationMoment } from '../CookieHelpers';

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
      postLogoutRedirectUri: config.postLogoutRedirectUri,
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

  manageAccount() {
    window.location.assign(this.urlHelper.getAccountManagementUrl());
  }

  async fetchUserInfo<T = UserInfo>() {
    const userInfoResponse = await fetch(this.urlHelper.getMeUrl(), {
      credentials: 'include',
    });

    if (!userInfoResponse.ok) {
      throw new Error(
        `Unable to fetch userInfo in fusionauth. Request failed with status code ${userInfoResponse?.status}`,
      );
    }

    const userInfo: T = await userInfoResponse.json();
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
      const errorDetails = {
        status: response.status,
        details:
          (await response?.text()) ||
          'Failed to refresh fusionauth access token',
      };
      throw new Error(JSON.stringify(errorDetails));
    }

    // a successful request means that app_exp was bumped into the future.
    // reschedule the access token expiration event.
    this.scheduleTokenExpiration();

    return response;
  }

  initAutoRefresh(): NodeJS.Timeout | undefined {
    if (!this.isLoggedIn) {
      return;
    }

    const secondsBeforeRefresh =
      this.config.autoRefreshSecondsBeforeExpiry ?? 10;

    const millisecondsBeforeRefresh = secondsBeforeRefresh * 1000;

    const now = new Date().getTime();
    const refreshTime = this.at_exp - millisecondsBeforeRefresh;
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
    return this.at_exp > new Date().getTime();
  }

  /** The moment of access token expiration in milliseconds since epoch. */
  private get at_exp(): number | -1 {
    return getAccessTokenExpirationMoment(
      this.config.accessTokenExpireCookieName,
      this.config.cookieAdapter,
    );
  }

  /**
   * Schedules `onTokenExpiration` at moment of access token expiration.
   * SDKCore is not necessarily reactive like React, Angular, and Vue.
   * so `onTokenExpiration` is for reactive frameworks to hook in and perform actions as on token expiration.
   */
  private scheduleTokenExpiration(): void {
    clearTimeout(this.tokenExpirationTimeout);

    const now = new Date().getTime();
    const millisecondsTillExpiration = this.at_exp - now;

    if (millisecondsTillExpiration > 0) {
      this.tokenExpirationTimeout = setTimeout(
        this.config.onTokenExpiration,
        millisecondsTillExpiration,
      );
    }
  }
}
