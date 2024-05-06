# FusionAuth Web SDKs

This is the FusionAuth Web SDKs monorepo. This repo manages FusionAuth [React](https://fusionauth.io/docs/sdks/react-sdk), [Angular](https://fusionauth.io/docs/sdks/angular-sdk), and [Vue](https://fusionauth.io/docs/sdks/vue-sdk) SDKs.

Each SDK in this repo offers the following APIs:
- Redirect to/from a login, register, or logout page.
- Manage authentication state using reactive properties in a given framework (React, Vue, Angular).
- Fetch user info from fusionauth.
- Refresh access token.
    - This can be done automatically with the `shouldAutoRefresh` config option or by invoking a function.
- Provides UI elements that consume a provided functionality.

## Upgrade Policy

This library may periodically receive updates with bug fixes, security patches, tests, code samples, or documentation changes.

These releases may also update dependencies, language engines, and operating systems, as we\'ll follow the deprecation and sunsetting policies of the underlying technologies that the libraries use.

This means that after a dependency (e.g. language, framework, or operating system) is deprecated by its maintainer, this library will also be deprecated by us, and may eventually be updated to use a newer version.
