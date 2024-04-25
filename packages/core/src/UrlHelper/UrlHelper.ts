import { UrlHelperConfig, UrlHelperQueryParams } from './UrlHelperTypes';

/** A class responsible for generating URLs that FusionAuth SDKs interact with. */
export class UrlHelper {
  serverUrl: string;
  clientId: string;
  redirectUri: string;
  scope?: string;

  mePath: string;
  loginPath: string;
  registerPath: string;
  logoutPath: string;
  tokenRefreshPath: string;

  constructor(config: UrlHelperConfig) {
    this.serverUrl = config.serverUrl;
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    this.scope = config.scope;

    this.mePath = config.mePath ?? '/app/me';
    this.loginPath = config.loginPath ?? '/app/login';
    this.registerPath = config.registerPath ?? '/app/register';
    this.logoutPath = config.logoutPath ?? '/app/logout';
    this.tokenRefreshPath = config.tokenRefreshPath ?? '/app/refresh';
  }

  getMeUrl(): URL {
    return this.generateUrl(this.mePath);
  }

  getLoginUrl(state?: string): URL {
    return this.generateUrl(this.loginPath, {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state,
    });
  }

  getRegisterUrl(state?: string): URL {
    return this.generateUrl(this.registerPath, {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state,
    });
  }

  getLogoutUrl(): URL {
    return this.generateUrl(this.logoutPath, {
      client_id: this.clientId,
      post_logout_redirect_uri: this.redirectUri,
    });
  }

  getTokenRefreshUrl(): URL {
    return this.generateUrl(this.tokenRefreshPath, {
      client_id: this.clientId,
    });
  }

  private generateUrl(path: string, params?: UrlHelperQueryParams): URL {
    const url = new URL(this.serverUrl);
    url.pathname = path;

    if (params) {
      const urlSearchParams = this.generateURLSearchParams(params);
      url.search = urlSearchParams.toString();
    }

    return url;
  }

  private generateURLSearchParams(
    params: UrlHelperQueryParams,
  ): URLSearchParams {
    const urlSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlSearchParams.append(key, value);
      }
    });

    return urlSearchParams;
  }
}
