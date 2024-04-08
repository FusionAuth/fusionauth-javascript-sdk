/** The context provided by FusionAuth Web SDKs */
export interface SDKContext {
  /**
   * Whether the user is logged in.
   */
  isLoggedIn: boolean;

  /**
   * Data fetched from the 'me' endpoint.
   */
  userInfo?: UserInfo;

  /**
   * Fetches user info from the 'me' endpoint.
   * This is handled automatically if the SDK is configured with `shouldAutoFetchUserInfo`.
   * @returns {Promise<UserInfo>}
   */
  fetchUserInfo: () => Promise<UserInfo>;

  /**
   * Indicates that the fetchUserInfo call is unresolved.
   */
  isFetchingUserInfo: boolean;

  /**
   * Error occurred while fetching userInfo.
   */
  error?: Error;

  /**
   * Initiates login flow.
   * @param {string} [state] - Optional value to be echoed back to the SDK upon redirect.
   */
  startLogin: (state?: string) => void;

  /**
   * Initiates register flow.
   * @param {string} [state] - Optional value to be echoed back to the SDK upon redirect.
   */
  startRegister: (state?: string) => void;

  /**
   * Initiates logout flow.
   */
  startLogout: () => void;

  /**
   * Refreshes the access token a single time.
   * This is handled automatically if the SDK is configured with `shouldAutoRefresh`.
   */
  refreshToken: () => Promise<void>;

  /**
   * Initializes automatic access token refreshing.
   * This is handled automatically if the SDK is configured with `shouldAutoRefresh`.
   */
  initAutoRefresh: () => void;
}

/**
 * User information returned from FusionAuth.
 */
export type UserInfo = {
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
};
