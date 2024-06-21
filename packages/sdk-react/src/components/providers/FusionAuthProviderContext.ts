import { UserInfo } from './Context';

/** The context provided by FusionAuth React SDK */
export interface FusionAuthProviderContext<T = UserInfo> {
  /**
   * Whether the user is logged in.
   */
  isLoggedIn: boolean;

  /**
   * Data fetched from the configured 'me' endpoint.
   */
  userInfo: T | null;

  /**
   * Fetches user info from the 'me' endpoint.
   * This is handled automatically if the SDK is configured with `shouldAutoFetchUserInfo`.
   */
  fetchUserInfo: () => Promise<T | undefined>;

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
   * @param {string} state - Optional value to be echoed back to the SDK upon redirect.
   */
  startLogin: (state?: string) => void;

  /**
   * Initiates register flow.
   * @param {string} state - Optional value to be echoed back to the SDK upon redirect.
   */
  startRegister: (state?: string) => void;

  /**
   * Initiates logout flow.
   */
  startLogout: () => void;

  /**
   * Redirects to [self service account management](https://fusionauth.io/docs/lifecycle/manage-users/account-management/)
   * Self service account management is only available in FusionAuth paid plans.
   */
  manageAccount: () => void;

  /**
   * Refreshes the access token a single time.
   * This is handled automatically if the SDK is configured with `shouldAutoRefresh`.
   */
  refreshToken: () => Promise<Response | undefined>;

  /**
   * Initializes automatic access token refreshing.
   * This is handled automatically if the SDK is configured with `shouldAutoRefresh`.
   */
  initAutoRefresh: () => void;
}
