/** The context provided by FusionAuth Web SDKs */
export interface SDKContext {
  /**
   * Whether the user is logged in.
   */
  isLoggedIn: boolean;

  /**
   * Data fetched from the configured 'me' endpoint.
   */
  userInfo: UserInfo | null;

  /**
   * Fetches user info from the 'me' endpoint.
   * This is handled automatically if the SDK is configured with `shouldAutoFetchUserInfo`.
   * @returns {Promise<UserInfo>}
   */
  fetchUserInfo: () => Promise<UserInfo | undefined>;

  /**
   * Indicates that the fetchUserInfo call is unresolved.
   */
  isFetchingUserInfo: boolean;

  /**
   * Error occurred while fetching userInfo.
   */
  error: Error | null;

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

  /**
   * Fetch wrapper that automatically attaches DPoP proof headers.
   * Present only when `useDpop: true`.
   */
  dpopFetch?: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;

  /**
   * Returns a signed DPoP proof JWT for use with axios or other
   * HTTP libraries. Present only when `useDpop: true`.
   */
  generateProof?: (
    htu: string,
    htm: string,
    accessToken?: string,
    nonce?: string,
  ) => Promise<string>;

  /**
   * Returns the stored DPoP access token, or `null` if not logged in.
   * Throws a descriptive error when `useDpop: false`.
   * Present only when `useDpop: true`.
   */
  getAccessToken?: () => string | null;
}

/**
 * User information returned from FusionAuth.
 */
export type UserInfo = {
  applicationId?: string;
  birthdate?: string;
  email?: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  name?: string;
  middle_name?: string;
  phone_number?: string;
  picture?: string;
  preferred_username?: string;
  roles?: any[];
  sid?: string;
  sub?: string;
  tid?: string;
};
