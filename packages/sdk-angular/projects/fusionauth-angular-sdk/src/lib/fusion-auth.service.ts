import { FusionAuthConfig, UserInfo } from './types';

/**
 * Service class to use with FusionAuth backend endpoints.
 */
export class FusionAuthService {
  constructor(private config: FusionAuthConfig) {}

  /**
   * Calls the 'me' endpoint to retrieve user info.
   * @return {Promise<UserInfo>} the user info response.
   */
  async getUserInfo(): Promise<UserInfo> {
    const path = this.config.mePath ? this.config.mePath : '/app/me';
    const uri = this.getUrlForPath(path);
    const resp = await fetch(uri.href, {
      credentials: 'include',
    });
    return JSON.parse(await resp.text()) as UserInfo;
  }

  /**
   * Checks for the 'app.at_exp' cookie and if present sets a timer to refresh the access token.
   * Will attempt to refresh the configured seconds before the access token expires (default is ten seconds).
   */
  initAutoRefresh(): void {
    const exp = this.getExpTime();
    if (exp) {
      const refreshBeforeSeconds = this.config.autoRefreshSecondsBeforeExpiry
        ? this.config.autoRefreshSecondsBeforeExpiry
        : 10;
      const now = new Date().getTime();
      const refreshTime = exp - refreshBeforeSeconds * 1000;
      let timeTillThen = refreshTime - now;
      if (timeTillThen <= 0) {
        timeTillThen = 0;
      }
      setTimeout(async () => {
        try {
          await this.refreshToken();
          this.initAutoRefresh();
        } catch (e) {
          console.error(e);
        }
      }, timeTillThen);
    }
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
    const path = this.config.tokenRefreshPath
      ? `${this.config.tokenRefreshPath}/${this.config.clientId}`
      : `/app/refresh/${this.config.clientId}`;
    const uri = this.getUrlForPath(path);
    const resp = await fetch(uri.href, {
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
   * Invokes a redirect to the configured 'login' endpoint.
   */
  startLogin(state?: string): void {
    const path = this.config.loginPath ? this.config.loginPath : '/app/login';
    state
      ? this.doRedirectForPath(path, { state })
      : this.doRedirectForPath(path);
  }

  /**
   * Invokes a redirect to the configured 'refresh' endpoint.
   */
  startRegistration(state?: string): void {
    const path = this.config.registerPath
      ? this.config.registerPath
      : '/app/register';
    state
      ? this.doRedirectForPath(path, { state })
      : this.doRedirectForPath(path);
  }

  /**
   * Invokes a redirect to the configured 'logout' endpoint.
   */
  logout(): void {
    const path = this.config.logoutPath
      ? this.config.logoutPath
      : '/app/logout';
    this.doRedirectForPath(path);
  }

  private doRedirectForPath(path: string, params: Record<string, any> = {}) {
    path = path + `/${this.config.clientId}`;
    if (this.config.redirectUri) {
      params['redirect_uri'] = this.config.redirectUri;
    }
    const location = this.getUrlForPath(path, params);
    window.location.assign(location);
  }

  private getUrlForPath(path: string, params: Record<string, any> = {}): URL {
    const url = new URL(this.config.serverUrl);
    url.pathname = path;
    if (Object.entries(params).length > 0) {
      const urlParams = new URLSearchParams(params);
      url.search = urlParams.toString();
    }
    return url;
  }

  private getExpTime(): number | null {
    const expCookie = document.cookie
      .split('; ')
      .map(c => c.split('='))
      .find(([name]) => name === 'app.at_exp');
    return expCookie ? parseInt(expCookie?.[1] ?? '0') * 1000 : null;
  }
}
