/**
 * Config for the FusionAuth Vue SDK
 */
export interface FusionAuthConfig {
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
   * Enables automatic token refreshing. Defaults to false.
   */
  shouldAutoRefresh?: boolean;

  /**
   * The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 30.
   */
  autoRefreshSecondsBeforeExpiry?: number;

  /**
   * The path to the login endpoint.
   */
  loginPath?: string;
  /**
   * The path to the logout endpoint.
   */
  logoutPath?: string;
  /**
   * The path to the register endpoint.
   */
  registerPath?: string;
  /**
   * The path to the token refresh endpoint.
   */
  tokenRefreshPath?: string;
  /**
   * The path to the me endpoint.
   */
  mePath?: string;
}

/**
 * User information returned from FusionAuth.
 */
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

/**
 * FusionAuth
 */
export interface FusionAuth {
  /**
   * Retrieves user information.
   *
   * @returns {Promise<UserInfo>} - A Promise that resolves to the user information.
   */
  getUserInfo: () => Promise<UserInfo>;

  /**
   * Returns true if the user is logged in, false otherwise.
   *
   * @returns {boolean} True if the user is logged in, false otherwise.
   */
  isLoggedIn: () => boolean;

  /**
   * Initiates a login using an optional state.
   * @param {string} [state] - Optional state to be passed to the login endpoint.
   */
  login: (state?: string) => void;

  /**
   * Initiates a logout.
   */
  logout: () => void;

  /**
   * Refreshes the access token.
   */
  refreshToken: () => Promise<void>;

  /**
   * Initializes automatic refreshing of the access token.
   * Refresh is scheduled to happen at the configured `autoRefreshSecondsBeforeExpiry`.
   */
  initAutoRefresh: () => NodeJS.Timeout | undefined;

  /**
   * Initiates a registration using an optional state.
   * @param {string} [state] - Optional state to be passed to the register endpoint.
   */
  register: (state?: string) => void;
}
