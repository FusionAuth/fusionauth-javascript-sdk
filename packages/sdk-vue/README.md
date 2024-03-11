An SDK for using FusionAuth in Vue applications.

# Table of Contents

-   [Overview](#overview)

-   [Getting Started](#getting-started)

-   [Installation](#installation)

-   [Usage](#usage)

-   [Pre-built buttons](#pre-built-buttons)

-   [Service usage](#service-usage) 

-   [Documentation](#documentation)

-   [Quickstart](#quickstart)

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
your Vue application. You can do this via pre-built buttons, or with
the FusionAuthService in your own components.

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

### Configuring the Vue SDK

To configure the SDK, initialize the `FusionAuthVuePlugin` when you init your Vue app:

```typescript
const app = createApp(App)

app.use(FusionAuthVuePlugin, {
  clientId: '',
  serverUrl: '',
  redirectUri: '',
});

app.mount('#app')
```

If you want to use the pre-styled buttons, don't forget to import the css file:

```typescript
import '@fusionauth/vue-sdk/dist/style.css';
```

## Usage

### Pre-built buttons

There are three pre-styled buttons that are configured to perform
login/logout/registration. They can be placed anywhere in your app as
is.

```vue
<template>
  <FusionAuthLoginButton/>
  <FusionAuthLogoutButton/>
  <FusionAuthRegisterButton/>
</template>

<style>
  :root {
    --fusionauth-button-background-color: #096324;
    --fusionauth-button-text-color: #fff;
  }
</style>
```

With the CSS variables, you can customize the buttons to match your app’s style.

### Service usage

Alternatively, you may interact with the SDK Service by using the composable `useFusionAuth`.

```vue
<template>
  <button @click="fusionAuth.login">Login</button>
  <button @click="fusionAuth.logout">Logout</button>
  <button @click="fusionAuth.register">Register</button>
</template>

<script setup lang="ts">
  import {useFusionAuth} from "@fusionauth/vue-sdk";
  
  const fusionAuth = useFusionAuth();
</script>
```

#### State parameter

The `login` and `register` functions both accept an optional string
parameter called `state`. The login and register components can also be passed the
state as a prop. The state that is passed in to the function call will be echoed
back in the state query parameter of the callback uri specified in `redirectUri` on
the `FusionAuthConfig` used to initialize the `FusionAuthVuePlugin`. Though you may
pass any value you would like for the state parameter, it is often used to indicate
which page the user was on before redirecting to login or registration, so that the
user can be returned to that location after a successful authentication.

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

To perform a release to NPM, create a release on GitHub. That will automatically publish a release to GitHub.
