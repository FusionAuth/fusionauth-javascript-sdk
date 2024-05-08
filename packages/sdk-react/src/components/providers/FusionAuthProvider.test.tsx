import { PropsWithChildren } from 'react';
import { act, waitFor, renderHook } from '@testing-library/react';
import { describe, afterEach, test, expect, vi } from 'vitest';

import {
  FusionAuthProvider,
  useFusionAuth,
} from '#/components/providers/FusionAuthProvider';
import { FusionAuthProviderConfig } from './FusionAuthProviderConfig';
import { UserInfo } from './Context';

import {
  mockIsLoggedIn,
  removeAt_expCookie,
  mockWindowLocation,
} from '@fusionauth-sdk/core';
import { TEST_CONFIG } from '#testing-tools/mocks/testConfig';

function renderWithWrapper(config: FusionAuthProviderConfig) {
  return renderHook(() => useFusionAuth(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <FusionAuthProvider {...config}>{children}</FusionAuthProvider>
    ),
  });
}

describe('FusionAuthProvider', () => {
  afterEach(() => {
    removeAt_expCookie();
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('Redirects to the correct login url', () => {
    const mockedLocation = mockWindowLocation(vi);

    const { result } = renderWithWrapper(TEST_CONFIG);

    const stateValue = 'state-value';
    result.current.startLogin(stateValue);

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/login';
    expectedUrl.searchParams.set('client_id', TEST_CONFIG.clientId);
    expectedUrl.searchParams.set('redirect_uri', TEST_CONFIG.redirectUri);
    expectedUrl.searchParams.set('scope', TEST_CONFIG.scope!);
    expectedUrl.searchParams.set('state', stateValue);

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  test('Redirects to the correct logout url', () => {
    const mockedLocation = mockWindowLocation(vi);

    const { result } = renderWithWrapper(TEST_CONFIG);

    result.current.startLogout();

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/logout';
    expectedUrl.searchParams.set('client_id', TEST_CONFIG.clientId);
    expectedUrl.searchParams.set(
      'post_logout_redirect_uri',
      TEST_CONFIG.redirectUri,
    );

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  test('Redirects to the correct register url with `state` value echoed back.', () => {
    const mockedLocation = mockWindowLocation(vi);

    const { result } = renderWithWrapper(TEST_CONFIG);

    const stateValue = 'my-state-value';
    result.current.startRegister(stateValue);

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/register';
    expectedUrl.searchParams.set('client_id', TEST_CONFIG.clientId);
    expectedUrl.searchParams.set('redirect_uri', TEST_CONFIG.redirectUri);
    expectedUrl.searchParams.set(
      'scope',
      'openid email profile offline_access',
    );
    expectedUrl.searchParams.set('state', stateValue);

    expect(localStorage.getItem('fa-sdk-redirect-value')).toContain(stateValue); // this asserts that `state` was echoed back.
    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  test('Invokes an onRedirect callback when logged in if an item is found in local storage', () => {
    mockIsLoggedIn();

    const stateValue = 'hello-world';
    localStorage.setItem('fa-sdk-redirect-value', `abc123:${stateValue}`);

    const onRedirect = vi.fn();
    renderWithWrapper({ ...TEST_CONFIG, onRedirect });

    expect(onRedirect).toHaveBeenCalled();
  });

  test('Will not invoke onRedirect if no redirect value is found in localStorage', () => {
    const onRedirect = vi.fn();
    mockIsLoggedIn();

    renderWithWrapper({ ...TEST_CONFIG, onRedirect });

    expect(onRedirect).not.toHaveBeenCalled();
  });

  test('Will fetch userInfo', async () => {
    const user: UserInfo = { given_name: 'Mr. Userton' };
    const mockUserInfoResponse = {
      ok: true,
      json: () => Promise.resolve(user),
    } as Response;
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockUserInfoResponse);

    const { result } = renderWithWrapper(TEST_CONFIG);

    expect(fetch).not.toHaveBeenCalled();

    act(() => {
      result.current.fetchUserInfo();
    });

    expect(fetch).toHaveBeenCalled();
    expect(result.current.isFetchingUserInfo).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetchingUserInfo).toBe(false);
      expect(result.current.userInfo).toBe(user);
    });
  });

  test('Can be configured with `shouldAutoFetchUserInfo`', async () => {
    const user: UserInfo = { given_name: 'JSON Bourne' };

    const mockUserInfoResponse = {
      ok: true,
      json: () => Promise.resolve(user),
    } as Response;
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockUserInfoResponse);
    mockIsLoggedIn();

    const { result } = renderWithWrapper({
      ...TEST_CONFIG,
      shouldAutoFetchUserInfo: true,
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        new URL('http://localhost:9000/app/me'),
        {
          credentials: 'include',
        },
      );
      expect(result.current.userInfo).toEqual(user);
    });
  });

  test('Provides a helpful error when fetchUserInfo fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    const { result } = renderWithWrapper(TEST_CONFIG);

    act(() => {
      result.current.fetchUserInfo();
    });

    await waitFor(() => {
      expect(result.current.error?.message).toBe(
        'Unable to fetch userInfo in fusionauth. Request failed with status code 401',
      );
    });
  });

  test('Updates the `isLoggedOut` property when the access token expires', () => {
    vi.useFakeTimers();
    mockIsLoggedIn();

    const { result } = renderWithWrapper(TEST_CONFIG);

    expect(result.current.isLoggedIn).toBe(true);

    act(() => vi.advanceTimersByTime(60 * 60 * 1000));

    expect(result.current.isLoggedIn).toBe(false);
  });

  test('Can be configured with `shouldAutoRefresh`', () => {
    vi.useFakeTimers();

    mockIsLoggedIn(); // mock logged in -- expires in 1 hour

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(null, {
        status: 200,
      }),
    );

    act(() => {
      renderWithWrapper({
        ...TEST_CONFIG,
        shouldAutoRefresh: true,
        autoRefreshSecondsBeforeExpiry: 60, // call refresh endpoint in 59 minutes
      });
    });

    expect(fetch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60 * 58 * 1000); // 58 minutes
    expect(fetch).not.toHaveBeenCalled(); // not called

    act(() => vi.advanceTimersByTime(60 * 1000)); // 1 more minute
    expect(fetch).toHaveBeenCalledTimes(1); // called

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/refresh';
    expectedUrl.searchParams.set('client_id', TEST_CONFIG.clientId);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain' },
    });
  });
});
