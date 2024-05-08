import { vi, describe, it, expect, afterEach } from 'vitest';

import { FusionAuthConfig } from '../types';
import { createFusionAuth } from './createFusionAuth';
import {
  mockWindowLocation,
  mockIsLoggedIn,
  removeAt_expCookie,
} from '@fusionauth-sdk/core';

const config: FusionAuthConfig = {
  clientId: '85a03867-dccf-4882-adde-1a79aeec50df',
  serverUrl: 'http://localhost:9000',
  redirectUri: 'http://localhost',
  scope: 'openid offline_access',
};

describe('createFusionAuth', () => {
  afterEach(() => {
    removeAt_expCookie();
    localStorage.clear();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('`isLoggedIn` should update correctly as the access token expires', () => {
    vi.useFakeTimers();
    mockIsLoggedIn();

    const fusionAuth = createFusionAuth(config);
    expect(fusionAuth.isLoggedIn.value).toBe(true);

    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(fusionAuth.isLoggedIn.value).toBe(false);
  });

  it('Fetches userInfo', async () => {
    const user = { given_name: 'JSON', family_name: 'Bourne' };
    const mockUserInfoResponse = new Response(JSON.stringify(user), {
      status: 200,
    });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockUserInfoResponse);

    const fusionAuth = createFusionAuth(config);
    await fusionAuth.getUserInfo();

    expect(fusionAuth.userInfo.value).toEqual(user);
  });

  it('Handles a failed user info request', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 500 }),
    );
    const fusionAuth = createFusionAuth(config);
    await fusionAuth.getUserInfo();
    expect(fusionAuth.error.value).toBeInstanceOf(Error);
  });

  it('Invokes a redirect callback', () => {
    mockIsLoggedIn();
    const onRedirect = vi.fn();
    const expectedStateValue = 'redirect-callback-test';
    localStorage.setItem(
      'fa-sdk-redirect-value',
      `rAnd0mStR1ng:${expectedStateValue}`,
    );

    createFusionAuth({ ...config, onRedirect });

    expect(onRedirect).toHaveBeenCalledWith(expectedStateValue);
  });

  it('Invokes `onAutoRefreshFailure` with a helpful error when autorefresh fails', async () => {
    vi.useFakeTimers();
    mockIsLoggedIn();

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ msg: 'could not refresh access token' }), {
        status: 400,
      }),
    );

    const onAutoRefreshFailure = vi.fn();

    createFusionAuth({
      ...config,
      shouldAutoRefresh: true,
      onAutoRefreshFailure,
    });

    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

    expect(onAutoRefreshFailure).toHaveBeenCalledWith(
      Error(JSON.stringify({ msg: 'could not refresh access token' })),
    );
  });

  it('Can be configured to automatically refresh the access token', () => {
    mockIsLoggedIn();
    vi.useFakeTimers();

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    const tokenRefreshPath = 'my-refresh-path';
    createFusionAuth({
      ...config,
      tokenRefreshPath,
      shouldAutoRefresh: true,
      autoRefreshSecondsBeforeExpiry: 60, // 60 seconds before expire
    });

    vi.advanceTimersByTime(60 * 58 * 1000); // 58 minutes
    expect(fetch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60 * 1000); // should trigger refresh

    const expectedUrl = new URL(config.serverUrl);
    expectedUrl.pathname = tokenRefreshPath;
    expectedUrl.searchParams.set('client_id', config.clientId);

    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain' },
    });
  });

  it('Redirects to login', () => {
    const mockedLocation = mockWindowLocation(vi);
    const fusionAuth = createFusionAuth(config);

    const stateValue = 'login-state-value';
    fusionAuth.login(stateValue);

    const expectedUrl = new URL(config.serverUrl);
    expectedUrl.pathname = '/app/login';
    expectedUrl.searchParams.set('client_id', config.clientId);
    expectedUrl.searchParams.set('redirect_uri', config.redirectUri);
    expectedUrl.searchParams.set('scope', config.scope!);
    expectedUrl.searchParams.set('state', stateValue);

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  it('Redirects to register', () => {
    const mockedLocation = mockWindowLocation(vi);
    const fusionAuth = createFusionAuth(config);

    const stateValue = 'register-state-value';
    fusionAuth.register(stateValue);

    const expectedUrl = new URL(config.serverUrl);
    expectedUrl.pathname = '/app/register';
    expectedUrl.searchParams.set('client_id', config.clientId);
    expectedUrl.searchParams.set('redirect_uri', config.redirectUri);
    expectedUrl.searchParams.set('scope', config.scope!);
    expectedUrl.searchParams.set('state', stateValue);

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  it('Redirects to logout', () => {
    const mockedLocation = mockWindowLocation(vi);
    const fusionAuth = createFusionAuth(config);

    fusionAuth.logout();

    const expectedUrl = new URL(config.serverUrl);
    expectedUrl.pathname = '/app/logout';
    expectedUrl.searchParams.set('client_id', config.clientId);
    expectedUrl.searchParams.set(
      'post_logout_redirect_uri',
      config.redirectUri,
    );

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });
});
