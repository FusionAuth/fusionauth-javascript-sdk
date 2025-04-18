import { CookieAdapter } from '..';

/**
 * Config for FusionAuth Web SDKs
 */
export interface SDKConfig {
  /**
   * The URL of the server that performs the token exchange.
   */
  serverUrl: string;

  /**
   * The client id of the application.
   */
  clientId: string;

  /**
   * The redirect URI of the application.
   */
  redirectUri: string;

  /**
   * The OAuth2 scope parameter passed to the `/oauth2/authorize` endpoint. If not specified fusionauth will default this to `openid offline_access`.
   */
  scope?: string;

  /**
   * Additional params passed to loginPath typically `/app/login/`, which redirects to `/oauth2/authorize`. Example of this might be loginParams = [{idp_hint:'44449786-3dff-42a6-aac6-1f1ceecb6c46'}] or any params found at https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/endpoints
   */
  authParams?: { [key: string]: any }[];

  /**
   * The redirect URI for post-logout. Defaults the provided `redirectUri`.
   */
  postLogoutRedirectUri?: string;

  /**
   * Enables automatic token refreshing. Defaults to false.
   */
  shouldAutoRefresh?: boolean;

  /**
   * Enables the SDK to automatically handle fetching user info when logged in. Defaults to false.
   */
  shouldAutoFetchUserInfo?: boolean;

  /**
   * The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 30.
   */
  autoRefreshSecondsBeforeExpiry?: number;

  /**
   * Callback function to be invoked with the `state` value upon redirect from login or register.
   */
  onRedirect?: (state?: string) => void;

  /**
   * The path to the login endpoint.
   */
  loginPath?: string;

  /**
   * The path to the register endpoint.
   */
  registerPath?: string;

  /**
   * The path to the logout endpoint.
   */
  logoutPath?: string;

  /**
   * The path to the token refresh endpoint.
   */
  tokenRefreshPath?: string;

  /**
   * The path to the me endpoint.
   */
  mePath?: string;

  /**
   * The name of the access token expiration moment cookie.
   * Only set this if you are hosting server that uses a custom name for the 'app.at_exp' cookie.
   */
  accessTokenExpireCookieName?: string;

  /**
   * Callback to be invoked if a request to refresh the access token fails during autorefresh.
   */
  onAutoRefreshFailure?: (error: Error) => void;

  /**
   * Adapter pattern for SSR frameworks such as next or nuxt
   */
  cookieAdapter?: CookieAdapter;

  /**
   * Callback to be invoked at the moment of access token expiration
   */
  onTokenExpiration: () => void;
}
