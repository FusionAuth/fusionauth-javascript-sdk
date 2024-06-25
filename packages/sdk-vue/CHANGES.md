fusionauth-vue-sdk Changes

Changes in 1.2.0

- [`postLogoutRedirectUri`](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/main/packages/sdk-vue/docs/interfaces/types.FusionAuthConfig.md#postlogoutredirecturi) config option added.
- [`createFusionAuth`](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/main/packages/sdk-vue/docs/modules.md#createfusionauth) factory function is now an exported member of the package. This was suggested in issue [#104](https://github.com/FusionAuth/fusionauth-javascript-sdk/issues/104) and provides more flexibility in setting up your fusionauth plugin.
- `manageAccount` function and button added. [Self service account management](https://fusionauth.io/docs/lifecycle/manage-users/account-management/) is only available in FusionAuth paid plans.
- `userInfo` can now be custom typed with an optional generic argument. This may be helpful for SDK users with a non-hosted backend. Below is an example of what it may look like.
  ```typescript
  interface MyUser {
    customTrait: string;
    // ...
  }
  const { userInfo } = useFusionAuth<MyUser>();
  // where `userInfo.value` is inferred to be of type `Ref<MyUser | null>`
  ```
- Missing optional properties added to `UserInfo` type definition.
- sourcemaps included for debugging
- The error passed to `onAutoRefreshFailure` now includes the response status code.

Changes in 1.1.0

- The SDK now supports [Nuxt](https://nuxt.com/).
- Adds `nuxtUseCookie` option to `FusionAuthConfig` to handle SSR.

Changes in 1.0.1

- Adds `onAutoRefreshFailure` option to `FusionAuthConfig`.
- _Bug fix_ `isLoggedIn` property is set to `false` after token refresh. [See issue #82](https://github.com/FusionAuth/fusionauth-javascript-sdk/issues/82)

Changes in 1.0.0

- _Breaking change_ `isLoggedIn` property -- previously a function -- is now using [Vue's Reactivity API](https://vuejs.org/api/reactivity-core.html). The benefit of this is that it can be used as a reactive property in Vue.

- Updates to the `FusionAuthConfig` interface. This is the object that describes your SDK configuration.
- Updates to the `FusionAuth` type. This is essentially a description of the functionality provided by the SDK.

```typescript
interface FusionAuthConfig {
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
   * The OAuth2 scope parameter passed to the `/oauth2/authorize` endpoint. Fusionauth will default this to `openid offline_access` if not specified.
   */
  scope?: string;
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

interface FusionAuth {
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
```
