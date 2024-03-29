import { afterEach, describe, it, expect, vi, beforeEach } from 'vitest';

import { TokenRefresher } from 'src/TokenRefresher';

describe('UrlHelpers.generateUrl', () => {
  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockResolvedValue({ status: 200 } as Response);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('Should request the given URL', async () => {
    const url = new URL('http://token-refresh-class.com/refresh-token');
    const tokenRefresher = new TokenRefresher(url);

    await tokenRefresher.refreshToken();

    expect(fetch).toHaveBeenCalledWith(url.href, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  });

  it('Initialize automatic refresh', async () => {
    const url = new URL('http://token-refresh-class.com/refresh-token');
    const tokenRefresher = new TokenRefresher(url);

    tokenRefresher.refreshToken = vi.fn();

    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1); // 1 hour in the future

    document.cookie = `app.at_exp=${expirationTime.getTime() / 1000}`; // set cookie as epoch time

    const timeout = tokenRefresher.initAutoRefresh(30); // refresh 30 seconds before expiration

    vi.advanceTimersByTime(59 * 60 * 1000); // advance time 59 minutes
    expect(tokenRefresher.refreshToken).not.toHaveBeenCalled();

    vi.advanceTimersByTime(29 * 1000); // advance time 29 seconds
    expect(tokenRefresher.refreshToken).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000); // advance time 1 second
    expect(tokenRefresher.refreshToken).toHaveBeenCalledTimes(1);

    clearTimeout(timeout);
  });
});
