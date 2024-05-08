/**
 * Config for FusionAuth Angular SDK
 */
export interface FusionAuthConfig {
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
   * Enables automatic token refreshing. Defaults to false.
   */
  shouldAutoRefresh?: boolean;

  /**
   * The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 10.
   */
  autoRefreshSecondsBeforeExpiry?: number;

  /**
   * Callback function to be invoked with the `state` value upon redirect from login or register.
   */
  onRedirect?: (state?: string) => void;

  /**
   * Callback to be invoked if a request to refresh the access token fails during autorefresh.
   */
  onAutoRefreshFailure?: (error: Error) => void;

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
}

export interface UserInfo {
  applicationId?: string;
  email?: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  picture?: string;
  roles?: any[];
  sid?: string;
  sub?: string;
  tid?: string;
  phone_number?: string;
}
