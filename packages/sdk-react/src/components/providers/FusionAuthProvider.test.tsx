import { PropsWithChildren, StrictMode, act } from 'react';
import { waitFor, renderHook } from '@testing-library/react';
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
  DPoPManager,
} from '@fusionauth-sdk/core';
import {
  TEST_CONFIG,
  TEST_AUTHPARAM_CONFIG,
} from '#testing-tools/mocks/testConfig';

function renderWithWrapper<T = UserInfo>(config: FusionAuthProviderConfig) {
  return renderHook(() => useFusionAuth<T>(), {
    wrapper: ({ children }: PropsWithChildren) => (
      <FusionAuthProvider<T> {...config}>{children}</FusionAuthProvider>
    ),
  });
}

/** Seeds `localStorage` with a valid, unexpired DPoP token set for `clientId`. */
function seedDpopTokens(
  clientId: string,
  overrides: Partial<{
    accessToken: string;
    refreshToken: string | undefined;
    expiresAt: number;
    tokenType: string;
  }> = {},
) {
  localStorage.setItem(
    `fusionauth-sdk:tokens:${clientId}`,
    JSON.stringify({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 60_000,
      tokenType: 'DPoP',
      ...overrides,
    }),
  );
}

describe('FusionAuthProvider', () => {
  afterEach(() => {
    removeAt_expCookie();
    localStorage.clear();
    vi.clearAllMocks();
    // Some tests enable fake timers (vi.useFakeTimers()) without restoring
    // real timers afterward; without this, they leak into later tests and
    // break anything relying on real timer polling (e.g. @testing-library's
    // waitFor()).
    vi.useRealTimers();
  });

  test('Redirects to the correct login url', () => {
    const mockedLocation = mockWindowLocation(vi);

    const { result } = renderWithWrapper(TEST_CONFIG);

    const stateValue = 'state-value';
    result.current.startLogin(stateValue);

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/login/';
    expectedUrl.searchParams.set('client_id', TEST_CONFIG.clientId);
    expectedUrl.searchParams.set('redirect_uri', TEST_CONFIG.redirectUri);
    expectedUrl.searchParams.set('scope', TEST_CONFIG.scope!);
    expectedUrl.searchParams.set('state', stateValue);

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  test('Redirects to the correct login url with idp_hint', () => {
    const mockedLocation = mockWindowLocation(vi);

    const { result } = renderWithWrapper(TEST_AUTHPARAM_CONFIG);

    const stateValue = 'state-value';
    result.current.startLogin(stateValue);

    const expectedUrl = new URL(TEST_AUTHPARAM_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/login/';
    expectedUrl.searchParams.set('client_id', TEST_AUTHPARAM_CONFIG.clientId);
    expectedUrl.searchParams.set(
      'redirect_uri',
      TEST_AUTHPARAM_CONFIG.redirectUri,
    );
    expectedUrl.searchParams.set('scope', TEST_AUTHPARAM_CONFIG.scope!);
    expectedUrl.searchParams.set(
      'idp_hint',
      TEST_AUTHPARAM_CONFIG?.authParams?.at(0)?.idp_hint,
    );
    expectedUrl.searchParams.set('state', stateValue);

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  test('Redirects to the correct logout url', () => {
    const mockedLocation = mockWindowLocation(vi);

    const { result } = renderWithWrapper(TEST_CONFIG);

    result.current.startLogout();

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/logout/';
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
    expectedUrl.pathname = '/app/register/';
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
    // Format: nonce:state (hosted backend mode)
    localStorage.setItem('fa-sdk-redirect-value', `abc123:${stateValue}`);

    const onRedirect = vi.fn();
    renderWithWrapper({ ...TEST_CONFIG, onRedirect });

    expect(onRedirect).toHaveBeenCalledWith(stateValue);
  });

  test('Will not invoke onRedirect if no redirect value is found in localStorage', () => {
    const onRedirect = vi.fn();
    mockIsLoggedIn();

    renderWithWrapper({ ...TEST_CONFIG, onRedirect });

    expect(onRedirect).not.toHaveBeenCalled();
  });

  test('Will fetch userInfo', async () => {
    const user = {
      name: 'Mr. Userton',
      age: 501,
    };
    const mockUserInfoResponse = {
      ok: true,
      json: () => Promise.resolve(user),
    } as Response;
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockUserInfoResponse);

    const { result } = renderWithWrapper<typeof user>(TEST_CONFIG);

    expect(fetch).not.toHaveBeenCalled();

    act(() => {
      result.current.fetchUserInfo();
    });

    expect(fetch).toHaveBeenCalled();
    expect(result.current.isFetchingUserInfo).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetchingUserInfo).toBe(false);
      expect(result.current.userInfo?.age).toBe(501);
      expect(result.current.userInfo?.name).toBe('Mr. Userton');
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
        new URL('http://localhost:9000/app/me/'),
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
      new Response(null, { status: 200 }),
    );

    renderWithWrapper({
      ...TEST_CONFIG,
      shouldAutoRefresh: true,
      autoRefreshSecondsBeforeExpiry: 60, // call refresh endpoint in 59 minutes
    });

    expect(fetch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60 * 58 * 1000); // 58 minutes
    expect(fetch).not.toHaveBeenCalled(); // not called

    act(() => vi.advanceTimersByTime(60 * 1000)); // 1 more minute
    expect(fetch).toHaveBeenCalledTimes(1); // called

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/refresh/';
    expectedUrl.searchParams.set('client_id', TEST_CONFIG.clientId);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain' },
    });
  });

  test('Auto refresh works when wrapped in StrictMode', () => {
    // Regression: under StrictMode (React double-invokes render) the core must
    // not be created with render-phase side effects, otherwise the committed
    // core ends up disposed and auto refresh never schedules.
    vi.useFakeTimers();
    mockIsLoggedIn(); // mock logged in -- expires in 1 hour

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 200 }),
    );

    renderHook(() => useFusionAuth(), {
      wrapper: ({ children }: PropsWithChildren) => (
        <StrictMode>
          <FusionAuthProvider
            {...TEST_CONFIG}
            shouldAutoRefresh
            autoRefreshSecondsBeforeExpiry={60}
          >
            {children}
          </FusionAuthProvider>
        </StrictMode>
      ),
    });

    vi.advanceTimersByTime(60 * 58 * 1000); // 58 minutes
    expect(fetch).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(60 * 1000)); // 1 more minute -> 59 minutes
    expect(fetch).toHaveBeenCalledTimes(1);

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/refresh/';
    expectedUrl.searchParams.set('client_id', TEST_CONFIG.clientId);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain' },
    });
  });

  test('Invokes `onRefreshFailure` if an error is thrown during autorefresh', async () => {
    vi.useFakeTimers();
    mockIsLoggedIn(); // mock logged in -- expires in 1 hour

    const failureData = JSON.stringify({ message: 'cannot refresh token' });
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(failureData, { status: 400 }),
    );

    const onAutoRefreshFailure = vi.fn();

    renderWithWrapper({
      ...TEST_CONFIG,
      shouldAutoRefresh: true,
      onAutoRefreshFailure,
    });

    await act(() => vi.advanceTimersByTime(60 * 60 * 1000));

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(onAutoRefreshFailure).toHaveBeenCalledWith(
      Error(
        JSON.stringify({
          status: 400,
          details: failureData,
        }),
      ),
    );
  });

  describe('DPoP mode', () => {
    test('dpopFetch, generateProof, and getAccessToken are functions when useDpop: true', () => {
      const { result } = renderWithWrapper({ ...TEST_CONFIG, useDpop: true });

      expect(typeof result.current.dpopFetch).toBe('function');
      expect(typeof result.current.generateProof).toBe('function');
      expect(typeof result.current.getAccessToken).toBe('function');
    });

    test('dpopFetch, generateProof, and getAccessToken are undefined when useDpop is false', () => {
      const { result } = renderWithWrapper({ ...TEST_CONFIG, useDpop: false });

      expect(result.current.dpopFetch).toBeUndefined();
      expect(result.current.generateProof).toBeUndefined();
      expect(result.current.getAccessToken).toBeUndefined();
    });

    test('dpopFetch, generateProof, and getAccessToken are undefined when useDpop is not set', () => {
      const { result } = renderWithWrapper(TEST_CONFIG);

      expect(result.current.dpopFetch).toBeUndefined();
      expect(result.current.generateProof).toBeUndefined();
      expect(result.current.getAccessToken).toBeUndefined();
    });

    test('getAccessToken() returns the stored access token after login', () => {
      seedDpopTokens(TEST_CONFIG.clientId, {
        accessToken: 'mock-stored-access-token',
      });

      const { result } = renderWithWrapper({ ...TEST_CONFIG, useDpop: true });

      expect(result.current.getAccessToken?.()).toBe(
        'mock-stored-access-token',
      );
    });

    test('getAccessToken() returns null when logged out', () => {
      const { result } = renderWithWrapper({ ...TEST_CONFIG, useDpop: true });

      expect(result.current.getAccessToken?.()).toBeNull();
    });

    test('isLoggedIn reflects DPoP token store state, not the app.at_exp cookie', () => {
      seedDpopTokens(TEST_CONFIG.clientId);
      // Explicitly confirm no cookie-based login signal is present.
      removeAt_expCookie();

      const { result } = renderWithWrapper({ ...TEST_CONFIG, useDpop: true });

      expect(result.current.isLoggedIn).toBe(true);
    });

    test('isLoggedIn is false in DPoP mode when no tokens are stored, even if the app.at_exp cookie is set', () => {
      mockIsLoggedIn(); // sets app.at_exp cookie — must be ignored in DPoP mode.

      const { result } = renderWithWrapper({ ...TEST_CONFIG, useDpop: true });

      expect(result.current.isLoggedIn).toBe(false);
    });

    test('isLoggedIn flips to true once the post-redirect DPoP token exchange settles', async () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
        'mock-dpop-proof-jwt',
      );
      mockWindowLocation(vi, '?code=mock-authorization-code');
      localStorage.setItem(
        'fa-sdk-redirect-value',
        JSON.stringify({ codeVerifier: 'mock-code-verifier' }),
      );
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            token_type: 'DPoP',
          }),
          { status: 200 },
        ),
      );

      const { result } = renderWithWrapper({ ...TEST_CONFIG, useDpop: true });

      expect(result.current.isLoggedIn).toBe(false);

      await waitFor(() => {
        expect(result.current.isLoggedIn).toBe(true);
      });
      expect(result.current.getAccessToken?.()).toBe('mock-access-token');
    });

    test('shouldAutoFetchUserInfo fetches userInfo once isLoggedIn flips to true after the DPoP redirect settles (not just at mount)', async () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
        'mock-dpop-proof-jwt',
      );
      mockWindowLocation(vi, '?code=mock-authorization-code');
      localStorage.setItem(
        'fa-sdk-redirect-value',
        JSON.stringify({ codeVerifier: 'mock-code-verifier' }),
      );

      // First response is the code exchange (/oauth2/token); second is the
      // subsequent /oauth2/userinfo call triggered by shouldAutoFetchUserInfo.
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              access_token: 'mock-access-token',
              refresh_token: 'mock-refresh-token',
              expires_in: 3600,
              token_type: 'DPoP',
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ email: 'user@example.com' }), {
            status: 200,
          }),
        );

      const { result } = renderWithWrapper({
        ...TEST_CONFIG,
        useDpop: true,
        shouldAutoFetchUserInfo: true,
      });

      expect(result.current.isLoggedIn).toBe(false);

      await waitFor(() => {
        expect(result.current.isLoggedIn).toBe(true);
      });

      // isLoggedIn only becomes true asynchronously, well after mount — the
      // auto-fetch must react to that transition, not just check isLoggedIn
      // once at the initial render (which would always see `false` here).
      await waitFor(() => {
        expect(result.current.userInfo).toEqual({ email: 'user@example.com' });
      });
    });
  });
});
