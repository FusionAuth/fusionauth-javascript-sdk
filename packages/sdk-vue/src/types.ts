import { Ref } from 'vue';

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
 * FusionAuth object provided at app-level by FusionAuthVuePlugin
 */
export interface FusionAuth {
  /**
   * Whether the user is logged in.
   */
  isLoggedIn: Ref<boolean>;

  /**
   * This is handled automatically if the SDK is configured with `shouldAutoFetchUserInfo`.
   * Internally updates `isFetchingUser` and `userInfo` refs, as well as `error` if the request fails.
   * @returns {Promise<UserInfo>}
   */
  getUserInfo: () => Promise<UserInfo | undefined>;

  /**
   * Data fetched from the configured 'me' endpoint.
   */
  userInfo: Ref<UserInfo | null>;

  /**
   * Indicates that the getUserInfo call is unresolved.
   */
  isGettingUserInfo: Ref<boolean>;

  /**
   * Error occurred within getUserInfo.
   */
  error: Ref<Error | null>;

  /**
   * Initiates login flow.
   * @param {string} [state] - Optional value to be echoed back to the SDK upon redirect.
   */
  login: (state?: string) => void;

  /**
   * Initiates register flow.
   * @param {string} [state] - Optional value to be echoed back to the SDK upon redirect.
   */
  register: (state?: string) => void;

  /**
   * Initiates a logout.
   */
  logout: () => void;

  /**
   * Refreshes the access token a single time.
   * Token refreshing is handled automatically if configured with `shouldAutoRefresh`.
   */
  refreshToken: () => Promise<void>;

  /**
   * Initializes automatic refreshing of the access token.
   * Refresh is scheduled to happen at the configured `autoRefreshSecondsBeforeExpiry`.
   */
  initAutoRefresh: () => NodeJS.Timeout | undefined;
}
