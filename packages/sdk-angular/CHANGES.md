@fusionauth/angular-sdk Changes

Changes in 1.0.1

Several enhancements are availabe on the `FusionAuthService`

- `getUserInfoObservable` provides an API that Angular components can subscribe to. Provides an api for handling pending state, as well as callbacks for success and error.
- Adds error handling to the get user info request.
- `FusionAuthService` provides observable `isLoggedIn$` property that updates within the Angular change dectection system if the access token expires.
- `shouldAutoRefresh` option for the SDK to automatically handle refreshing the access token. Defaults to `false`.
- `scope` has been added back to the `FusionAuthProviderConfig` to be more compatible with [FusionAuth v1.50](https://fusionauth.io/docs/release-notes/#version-1-50-0)
- Full API documentation with TypeDoc now available (see official README from NPM).
