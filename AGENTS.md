# AGENTS.md — fusionauth-javascript-sdk

## Repo Layout

Yarn workspace monorepo:
- `packages/core` — `@fusionauth-sdk/core`, shared logic for React/Angular/Vue SDKs
- `packages/lexicon` — `@fusionauth-sdk/lexicon`, shared utility types (Path, GUID, etc.)
- `packages/sdk-react` — `@fusionauth/react-sdk`
- `packages/sdk-angular` — Angular SDK (`sdk-angular-workspace`)
- `packages/sdk-vue` — `@fusionauth/vue-sdk`

## Package Manager

- **Yarn 1.22.x** via Corepack, not npm. `yarn` may not be on `PATH` directly —
  use `corepack yarn <cmd>` if plain `yarn` isn't found.
- Root scripts: `yarn build:core`, `yarn build:sdk-react`, etc. Per-workspace:
  `yarn workspace @fusionauth-sdk/core test`.

## Node Version Constraint

- **Angular SDK requires Node ^22.22.3 / ^24.15.0 / >=26.0.0.** If the active
  Node is v20.x, `yarn workspace sdk-angular-workspace test` (and the root
  `yarn test` which runs it) will fail with an engine/CLI version error.
  This is an environment limitation, not a code issue — don't try to "fix" it
  by changing the Angular config.
- If `yarn install` complains about the Angular engine mismatch, use
  `yarn install --ignore-engines`.

## Testing

- Vitest, `environment: 'jsdom'` (see each package's `vite.config.ts`).
- `packages/core` tests needing `indexedDB` must polyfill it with
  `fake-indexeddb`'s `IDBFactory` (jsdom has no native IndexedDB).
- Husky's `.husky/pre-commit` hook runs `yarn test` across **all** workspaces
  plus `lint-staged`. In environments without Node 22+, this hook will fail
  on the Angular workspace even when your actual changes are fine — verify
  the specific package's tests pass, note that the Angular failure is
  environmental, and use `git commit --no-verify` if needed (call this out
  explicitly to the user rather than silently bypassing).

## Lint / Format

- ESLint config: root `.eslintrc.json` (`@typescript-eslint`, warns on unused
  vars, `prefer-const`).
- Prettier: root `.prettierrc` (single quotes, semi, trailing commas, 80 print
  width). Run `npx prettier --check <paths>` / `--write` before committing.

## Code Conventions

- Each module lives in its own folder with `X.ts`, `X.test.ts`, and an
  `index.ts` barrel export (see `UrlHelper/`, `CookieHelpers/`, `DPoP/`).
- Browser-only APIs (`localStorage`, `indexedDB`, etc.) should degrade
  gracefully for non-browser/SSR consumers — see `RedirectHelper.ts`'s
  try/catch fallback pattern.
- Doc comments (`/** ... */`) on all public `SDKConfig` fields and public
  class methods, matching existing style.
