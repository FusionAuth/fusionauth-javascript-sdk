@fusionauth/angular-sdk Changes

Changes in 1.2.0

- `userInfo` can now be custom typed with an optional generic argument. This may be helpful for SDK users with a non-hosted backend. Below is an example of what it looks like.

  ```typescript
  interface MyUserInfo {
    specialProperty: string;
    // ...etc
  }

  @Component({
    template: ` <p>{{ userInfo?.specialProperty }}</p> `,
  })
  class AppComponent implements OnInit {
    private fusionauth: FusionAuthService<MyUserInfo> =
      inject(FusionAuthService);
    userInfo: MyUserInfo | null = null;

    ngOnInit() {
      this.subscription = this.fusionauth.getUserInfoObservable().subscribe({
        next: userInfo => (this.userInfo = userInfo),
      });
    }
  }
  ```

- `manageAccount` function and button added. [Self service account management](https://fusionauth.io/docs/lifecycle/manage-users/account-management/) is only available in FusionAuth paid plans.
- Some missing optional properties have been added to the [`UserInfo`](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/main/packages/sdk-angular/docs/interfaces/UserInfo.md) type.

Changes in 1.1.0

- SDK now supports Angular apps using SSR. No additional configuration is needed.
- Adds `postLogoutRedirectUri` option to [`FusionAuthConfig`](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/main/packages/sdk-angular/docs/interfaces/FusionAuthConfig.md#postLogoutRedirectUri)
- SDK's peer dependencies now specified with `>=`.
- The distribution is fully sourcemapped--sourcemaps were not included for the @fusionauth-sdk/core package in v1.0.2

Changes in 1.0.2

- Adds `onAutoRefreshFailure` option to `FusionAuthConfig`.
- _Bug fix_ `isLoggedIn$` observable property is set to `false` after token refresh. [See issue #82](https://github.com/FusionAuth/fusionauth-javascript-sdk/issues/82)

Changes in 1.0.1

Several enhancements are availabe on the `FusionAuthService`

- `getUserInfoObservable` provides an API that Angular components can subscribe to. Provides an api for handling pending state, as well as callbacks for success and error.
- Adds error handling to the get user info request.
- `FusionAuthService` provides observable `isLoggedIn$` property that updates within the Angular change dectection system if the access token expires.
- `shouldAutoRefresh` option for the SDK to automatically handle refreshing the access token. Defaults to `false`.
- `scope` has been added back to the `FusionAuthProviderConfig` to be more compatible with [FusionAuth v1.50](https://fusionauth.io/docs/release-notes/#version-1-50-0)
- Full API documentation with TypeDoc now available (see official README from NPM).
