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
   * Callback to be invoked if a request to refresh the access token fails.
   */
  onTokenRefreshFailure?: (error: Error) => void;

  /**
   * Callback to be invoked at the moment of access token expiration
   */
  onTokenExpiration: () => void;
}
