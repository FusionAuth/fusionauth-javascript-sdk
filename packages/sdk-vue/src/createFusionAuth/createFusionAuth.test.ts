import { vi, describe, it, expect, afterEach } from 'vitest';

import { FusionAuthConfig } from '../types';
import { createFusionAuth } from './createFusionAuth';
import {
  mockWindowLocation,
  mockIsLoggedIn,
  removeAt_expCookie,
  DPoPManager,
} from '@fusionauth-sdk/core';

const config: FusionAuthConfig = {
  clientId: '85a03867-dccf-4882-adde-1a79aeec50df',
  serverUrl: 'http://localhost:9000',
  redirectUri: 'http://localhost',
  scope: 'openid offline_access',
};

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
    const user = {
      given_name: 'JSON',
      family_name: 'Bourne',
      customTrait: 'additional info',
    };
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
    // Format: nonce:state (hosted backend mode)
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
      Error(
        JSON.stringify({
          status: 400,
          details: JSON.stringify({ msg: 'could not refresh access token' }),
        }),
      ),
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
    expectedUrl.pathname = '/app/login/';
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
    expectedUrl.pathname = '/app/register/';
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
    expectedUrl.pathname = '/app/logout/';
    expectedUrl.searchParams.set('client_id', config.clientId);
    expectedUrl.searchParams.set(
      'post_logout_redirect_uri',
      config.redirectUri,
    );

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  describe('DPoP mode', () => {
    it('dpopFetch, generateProof, and getAccessToken are functions when useDpop: true', () => {
      const fusionAuth = createFusionAuth({ ...config, useDpop: true });

      expect(typeof fusionAuth.dpopFetch).toBe('function');
      expect(typeof fusionAuth.generateProof).toBe('function');
      expect(typeof fusionAuth.getAccessToken).toBe('function');
    });

    it('dpopFetch, generateProof, and getAccessToken are undefined when useDpop is not set', () => {
      const fusionAuth = createFusionAuth(config);

      expect(fusionAuth.dpopFetch).toBeUndefined();
      expect(fusionAuth.generateProof).toBeUndefined();
      expect(fusionAuth.getAccessToken).toBeUndefined();
    });

    it('getAccessToken() returns the stored access token after login', () => {
      seedDpopTokens(config.clientId, {
        accessToken: 'mock-stored-access-token',
      });

      const fusionAuth = createFusionAuth({ ...config, useDpop: true });

      expect(fusionAuth.getAccessToken?.()).toBe('mock-stored-access-token');
    });

    it('getAccessToken() returns null when logged out', () => {
      const fusionAuth = createFusionAuth({ ...config, useDpop: true });

      expect(fusionAuth.getAccessToken?.()).toBeNull();
    });

    it('refreshToken() re-syncs isLoggedIn after a successful DPoP refresh', async () => {
      seedDpopTokens(config.clientId, {
        expiresAt: Date.now() - 1000, // already expired
      });
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
        'mock-dpop-proof-jwt',
      );
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600,
            token_type: 'DPoP',
          }),
          { status: 200 },
        ),
      );

      const fusionAuth = createFusionAuth({ ...config, useDpop: true });

      expect(fusionAuth.isLoggedIn.value).toBe(false);

      await fusionAuth.refreshToken();

      expect(fusionAuth.isLoggedIn.value).toBe(true);
      expect(fusionAuth.getAccessToken?.()).toBe('new-access-token');
    });

    it('isLoggedIn flips to true once the post-redirect DPoP token exchange settles', async () => {
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

      const fusionAuth = createFusionAuth({ ...config, useDpop: true });

      expect(fusionAuth.isLoggedIn.value).toBe(false);

      await vi.waitFor(() => {
        expect(fusionAuth.isLoggedIn.value).toBe(true);
      });
      expect(fusionAuth.getAccessToken?.()).toBe('mock-access-token');
    });

    it('onRedirect is invoked after isLoggedIn is already true, so a handler that navigates based on isLoggedIn.value (e.g. a router guard) sees the up-to-date value', async () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
        'mock-dpop-proof-jwt',
      );
      mockWindowLocation(
        vi,
        '?code=mock-authorization-code&state=redirect-state',
      );
      localStorage.setItem(
        'fa-sdk-redirect-value',
        JSON.stringify({
          codeVerifier: 'mock-code-verifier',
          state: 'redirect-state',
        }),
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

      let isLoggedInDuringOnRedirect: boolean | undefined;
      const onRedirect = vi.fn((state?: string) => {
        isLoggedInDuringOnRedirect = fusionAuth.isLoggedIn.value;
        expect(state).toBe('redirect-state');
      });

      const fusionAuth = createFusionAuth({
        ...config,
        useDpop: true,
        onRedirect,
      });

      await vi.waitFor(() => expect(onRedirect).toHaveBeenCalledOnce());

      expect(isLoggedInDuringOnRedirect).toBe(true);
    });

    it('shouldAutoFetchUserInfo fetches userInfo once isLoggedIn flips to true after the DPoP redirect settles (not just at construction)', async () => {
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

      const fusionAuth = createFusionAuth({
        ...config,
        useDpop: true,
        shouldAutoFetchUserInfo: true,
      });

      expect(fusionAuth.isLoggedIn.value).toBe(false);

      await vi.waitFor(() => {
        expect(fusionAuth.isLoggedIn.value).toBe(true);
      });

      // userInfo only becomes available asynchronously, well after
      // construction — it is not fetched until the DPoP redirect settles.
      await vi.waitFor(() => {
        expect(fusionAuth.userInfo.value).toEqual({
          email: 'user@example.com',
        });
      });
    });
  });
});
