import { afterEach, describe, it, expect, vi } from 'vitest';

import { SDKConfig } from '../SDKConfig';
import { SDKCore } from '.';
import { RedirectHelper } from '../RedirectHelper';

import { mockIsLoggedIn, mockWindowLocation, removeAt_expCookie } from '..';

describe('SDKCore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    removeAt_expCookie();
    localStorage.clear();
  });

  const config: SDKConfig = {
    serverUrl: 'http://my-server',
    clientId: 'abc123',
    redirectUri: 'http://my-client',
    onTokenExpiration: vi.fn(),
  };

  it('Knows that the user is logged in when the at_exp is present and in the future', () => {
    vi.useFakeTimers();
    mockIsLoggedIn();

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    const core = new SDKCore(config);

    expect(core.isLoggedIn).toBe(true);

    vi.advanceTimersByTime(60 * 59 * 1000); // move time ahead 59 minutes
    expect(core.isLoggedIn).toBe(true);
    expect(config.onTokenExpiration).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60 * 1000); // move time ahead 1 minute
    expect(core.isLoggedIn).toBe(false);
    expect(config.onTokenExpiration).toHaveBeenCalledTimes(1);
  });

  it('Initialize automatic token refresh', async () => {
    vi.useFakeTimers();
    mockIsLoggedIn();

    vi.spyOn(window, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    vi.spyOn(SDKCore.prototype, 'refreshToken');

    const core = new SDKCore({ ...config, shouldAutoRefresh: true });

    const timeout = core.initAutoRefresh(); // set autorefresh for 30 seconds before expiration

    vi.advanceTimersByTime(59 * 60 * 1000); // advance time 59 minutes
    expect(core.refreshToken).not.toHaveBeenCalled();

    vi.advanceTimersByTime(49 * 1000); // advance time 50 seconds
    expect(core.refreshToken).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000); // advance time 1 second
    expect(core.refreshToken).toHaveBeenCalledTimes(1);

    clearTimeout(timeout);
  });

  it('Clears existing token refresh timeout on init', async () => {
    vi.useFakeTimers();
    mockIsLoggedIn();

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    vi.spyOn(SDKCore.prototype, 'refreshToken');

    const core = new SDKCore({ ...config, shouldAutoRefresh: true });

    const timeout1 = core.initAutoRefresh(); // set autorefresh for 30 seconds before expiration
    const timeout2 = core.initAutoRefresh(); // Mock React StrictMode behaviour

    vi.advanceTimersByTime(59 * 60 * 1000); // advance time 59 minutes
    expect(core.refreshToken).not.toHaveBeenCalled();

    vi.advanceTimersByTime(49 * 1000); // advance time 50 seconds
    expect(core.refreshToken).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000); // advance time 1 second
    expect(core.refreshToken).toHaveBeenCalledTimes(1);

    clearTimeout(timeout1);
    clearTimeout(timeout2);
  });

  it('Invokes `redirectHelper.handlePreRedirect` before starting login and register', () => {
    const handlePreRedirect = vi.spyOn(
      RedirectHelper.prototype,
      'handlePreRedirect',
    );
    mockWindowLocation(vi);
    const core = new SDKCore(config);

    expect(handlePreRedirect).toHaveBeenCalledTimes(0);

    core.startLogin('/login');
    core.startRegister();

    expect(handlePreRedirect).toHaveBeenNthCalledWith(1, '/login');
    expect(handlePreRedirect).toHaveBeenNthCalledWith(2, undefined);
  });

  it('Stores a redirect value pre-login redirect and cleans up post-login', () => {
    mockIsLoggedIn();
    mockWindowLocation(vi);
    const redirectIndicator = () =>
      localStorage.getItem('fa-sdk-redirect-value');
    const onRedirectCallback = vi.fn();
    const core = new SDKCore(config);

    expect(redirectIndicator()).toBeNull();

    core.startLogin();
    expect(redirectIndicator()).toBeDefined();

    core.handlePostRedirect(onRedirectCallback);
    expect(redirectIndicator()).toBeNull();
    expect(onRedirectCallback).toHaveBeenCalledWith(undefined);
  });

  it('`handlePostRedirect` Does not invoke the callback given if redirect did not happen', () => {
    mockIsLoggedIn();
    const core = new SDKCore({ ...config });
    const onRedirect = vi.fn();

    core.handlePostRedirect(onRedirect);

    expect(onRedirect).not.toHaveBeenCalled();
  });
});
