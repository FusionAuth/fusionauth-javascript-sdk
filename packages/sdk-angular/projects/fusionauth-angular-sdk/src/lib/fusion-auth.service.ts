import { CookieHelpers, TokenRefresher, UrlHelper } from '@fusionauth-sdk/core';
import { FusionAuthConfig, UserInfo } from './types';

/**
 * Service class to use with FusionAuth backend endpoints.
 */
export class FusionAuthService {
  private urlHelper: UrlHelper;
  private tokenRefresher: TokenRefresher;
  private autoRefreshTimer?: NodeJS.Timeout;

  constructor(private config: FusionAuthConfig) {
    if (!config.redirectUri) {
      throw Error('No `redirectUri` provided to FusionAuthService');
    }

    this.urlHelper = new UrlHelper({
      serverUrl: config.serverUrl,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      mePath: config.mePath,
      loginPath: config.loginPath,
      registerPath: config.registerPath,
      logoutPath: config.registerPath,
      tokenRefreshPath: config.tokenRefreshPath,
    });
    this.tokenRefresher = new TokenRefresher(
      this.urlHelper.getTokenRefreshUrl(),
    );

    if (this.config.shouldAutoRefresh) {
      this.initAutoRefresh();
    }
  }

  /**
   * Calls the 'me' endpoint to retrieve user info.
   * @return {Promise<UserInfo>} the user info response.
   */
  async getUserInfo(): Promise<UserInfo> {
    const resp = await fetch(this.urlHelper.getMeUrl(), {
      credentials: 'include',
    });
    return JSON.parse(await resp.text()) as UserInfo;
  }

  /**
   * Checks for the 'app.at_exp' cookie and if present sets a timer to refresh the access token.
   * Will attempt to refresh the configured seconds before the access token expires (default is ten seconds).
   */
  initAutoRefresh(): void {
    if (this.autoRefreshTimer) {
      clearTimeout(this.autoRefreshTimer);
    }

    this.autoRefreshTimer = this.tokenRefresher.initAutoRefresh(
      this.config.autoRefreshSecondsBeforeExpiry,
    );
  }

  /**
   * Checks that the 'app.at_exp' cookie is present and for a time in the future to determine logged-in state.
   * @return {boolean} app.at_exp is present and not for a time in the past
   */
  isLoggedIn(): boolean {
    return (this.getExpTime() ?? 0) > new Date().getTime();
  }

  /**
   * Calls the configured 'refresh' endpoint to attempt to refresh the access token cookie.
   */
  async refreshToken(): Promise<void> {
    return this.tokenRefresher.refreshToken();
  }

  /**
   * Invokes a redirect to the configured 'login' endpoint.
   */
  startLogin(state?: string): void {
    const loginUrl = this.urlHelper.getLoginUrl(state);
    window.location.assign(loginUrl);
  }

  /**
   * Invokes a redirect to the configured 'refresh' endpoint.
   */
  startRegistration(state?: string): void {
    const registerUrl = this.urlHelper.getRegisterUrl(state);
    window.location.assign(registerUrl);
  }

  /**
   * Invokes a redirect to the configured 'logout' endpoint.
   */
  logout(): void {
    const logoutUrl = this.urlHelper.getLogoutUrl();
    window.location.assign(logoutUrl);
  }

  private getExpTime() {
    return CookieHelpers.getAccessTokenExpirationMoment();
  }
}
