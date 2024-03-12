An SDK for using FusionAuth in Angular applications.

# Table of Contents

-   [Overview](#overview)

-   [Getting Started](#getting-started)

  -   [Installation](#installation)

-   [Usage](#usage)

  -   [Pre-built buttons](#pre-built-buttons)

  -   [Service usage](#service-usage)

  -   [Known issues](#known-issues)

-   [Example App](#example-app)

-   [Quickstart](#quickstart)

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

This SDK allows you to add login, logout, and registration buttons to
your Angular application. You can do this via pre-built buttons, or with 
the FusionAuthService in your own components.

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
    }),
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
```

## Usage

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

### Service usage

Alternatively, you may interact with the SDK Service by injecting the FusionAuthService into any component or service.

```typescript
import { Component, OnInit } from '@angular/core';
import { FusionAuthService, UserInfo } from '@fusionauth/angular-sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private userInfo: UserInfo;

  constructor(
    private fusionAuth: FusionAuthService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.fusionAuth.initAutoRefresh();
  }
  
  login() {
    this.fusionAuth.startLogin();
  }
  
  register() {
    this.fusionAuth.startRegistration();
  }
  
  logout() {
    this.fusionAuth.logout();
  }
  
  refreshToken() {
    this.fusionAuth.refreshToken();
  }
  
  async getUserInfo() {
    this.userInfo = await this.fusionAuth.getUserInfo();
  }
  
  isLoggedIn(): boolean {
    return this.fusionAuth.isLoggedIn();
  }
}
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

### Known Issues

None.

## Quickstart

See the [FusionAuth Angular Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-angular-web) for a full tutorial on using FusionAuth and Angular.

## Documentation

[Full library
documentation](https://github.com/FusionAuth/fusionauth-angular-sdk/blob/main/docs/documentation.md)

<!--
end::forDocSite[]
-->

Use backticks for code in this readme. This readme is included on the FusionAuth website, and backticks show the code in the best light there.

## Releases

To perform a release to NPM, create a release on GitHub. That will automatically publish a release to GitHub.