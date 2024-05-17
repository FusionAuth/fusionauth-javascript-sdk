fusionauth-react-sdk Changes

Upcoming release

- sourcemaps included for debugging

Changes in 2.1.1

- _Bug fix_ `isLoggedIn` property is set to `false` after token refresh. [See issue #82](https://github.com/FusionAuth/fusionauth-javascript-sdk/issues/82)
- Adds `onAutoRefreshFailure` option to `FusionAuthProviderConfig`.

Changes in 2.1.0

- `scope` has been added back to the `FusionAuthProviderConfig` to be more compatible with [FusionAuth v1.50](https://fusionauth.io/docs/release-notes/#version-1-50-0)

Changes in 2.0.0

Breaking changes were made to provide new configuration options. These options include enabling automatic SDK functionality vs writing your own implementation via methods exposed by the `useFusionAuth` hook. These changes are also aimed at using more consistent verbiage within the SDK documentation.

- _Breaking change_ `FusionAuthProviderConfig` -- The props given to `FusionAuthProvider`.

  - `clientId` -- formerly `clientID`. Renamed for consistency across javascript SDKs.
  - `autoRefreshSecondsBeforeExpiry` -- Formerly `accessTokenExpireWindow` specified as milliseconds, not seconds. Renamed and specifying as seconds for consitency across javascript SDKs.
  - `onRedirect` -- Consolidation of `onRedirectSuccess`/`onRedirectFailure`
  - `shouldAutoFetchUserInfo` -- Option to automatically fetch user info. The SDK does not automatically do it anymore unless this is set to `true`.
  - `shouldAutoRefresh` -- Option to automatically handle refreshing the access token. Must be set to `true` to enable.
  - ~~`scope`~~ -- Removed from this API. Is specified by the [`/oauth2/authorize`](https://fusionauth.io/docs/lifecycle/authenticate-users/oauth/endpoints#complete-the-authorization-code-grant-request) endpoint in FusionAuth.

- _Breaking change_ `FusionAuthProviderContext` -- the context provided by `FusionAuthProvider` and returned from `useFusionAuth`. Several properties have been renamed and type-declared for consistency across FusionAuth javascript SDKs.
  - `isLoggedIn` -- Formerly `isAuthenticated`
  - `fetchUserInfo` -- Method to fetch `userInfo` -- automatically
  - `userInfo` -- Formerly `user`
  - `isFetchingUserInfo` -- Formerly `isLoading`
  - `startLogin` -- Formerly `login`
  - `startLogout` -- Formerly `logout`
  - `startRegister` -- Formerly `register`
  - `error`
  - `initAutoRefresh`
  - `refreshToken`

Changes in 1.0.1

- Add error handling to FusionAuthProvider for failed `/me` requests

Changes in 1.0.0

- Move react and react-dom packages to peerDependencies in package.json
  - PR ensures we're not bundling up react and react-dom to ship and let’s consuming developers know they need to install these packages themselves.
- Fix RequireAuth tests causing 'act(...)' warning
  - PR updates tests that were causing a not wrapped in act(...) warning. Nesting waitFor inside act can cause this warning. Act should be used when calling methods that update react state within a test. waitFor should be used to make an assertion after async stuff.
- Add fallbackTokenRefreshPath as a fallback when a user doesn't provide a tokenRefreshPath value
  - PR adds a fallback to generate the refresh token correctly when the optional config value tokenRefreshPath is not given.
- Update README to mention the option to use FA hosted endpoints
  - PR updates the README to document that there are 2 ways to use the SDK -- with your own server, or with the endpoints hosted by your FusionAuth instance.
- Match logout button style to other buttons
  - FusionAuthLogoutButton uses a different classname than the other buttons. PR consolidates the button styles so they have the same class name.
- Fix issue where failed request to /me causes infinite loop
  - PR fixes an issue where a failed request to GET /me resulted in an instance of useLayoutEffect being called in an infinite loop.
- RefreshToken() is not properly checking the expiration time preventing early calls
  - The expiration time cookie is set in a timestamp (seconds) but the calculations used in refreshToken are in milliseconds. Without converting the app.at_exp cookie to ms, the refreshToken is not being guarded against early calls as the code intends.

Changes in 0.25.0

- _Breaking change_ A few endpoint name updates and cookie name updates
  - `/app/token-refresh` is now `/app/refresh`
  - `/app/token-exchange` is now `/app/callback`
  - `access_token` cookie is now `app.at`
  - `access_token_expires` cookie is now `app.at_exp`
  - `id_token` is now `app.idt`
  - `refresh_token` cookie is now `app.rt`

Changes in 0.24.0

- _Breaking change_ Refactoring to work with upcoming FusionAuth hosted token exchange endpoints. _Many_ changes with server communication.
  - Updates simplify configuration and offload pkce code generation from the browser
  - Corresponding server side update in fusionauth-example-react-sdk
  - New access_token_expires cookie lets us know when access_token expires
  - refreshToken() only makes network call if access_token about to expire
  - Server routes now scoped under `/app/` (this is overrideable)
  - `jwt-refresh` now named `/app/token-refresh`
  - User info no longer returned from `/app/token-exchange`. Now, explicit call to `/app/me` is made. Json data is top level and not scoped under `{"user": {} }`

Changes in 0.23.0

- _Breaking change_ Module is now scoped and renamed to `@fusionauth/react-sdk`. Users will need to update `package.json` and imports.

Changes in 0.22.1

- _Breaking change_ Logout calls new server `/logout` endpoint before redirecting to `/oauth2/logout`
