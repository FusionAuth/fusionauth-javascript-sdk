import { VitestUtils } from 'vitest';

/**
 * Mocks `window.location`, stubbing `assign()` so redirects can be asserted
 * on without actually navigating.
 *
 * @param search  Optional query string (e.g. `'?code=abc123'`) to simulate
 *                landing on a redirect URI that carries an authorization
 *                `code`. Defaults to the current `window.location.search`.
 */
function mockWindowLocation(vi: VitestUtils, search?: string) {
  const mockedLocation = {
    ...window.location,
    ...(search !== undefined ? { search } : {}),
    assign: vi.fn(),
  };
  vi.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);
  return mockedLocation;
}

export { mockWindowLocation };
