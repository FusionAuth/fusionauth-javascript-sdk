# Table of Contents

- [Development](#development)
    - [Manual testing](#manual-testing)
        - [Gotchas](#gotchas)
- [Architecture](#architecture)
- [Upgrade Policy](#upgrade-policy)

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

## Manual testing

You may use the FusionAuth Quickstarts to consume the package and test changes. See [React Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-react-web), [Angular Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-angular-web), & [Vue Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-vue-web)

There is more than one way to test your changes locally, but [yalc](https://github.com/wclr/yalc) has serves devs of this project well, as long as you pay attention to the [gotchas](#gotchas).

You may use the `yalc-pub:sdk` scripts in the root package.json. For example, `yarn yalc-pub:sdk-react`. These build the SDKs and publish to your yalc store so they may be consumed locally.

Here's a potential iteration:
- Make your changes in one of the SDKs. (Consider adding something like `console.log('Hello 👋')` where you know you’ll see it, to confirm your changes have been consumed.)
- Build the SDK and publish a local build of the package. You may use: `yarn yalc-pub:sdk-angular`
- cd into the app that will consume the local package.
- `yalc add @fusionauth/angular-sdk`
- Start the app and observe your changes.

### Gotchas

If your changes are not being consumed as you expected, consider the following:

- Delete `node_modules` and removing all previous yalc installations (`rm -rf node_modules && yalc remove --all`). Then reinstall dependencies and re-install from yalc. We've found this to provide consistent iterations, whereas `yalc push` has proved flakey for developers of this project.
- If your consuming application uses an application framework like Angular, Nuxt, or Next, consider deleting any cache directories (such as `.angular` or `.nuxt`) between iterations.
- Be aware of what node version you are using to publish and consume the package--mismatched node versions can cause yalc to flake with indication.

If you decide to use something like `yarn link` instead of `yalc`, be aware of how your dependencies are being consumed via the symlink. `yalc` copies your assets directly, so it's a more realistic representation of the production build than a symlink.

## Architecture

We use a monorepo because our SDKs share core functionality, which is contained in the @fusionauth-sdk/core package. This private module is bundled into the distributed SDK packages, allowing us to maintain core logic in a single place.

For React and Vue, our build tool is [`Vite`](https://vitejs.dev/guide/).

Angular differs slightly because [`@angular-devkit/build-angular:ng-packagr`](https://github.com/ng-packagr/ng-packagr), the builder for Angular libraries, doesn't support bundling dependencies from outside the Angular workspace. Our solution is to copy the core package's `src` directory into the Angular workspace without transpiling it, letting Angular's library builder handle it as if it were not an external dependency. This copied directory functions like a `dist`: it is git-ignored, and changes should be made in `packages/core`. The build process will then consume the updates. See [GitHub issue #84](https://github.com/FusionAuth/fusionauth-javascript-sdk/issues/84) for more details.

## Upgrade Policy

This library may periodically receive updates with bug fixes, security patches, tests, code samples, or documentation changes.

These releases may also update dependencies, language engines, and operating systems, as we\'ll follow the deprecation and sunsetting policies of the underlying technologies that the libraries use.

This means that after a dependency (e.g. language, framework, or operating system) is deprecated by its maintainer, this library will also be deprecated by us, and may eventually be updated to use a newer version.
