@fusionauth/vue-sdk / [Modules](modules.md)

An SDK for using FusionAuth in Vue applications.

# Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
  - [Configuring the SDK](#configuring-the-sdk)
  - [useFusionAuth Composable](#usefusionauth-composable)
    - [State parameter](#state-parameter)
  - [UI Components](#ui-components)
    - [Protecting Content](#protecting-content)
    - [Pre-built buttons](#pre-built-buttons)
  - [Quickstart](#quickstart)
  - [Documentation](#documentation)
  - [Releases](#releases)
  - [Upgrade Policy](#upgrade-policy)

<!--
this tag, and the corresponding end tag, are used to delineate what is pulled into the FusionAuth docs site (the client libraries pages). Don't remove unless you also change the docs site.

Please also use ``` instead of indenting for code blocks. The backticks are translated correctly to adoc format.
-->

# Overview

<!--
tag::forDocSite[]
-->

This SDK provides helpful methods and reactive values that integrate with FusionAuth to help automatically manage authentication state in your Vue app.

Your users will be sent to FusionAuth’s themeable hosted login pages and
then log in. After that, they are sent back to your Vue application.

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
npm install @fusionauth/vue-sdk
```

Yarn:

```bash
yarn add @fusionauth/vue-sdk
```

## Usage

### Configuring the SDK

Configure and initialize the `FusionAuthVuePlugin` when you create your Vue app:

```typescript
import { createApp } from 'vue';
import FusionAuthVuePlugin, { type FusionAuthConfig } from '@fusionauth/vue-sdk';

const config: FusionAuthConfig = {
  clientId: "", // Your app's FusionAuth client id
  serverUrl: "", // The url of the server that performs the token exchange
  redirectUri: "", // The URI that the user is directed to after the login/register/logout action
  shouldAutoFetchUserInfo: true, // Automatically fetch userInfo when logged in. Defaults to false.
  shouldAutoRefresh: true, // Enables automatic token refresh. Defaults to false.
  onRedirect: (state?: string) => { }, // Optional callback invoked upon redirect back from login or register.
}

const app = createApp(App);

app.use(FusionAuthVuePlugin, config);
app.mount('#app')
```

If you want to use the pre-styled buttons, don't forget to import the css file:

```typescript
import '@fusionauth/vue-sdk/dist/style.css';
```

### `useFusionAuth` composable

You can interact with the SDK by using the `useFusionAuth`, which leverages [Vue's Composition API](https://vuejs.org/guide/reusability/composables).

```html
<script setup lang="ts">
import { computed } from 'vue';
import { useFusionAuth } from "@fusionauth/vue-sdk";

const {
  isLoggedIn,
  userInfo,
  isFetchingUserInfo,
  login,
  register,
  logout
} = useFusionAuth();

const welcomeMessage = computed(() => {
  const name = userInfo.value?.given_name
  return name 
    ? 'Welcome!'
    : `Welcome ${userInfo.value.given_name}!`;
});
</script>

<template>
  <p>{{ welcomeMessage }}</p>

  <div v-if="isLoggedIn">
    <p v-if="isFetchingUserInfo">
      Loading...
    </p>
    <button @click="logout()">Logout</button>
  </div>

  <div v-if="!isLoggedIn">
    <button @click="login()">Login</button>
    <p>or</p>
    <button @click="register()">Register</button>
  </div>
</template>
```

#### State parameter

The `login` and `register` functions accept an optional string parameter: `state`, which will be passed back to the optional `onRedirect` callback specified on your `FusionAuthConfig`. Though you may pass any value you would like for the state parameter, it is often used to indicate which page the user was on before redirecting to login or registration, so that the user can be returned to that location after a successful authentication.

### UI Components

#### Protecting Content

The `RequireAuth` and `RequireAnonymous` can be used to restrict content based on authentication and authorization.

```html
<template>
  <RequireAuth :with-role="['ADMIN', 'SUPER-ADMIN']">
    <!-- only displays for users with specifed role -->
    <button>Delete user</button>
  </RequireAuth>
</template>

<template>
  <RequireAnonymous>
    <!-- content for unauthenticated users -->
  </RequireAnonymous>
</template>
```

#### Pre-built buttons

There are three pre-styled buttons that are configured to perform
login/logout/registration. They can be placed anywhere in your app as
is.

```html
<template>
  <FusionAuthLoginButton />
  <FusionAuthLogoutButton />
  <FusionAuthRegisterButton />
</template>

<style>
  :root {
    --fusionauth-button-background-color: #096324;
    --fusionauth-button-text-color: #fff;
  }
</style>
```

With the CSS variables, you can customize the buttons to match your app’s style.

## Quickstart

See the [FusionAuth Vue Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-vue-web) for a full tutorial on using FusionAuth and Vue.

## Documentation

[Full library
documentation](https://github.com/FusionAuth/fusionauth-vue-sdk/blob/main/docs/documentation.md)

<!--
end::forDocSite[]
-->

Use backticks for code in this readme. This readme is included on the FusionAuth website, and backticks show the code in the best light there.

## Releases

This package is released via GitHub actions.

## Upgrade Policy

This library may periodically receive updates with bug fixes, security patches, tests, code samples, or documentation changes.

These releases may also update dependencies, language engines, and operating systems, as we\'ll follow the deprecation and sunsetting policies of the underlying technologies that the libraries use.

This means that after a dependency (e.g. language, framework, or operating system) is deprecated by its maintainer, this library will also be deprecated by us, and may eventually be updated to use a newer version.
