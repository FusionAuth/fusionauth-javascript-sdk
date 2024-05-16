# FusionAuth Web SDKs

This is the FusionAuth Web SDKs monorepo. This repo manages FusionAuth [React](https://fusionauth.io/docs/sdks/react-sdk), [Angular](https://fusionauth.io/docs/sdks/angular-sdk), and [Vue](https://fusionauth.io/docs/sdks/vue-sdk) SDKs.

Each SDK in this repo offers the following APIs:
- Redirect to/from a login, register, or logout page.
- Manage authentication state using reactive properties in a given framework (React, Vue, Angular).
- Fetch user info from fusionauth.
- Refresh access token.
    - This can be done automatically with the `shouldAutoRefresh` config option or by invoking a function.
- UI elements.

## Development

Install dependencies with `yarn install`.

The SDKs share a core package that contains framework agnostic functionality. This package should be built before the the SDK is built--a step included in the build script for each SDK (for example `build:sdk-react`).

### Manual testing

[yalc](https://github.com/wclr/yalc) is a way to test your changes locally.

You may use the FusionAuth Quickstarts to consume the package and test changes. See [React Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-react-web), [Angular Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-angular-web), & [Vue Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-vue-web)

Be aware of what node version you are using to publish and consume the package with yalc--mismatched versions can make the link not work.

If you decide to use something like `yarn link` instead of `yalc`, be aware of how your dependencies are being consumed via the symlink. `yalc` copies your assets directly, so it's a more realistic representation of the production build than a symlink.

## Upgrade Policy

This library may periodically receive updates with bug fixes, security patches, tests, code samples, or documentation changes.

These releases may also update dependencies, language engines, and operating systems, as we\'ll follow the deprecation and sunsetting policies of the underlying technologies that the libraries use.

This means that after a dependency (e.g. language, framework, or operating system) is deprecated by its maintainer, this library will also be deprecated by us, and may eventually be updated to use a newer version.
