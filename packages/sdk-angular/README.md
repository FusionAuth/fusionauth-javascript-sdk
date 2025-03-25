An SDK for using FusionAuth in Angular applications.

# Table of Contents

-   [Overview](#overview)
-   [Getting Started](#getting-started)
  -   [Quickstart](#quickstart)
  -   [Installation](#installation)
-   [Usage](#usage)
  -   [FusionAuthService](#fusionauthservice)
  -   [Pre-built buttons](#pre-built-buttons)
  -   [State Parameter](#state-parameter)
  -   [SSR](#ssr)
-   [Known issues](#known-issues)
-   [Documentation](#documentation)
-   [Releases](#releases)

<!--
this tag, and the corresponding end tag, are used to delineate what is pulled into the FusionAuth docs site (the client libraries pages). Don't remove unless you also change the docs site.

Please also use ``` instead of indenting for code blocks. The backticks are translated correctly to adoc format.
-->

# Overview

<!--
tag::forDocSite[]
-->

This SDK helps manage authentication state for your Angular app and provides functionality to login, register, and logout users. It also can be configured to automatically manage your refresh token.

Your users will be sent to FusionAuth’s themeable hosted login pages and
then log in. After that, they are sent back to your Angular application.

Once authentication succeeds, the following secure, HTTP-only cookies
will be set:

-   `app.at` - an OAuth [Access
    Token](https://fusionauth.io/docs/v1/tech/oauth/tokens#access-token)

-   `app.rt` - a [Refresh
    Token](https://fusionauth.io/docs/v1/tech/oauth/tokens#refresh-token)
    used to obtain a new `app.at`. This cookie will only be set if
    refresh tokens are enabled on your FusionAuth instance.

The access token can be presented to APIs to authorize the request and
the refresh token can be used to get a new access token.

There are 2 ways to interact with this SDK:
1. By hosting your own server that performs the OAuth token exchange and meets the [server code requirements for FusionAuth Web SDKs](https://github.com/FusionAuth/fusionauth-javascript-sdk-express#server-code-requirements).
2. By using the server hosted on your FusionAuth instance, i.e., not writing your own server code.

If you are hosting your own server, see [server code requirements](https://github.com/FusionAuth/fusionauth-javascript-sdk-express#server-code-requirements).

You can use this library against any version of FusionAuth or any OIDC
compliant identity server.

## Getting Started

If you are new to Angular development, you may want to start with the Quickstart guide. If you are already familiar with Angular development, skip to the Configuration section.

### Quickstart

See the [FusionAuth Angular Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-angular-web) for a full tutorial on using FusionAuth and Angular.

### Installation

NPM:

```bash
npm install @fusionauth/angular-sdk
```

Yarn:

```bash
yarn add @fusionauth/angular-sdk
```

### Configuring FusionAuthModule

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { FusionAuthModule } from '@fusionauth/angular-sdk';

@NgModule({
  declarations: [],
  imports: [
    FusionAuthModule.forRoot({
      clientId: '', // Your FusionAuth client ID
      serverUrl: '', // The base URL of the server that performs the token exchange
      redirectUri: '', // The URI that the user is directed to after the login/register/logout action
      shouldAutoRefresh: true // option to configure the SDK to automatically handle token refresh. Defaults to false if not specified here.
    }),
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
```

## Usage

### FusionAuthService

The injectable `FusionAuthService` class provides observable properties to which components may subscribe.

Note, you can also use the non-observable `getUserInfo` method if you wish to implement your observables.

```typescript
class AppComponent implements OnInit, OnDestroy {
  private fusionAuthService: FusionAuthService = inject(FusionAuthService);

  isLoggedIn: boolean = this.fusionAuthService.isLoggedIn();
  userInfo: UserInfo | null = null;
  isGettingUserInfo: boolean = false;
  subscription?: Subscription;

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.subscription = this.fusionAuthService
        .getUserInfoObservable({
          onBegin: () => (this.isGettingUserInfo = true),
          onDone: () => (this.isGettingUserInfo = false),
        })
        .subscribe({
          next: (userInfo) => (this.userInfo = userInfo),
          error: (error) => console.error(error),
        });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
```

### Pre-built buttons

There are three pre-styled buttons that are configured to perform
login/logout/registration. They can be placed anywhere in your app as
is.

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  template: `<fa-login></fa-login>`,
  styleUrls: []
})
export class LoginComponent {}

@Component({
  selector: 'app-logout',
  template: `<fa-logout></fa-logout>`,
  styleUrls: []
})
export class LogoutComponent {}

@Component({
  selector: 'app-register',
  template: `<fa-register></fa-register>`,
  styleUrls: []
})
export class RegisterComponent {}
```

#### State parameter

The `startLogin` and `startRegistration` functions both accept an optional string
parameter called `state`. The login and register components can also be passed the 
state as an input. The state that is passed in to the function call will be echoed
back in the state query parameter of the callback uri specified in `redirectUri` on
the `FusionAuthConfig` used to initialize the `FusionAuthModule`. Though you may 
pass any value you would like for the state parameter, it is often used to indicate 
which page the user was on before redirecting to login or registration, so that the
user can be returned to that location after a successful authentication.

#### SSR

The SDK supports Angular applications using SSR. No additional configuration is needed.

### Known Issues

None.

## Documentation

[Full library documentation](https://github.com/FusionAuth/fusionauth-javascript-sdk/tree/main/packages/sdk-angular/docs)

<!--
end::forDocSite[]
-->

Use backticks for code in this readme. This readme is included on the FusionAuth website, and backticks show the code in the best light there.

## Releases

To perform a release to NPM, create a release on GitHub. That will automatically publish a release to GitHub.