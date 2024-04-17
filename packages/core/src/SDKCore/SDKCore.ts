import { UrlHelper } from '#/UrlHelper';
import { TokenRefresher } from '#/TokenRefresher';
import { SDKConfig } from '#/SDKConfig';
import { TokenExpirationScheduler } from '#/TokenExpirationScheduler';
import { UserInfo } from '#/SDKContext';
import { RedirectHelper } from '#/RedirectHelper';
import { CookieHelpers } from '#/CookieHelpers';

/** A class containing framework-agnostic SDK methods */
export class SDKCore {
  private config: SDKConfig;
  private urlHelper: UrlHelper;
  private tokenRefresher: TokenRefresher;
  private redirectHelper: RedirectHelper = new RedirectHelper();

  constructor(config: SDKConfig) {
    this.config = config;
    this.urlHelper = UrlHelper.fromSDKConfig(config);
    this.tokenRefresher = new TokenRefresher(
      this.urlHelper.getTokenRefreshUrl(),
    );
    this.scheduleTokenExpirationEvent();
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

  async refreshToken() {
    return await this.tokenRefresher.refreshToken();
  }

  initAutoRefresh() {
    return this.tokenRefresher.initAutoRefresh(
      this.config.autoRefreshSecondsBeforeExpiry,
      this.config.accessTokenExpireCookieName,
    );
  }

  handlePostRedirect(callback?: (state?: string) => void) {
    if (this.isLoggedIn && this.redirectHelper.didRedirect) {
      this.redirectHelper.handlePostRedirect(callback);
    }
  }

  get isLoggedIn() {
    if (!this.accessTokenExpirationMoment) {
      return false;
    }

    return this.accessTokenExpirationMoment > new Date().getTime();
  }

  private get accessTokenExpirationMoment() {
    return CookieHelpers.getAccessTokenExpirationMoment(
      this.config.accessTokenExpireCookieName,
    );
  }

  private scheduleTokenExpirationEvent() {
    if (this.accessTokenExpirationMoment && this.config.onTokenExpiration) {
      TokenExpirationScheduler.scheduleTokenExpirationCallback(
        this.accessTokenExpirationMoment,
        this.config.onTokenExpiration,
      );
    }
  }
}
