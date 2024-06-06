import { afterEach, describe, it, expect, vi } from 'vitest';

import { SDKConfig } from '../SDKConfig';
import { SDKCore } from '.';

import { mockIsLoggedIn, removeAt_expCookie } from '..';

describe('SDKCore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    removeAt_expCookie();
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
});
