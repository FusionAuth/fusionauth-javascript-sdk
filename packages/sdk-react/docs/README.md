@fusionauth/react-sdk / [Modules](modules.md)

An SDK for using FusionAuth in React applications.

# Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
	- [useFusionAuth](#usefusionauth)
    - [State Parameter](#state-parameter)
	- [Protecting content](#protecting-content)
	- [UI Components](#ui-components)
	- [Known issues](#known-issues)
- [Quickstart](#quickstart)
- [Documentation](#documentation)
- [Formatting](#formatting)
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

This SDK manages authentication state for your React app and provides functionality to login, register, and logout users. It can be easily configured to automatically manage your refresh token and fetch user info.

Your users will be sent to FusionAuth’s themeable hosted login pages and
then log in. After that, they are sent back to your React application.

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
npm install @fusionauth/react-sdk
```

Yarn:

```bash
yarn add @fusionauth/react-sdk
```

### Configuration

Wrap your app with `FusionAuthProvider`.

```jsx
import ReactDOM from 'react-dom/client';
import { FusionAuthProviderConfig, FusionAuthProvider } from '@fusionauth/react-sdk';

const config: FusionAuthProviderConfig = {
  clientId: "", // Your app's FusionAuth client id
  redirectUri: "", // The URI that the user is directed to after the login/register/logout action
  serverUrl: "", // The url of the server that performs the token exchange
  shouldAutoFetchUserInfo: true, // Automatically fetch userInfo when logged in. Defaults to false.
  shouldAutoRefresh: true, // Enables automatic token refresh. Defaults to false.
  onRedirect: (state?: string) => { }, // Optional callback invoked upon redirect back from login or register.
};

ReactDOM.createRoot(document.getElementById("my-app")).render(
  <FusionAuthProvider {...config}>
    <App />
  </FusionAuthProvider>
)
```

## Usage

### useFusionAuth

Once your app is wrapped in `FusionAuthProvider`, you can use `useFusionAuth`.

```jsx
import { useFusionAuth } from '@fusionauth/react-sdk';

function MyComponent() {
  const {
    isLoggedIn,
    isFetchingUserInfo,
    startLogin,
    startRegister,
    userInfo
  } = useFusionAuth()

  if (isFetchingUserInfo) {
    return <p>Loading...</p>
  }

  if (!isLoggedIn) {
    return (
      <div>
        <button onClick={startLogin}>Login</button>
        <p>or</p>
        <button onClick={startRegister}>Register</button>
      </div>
    );
  }

  if (userInfo?.given_name) {
    return <p>Welcome {userInfo.given_name}!</p>
  }
}
```

Alternatively, you may interact with the SDK using the `withFusionAuth` higher-order component.

#### State Parameter

The `startLogin` and `startRegister` functions accept an optional string parameter: `state`. The value passed in will be passed to the `onRedirect` callback on your `FusionAuthProviderConfig`. Though you may pass any value you would like for the state parameter, it is often used to indicate which page the user was on before redirecting to login or registration, so that the user can be returned to that location after a successful authentication.

### Protecting Content

The `RequireAuth` component can be used to protect information from unauthorized users. It takes an optional prop `withRole` that can be used to ensure the user has a specific role. If an array of roles is passed, the user must have at least one of the roles to be authorized.

```jsx
import { RequireAuth, useFusionAuth } from '@fusionauth/react-sdk';

const UserNameDisplay = () => {
  const { userInfo } = useFusionAuth();

  return (
    <RequireAuth>
      <p>User: {userInfo.given_name}</p> // Only displays if user is authenticated
    </RequireAuth>
  );
};

const AdminPanel = () => (
  <RequireAuth withRole="admin">
    <button>Delete User</button> // Only displays if user is authenticated and has 'admin' role
  </RequireAuth>
);
```

### UI Components

This SDK offers 3 pre-built UI components.

```jsx
import {
  FusionAuthLoginButton,
  FusionAuthLogoutButton,
  FusionAuthRegisterButton
} from '@fusionauth/react-sdk';

export const LoginPage = () => (
  <>
    <h1>Welcome, please log in or register</h1>
    <FusionAuthLoginButton />
    <FusionAuthRegisterButton />
  </>
);

export const AccountPage = () => (
  <>
    <h1>Hello, user!</h1>
    <FusionAuthLogoutButton />
  </>
);
```

### Known Issues

None

## Quickstart

See the [FusionAuth React Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-react-web) for a full tutorial on using FusionAuth and React.

## Documentation

[Full library documentation](https://github.com/FusionAuth/fusionauth-javascript-sdk/tree/main/packages/sdk-react/docs)

These docs are generated with [typedoc](https://typedoc.org/) and configured with [typedoc-plugin-markdown](https://www.npmjs.com/package/typedoc-plugin-markdown).

<!--
end::forDocSite[]
-->

## Formatting

There are several linting packages run when you push to a branch. One is `prettier`. If this fails, you can fix the files from the command line:

* npm run install
* npm run prettier -- -w /path/to/file

Doing this will overwrite your file, but fix prettier's objections.

## Releases

To perform a release to NPM, create a release on GitHub. That will automatically publish a release to GitHub.

## Upgrade Policy

This library may periodically receive updates with bug fixes, security patches, tests, code samples, or documentation changes.

These releases may also update dependencies, language engines, and operating systems, as we\'ll follow the deprecation and sunsetting policies of the underlying technologies that the libraries use.

This means that after a dependency (e.g. language, framework, or operating system) is deprecated by its maintainer, this library will also be deprecated by us, and may eventually be updated to use a newer version.
