import { afterEach, describe, it, expect, vi } from 'vitest';

import { SDKConfig } from '#/SDKConfig';

import { SDKCore } from '.';

describe('SDKCore', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.cookie =
      'app.at_exp' + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  });

  it('Knows that the user is logged in when the at_exp is present and in the future', () => {
    vi.useFakeTimers();

    const expirationMoment = new Date();
    expirationMoment.setHours(expirationMoment.getHours() + 1);
    const oneHourInTheFutureInMilliseconds = expirationMoment.getTime() / 1000;

    document.cookie = `app.at_exp=${oneHourInTheFutureInMilliseconds}`;
    const config: SDKConfig = {
      serverUrl: 'http://my-server',
      clientId: 'abc123',
      redirectUri: 'http://my-client',
    };
    const onTokenExpiration = vi.fn();

    const core = new SDKCore({ ...config, onTokenExpiration });

    expect(core.isLoggedIn).toBe(true);

    vi.advanceTimersByTime(60 * 59 * 1000); // move time ahead 59 minutes
    expect(core.isLoggedIn).toBe(true);
    expect(onTokenExpiration).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60 * 1000); // move time ahead 1 minute
    expect(core.isLoggedIn).toBe(false);
    expect(onTokenExpiration).toHaveBeenCalledTimes(1);
  });
});
