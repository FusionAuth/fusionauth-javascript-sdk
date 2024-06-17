# Table of Contents

- [Development](#development)
    - [Gotchas](#gotchas)
- [Manual testing](#manual-testing)
- [E2E testing](#e2e-testing)
- [Architecture](#architecture)
- [Release Process](#release-process)
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

The SDKs share a core package that contains framework agnostic functionality. Building the core package is a step included in the build script for each SDK (for example `build:sdk-react`).

You may use the FusionAuth Quickstarts to consume the package and test changes. See [React Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-react-web), [Angular Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-angular-web), & [Vue Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-vue-web)

There is more than one way to test your changes locally, but [yalc](https://github.com/wclr/yalc) has served devs of this project well, as long as you are aware of the [gotchas](#gotchas).

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

## Manual testing

The SDKs provide the following functionality:
- Login
- Register new user
- Logout
- A logged in user automatically becomes logged out when their access token expires
- User info can be fetched
- A pending state when the request to fetch user info is unresolved
- Failure to fetch user info provides a helpful error to the consuming application
- Access token can be automatically and continuously refreshed
- Redirect callback is invoked after login or register

## E2E testing
The [Playwright](https://playwright.dev/docs/intro) end-to-end tests verify the proper functionality of several authentication and authorization endpoints in the FA SDK.

Prerequisites
- Ensure Playwright has been installed as a dependency 
- On a seperate server run the FA SDK consuming quickstart application.

Configuration

The Playwright configuration (playwright.config.ts) includes settings for running tests in parallel, specifying browser environments, and defining the base URL the tests will perform on.

Running the Tests

Prior to running the tests you will want to check the Server Command that is used to start up a local instance of the FA SDK consuming quickstart application. Additionally you will want to note the port number this application will run on.

Run Tests:

`SERVER_COMMAND="your-server-start-command" PORT=your-port-number yarn test:e2e`
    Example: `SERVER_COMMAND="npm run start" PORT=9011 yarn test:e2e`

Structure

The e2e tests are structured to use the Page Object Model (POM) design pattern. A POM is a design pattern in test automation that creates an object repository for web UI elements found in the pages directory. This makes tests more maintainable and reusable. 
    Example: In common.page.ts, methods for navigation and authentication are defined.
Tests import these page objects to perform actions, ensuring that if the UI changes, only the page object needs updating, not all the tests.

## Architecture

We use a monorepo because our SDKs share core functionality, which is contained in the @fusionauth-sdk/core package. This private module is bundled into the distributed SDK packages, allowing us to maintain core logic in a single place.

For React and Vue, our build tool is [`Vite`](https://vitejs.dev/guide/).

Angular differs slightly because [`@angular-devkit/build-angular:ng-packagr`](https://github.com/ng-packagr/ng-packagr), the builder for Angular libraries, doesn't support bundling dependencies from outside the Angular workspace. Our solution is to copy the core package's `src` directory into the Angular workspace without transpiling it, letting Angular's library builder handle it as if it were not an external dependency. This copied directory functions like a `dist`: it is git-ignored, and changes should be made in `packages/core`. The build process will then consume the updates. See [GitHub issue #84](https://github.com/FusionAuth/fusionauth-javascript-sdk/issues/84) for more details.

## Release Process

The SDKs use [GitHub Actions](https://docs.github.com/en/actions) to automate the release process. Each SDK has a publish workflow defined in `.github/workflows`. 

Steps to create a release:
1. Checkout a new branch.
2. Bump the version number of the SDK to be released. Follow [semantic versioning](https://semver.org/).
3. Update documentation.
    - Add a section for the new version to the SDKs changelog at `changes.md`.
    - Edit the README for the SDK to be released if needed. It matters to users of the SDK, so please keep it up-to-date!
    - Update the generated docs for the SDK to be released with the `docs` script in its package.json.
4. Manually test the SDK to verify that the functionality described in [manual testing](#manual-testing) is correct.
5. Merge the release branch into `main`.
6. Dispatch the workflow to publish the new version.

## Upgrade Policy

This library may periodically receive updates with bug fixes, security patches, tests, code samples, or documentation changes.

These releases may also update dependencies, language engines, and operating systems, as we\'ll follow the deprecation and sunsetting policies of the underlying technologies that the libraries use.

This means that after a dependency (e.g. language, framework, or operating system) is deprecated by its maintainer, this library will also be deprecated by us, and may eventually be updated to use a newer version.
