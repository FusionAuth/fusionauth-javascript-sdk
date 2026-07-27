import { UrlHelperConfig, UrlHelperQueryParams } from './UrlHelperTypes';

/** A class responsible for generating URLs that FusionAuth SDKs interact with. */
export class UrlHelper {
  serverUrl: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
  authParams?: { [key: string]: any }[];

  mePath: string;
  loginPath: string;
  registerPath: string;
  logoutPath: string;
  tokenRefreshPath: string;
  postLogoutRedirectUri?: string;

  constructor(config: UrlHelperConfig) {
    this.serverUrl = config.serverUrl;
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri;
    this.scope = config.scope;
    this.authParams = config.authParams;
    this.postLogoutRedirectUri = config.postLogoutRedirectUri;

    this.mePath = config.mePath ?? '/app/me/';
    this.loginPath = config.loginPath ?? '/app/login/';
    this.registerPath = config.registerPath ?? '/app/register/';
    this.logoutPath = config.logoutPath ?? '/app/logout/';
    this.tokenRefreshPath = config.tokenRefreshPath ?? '/app/refresh/';
  }

  getMeUrl(): URL {
    return this.generateUrl(this.mePath);
  }

  getLoginUrl(state?: string): URL {
    return this.generateUrl(this.loginPath, {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      authParams: this.authParams,
      state,
    });
  }

  getRegisterUrl(state?: string): URL {
    return this.generateUrl(this.registerPath, {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      authParams: this.authParams,
      state,
    });
  }

  getLogoutUrl(): URL {
    return this.generateUrl(this.logoutPath, {
      client_id: this.clientId,
      post_logout_redirect_uri: this.postLogoutRedirectUri || this.redirectUri,
    });
  }

  getTokenRefreshUrl(): URL {
    return this.generateUrl(this.tokenRefreshPath, {
      client_id: this.clientId,
    });
  }

  getAccountManagementUrl(): URL {
    return this.generateUrl('/account/', {
      client_id: this.clientId,
    });
  }

  /**
   * Builds the direct `/oauth2/authorize` URL used in DPoP mode.
   * Targets FusionAuth directly (not the hosted backend mode).
   *
   * @param dpopJkt  The DPoP public key JWK thumbprint for the `dpop_jkt` parameter.
   * @param codeChallenge  The PKCE code challenge value.
   * @param state  Optional OAuth2 `state` parameter.
   */
  getAuthorizeUrl(dpopJkt: string, codeChallenge: string, state?: string): URL {
    return this.generateUrl('/oauth2/authorize', {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scope,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      dpop_jkt: dpopJkt,
      state,
    });
  }

  /**
   * Builds the direct `/oauth2/token` URL used in DPoP mode for the
   * authorization code exchange and refresh token grant. Targets FusionAuth
   * directly (not Hosted Backend Mode). Request parameters are sent in
   * the POST body (form-urlencoded), not the query string, so no params are
   * appended here.
   */
  getTokenUrl(): URL {
    return this.generateUrl('/oauth2/token');
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
    this.appendParams(params, urlSearchParams);
    return urlSearchParams;
  }

  private appendParams(
    params: Record<string, any>, // or a more specific type if known
    urlSearchParams: URLSearchParams,
  ): void {
    Object.entries(params).forEach(([key, value]) => {
      if ((value && typeof value === 'object') || Array.isArray(value)) {
        // Recursively handle nested objects
        this.appendParams(value, urlSearchParams);
      } else if (value !== undefined && value !== null) {
        // Append primitive values
        urlSearchParams.append(key, String(value));
      }
    });
  }
}
