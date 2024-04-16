/**
 * Config for FusionAuthProvider
 */
export interface FusionAuthProviderConfig {
  /**
   * The URL of the FusionAuth server.
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
   * The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 10.
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
}
