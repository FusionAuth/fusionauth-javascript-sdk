// @vitest-environment jsdom
// SDKCore uses document.cookie (via CookieHelpers), window.location.assign,
// and localStorage — all browser-only globals that jsdom provides.
// This annotation is explicit so that importing DPoPManager (which has its own
// @vitest-environment node override) does not cause vitest to run this file in
// the node environment when the full test suite is executed together.
import { afterEach, describe, it, expect, vi } from 'vitest';

import { SDKConfig } from '../SDKConfig';
import { SDKCore } from '.';
import { RedirectHelper } from '../RedirectHelper';
import { DPoPManager } from '../DPoP';
import * as Pkce from '../Pkce';

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

  it('`stopAutoRefresh` cancels a pending refresh without disposing the core', () => {
    vi.useFakeTimers();
    mockIsLoggedIn(); // expires in 1 hour

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 }),
    );
    vi.spyOn(SDKCore.prototype, 'refreshToken');

    const core = new SDKCore({
      ...config,
      shouldAutoRefresh: true,
      autoRefreshSecondsBeforeExpiry: 60, // refresh 60s before expiry (at 59 min)
    });

    core.initAutoRefresh();
    core.stopAutoRefresh();

    // Advance past the refresh point but before expiry; the cancelled timer
    // must not fire and the user is still logged in.
    vi.advanceTimersByTime(59 * 60 * 1000 + 30 * 1000); // 59.5 minutes
    expect(core.refreshToken).not.toHaveBeenCalled();

    // Core is not disposed, so auto refresh can be restarted.
    core.initAutoRefresh();
    vi.advanceTimersByTime(1000);
    expect(core.refreshToken).toHaveBeenCalledTimes(1);
  });

  it('`initAutoRefresh` is idempotent and does not leave duplicate timers', () => {
    vi.useFakeTimers();
    mockIsLoggedIn();

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 }),
    );
    vi.spyOn(SDKCore.prototype, 'refreshToken');

    const core = new SDKCore({
      ...config,
      shouldAutoRefresh: true,
      autoRefreshSecondsBeforeExpiry: 60,
    });

    // Calling repeatedly (e.g. an effect re-running) should not stack timers.
    core.initAutoRefresh();
    core.initAutoRefresh();
    core.initAutoRefresh();

    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(core.refreshToken).toHaveBeenCalledTimes(1);
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

  describe('DPoP mode', () => {
    const MOCK_JKT = 'mock-dpop-jkt-thumbprint';
    const MOCK_VERIFIER = 'mock-code-verifier-43-chars-xxxxxxxxxxxxxxxx';
    const MOCK_CHALLENGE = 'mock-code-challenge-43-chars-xxxxxxxxxxxx';

    const dpopConfig: SDKConfig = {
      ...config,
      useDpop: true,
      serverUrl: 'http://my-fusionauth-server',
    };

    it('startLogin() in DPoP mode redirects to /oauth2/authorize with dpop_jkt and code_challenge', async () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      vi.spyOn(DPoPManager.prototype, 'getThumbprint').mockResolvedValue(
        MOCK_JKT,
      );
      vi.spyOn(Pkce, 'generateCodeVerifier').mockReturnValue(MOCK_VERIFIER);
      vi.spyOn(Pkce, 'generateCodeChallenge').mockResolvedValue(MOCK_CHALLENGE);
      const location = mockWindowLocation(vi);

      const core = new SDKCore(dpopConfig);
      core.startLogin();
      await vi.waitFor(() => expect(location.assign).toHaveBeenCalledOnce());

      const assignedUrl = new URL(
        (location.assign as ReturnType<typeof vi.fn>).mock.calls[0][0],
      );
      expect(assignedUrl.pathname).toBe('/oauth2/authorize');
      expect(assignedUrl.searchParams.get('dpop_jkt')).toBe(MOCK_JKT);
      expect(assignedUrl.searchParams.get('code_challenge')).toBe(
        MOCK_CHALLENGE,
      );
      expect(assignedUrl.searchParams.get('code_challenge_method')).toBe(
        'S256',
      );
      expect(assignedUrl.searchParams.get('response_type')).toBe('code');
    });

    it('startLogin() in DPoP mode persists code_verifier via RedirectHelper', async () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      vi.spyOn(DPoPManager.prototype, 'getThumbprint').mockResolvedValue(
        MOCK_JKT,
      );
      vi.spyOn(Pkce, 'generateCodeVerifier').mockReturnValue(MOCK_VERIFIER);
      vi.spyOn(Pkce, 'generateCodeChallenge').mockResolvedValue(MOCK_CHALLENGE);
      const location = mockWindowLocation(vi);

      const core = new SDKCore(dpopConfig);
      core.startLogin();
      await vi.waitFor(() => expect(location.assign).toHaveBeenCalledOnce());

      const redirectHelper = new RedirectHelper();
      expect(redirectHelper.getCodeVerifier()).toBe(MOCK_VERIFIER);
    });

    it('startLogin() in DPoP mode includes state in the authorize URL', async () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      vi.spyOn(DPoPManager.prototype, 'getThumbprint').mockResolvedValue(
        MOCK_JKT,
      );
      vi.spyOn(Pkce, 'generateCodeVerifier').mockReturnValue(MOCK_VERIFIER);
      vi.spyOn(Pkce, 'generateCodeChallenge').mockResolvedValue(MOCK_CHALLENGE);
      const location = mockWindowLocation(vi);

      const core = new SDKCore(dpopConfig);
      core.startLogin('my-state');
      await vi.waitFor(() => expect(location.assign).toHaveBeenCalledOnce());

      const assignedUrl = new URL(
        (location.assign as ReturnType<typeof vi.fn>).mock.calls[0][0],
      );
      expect(assignedUrl.searchParams.get('state')).toBe('my-state');
    });

    it('reports a DPoP startLogin() failure via onLoginFailure instead of an unhandled rejection', async () => {
      const failure = new Error('crypto.subtle unavailable');
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockRejectedValue(
        failure,
      );
      mockWindowLocation(vi);

      const onLoginFailure = vi.fn();
      const core = new SDKCore({ ...dpopConfig, onLoginFailure });

      core.startLogin();
      await vi.waitFor(() => expect(onLoginFailure).toHaveBeenCalledOnce());

      expect(onLoginFailure).toHaveBeenCalledWith(failure);
    });

    it('falls back to console.error when a DPoP startLogin() failure occurs and onLoginFailure is not configured', async () => {
      const failure = new Error('IndexedDB blocked');
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockRejectedValue(
        failure,
      );
      mockWindowLocation(vi);
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const core = new SDKCore(dpopConfig); // no onLoginFailure configured
      core.startLogin();
      await vi.waitFor(() =>
        expect(consoleError).toHaveBeenCalledWith(
          'FusionAuth SDK: startLogin failed',
          failure,
        ),
      );
    });

    it('startLogout() in DPoP mode clears DPoPManager state and redirects to /oauth2/logout directly', async () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      const clearSpy = vi
        .spyOn(DPoPManager.prototype, 'clear')
        .mockResolvedValue(undefined);
      const location = mockWindowLocation(vi);

      const core = new SDKCore(dpopConfig);
      core.startLogout();
      await vi.waitFor(() => expect(location.assign).toHaveBeenCalledOnce());

      expect(clearSpy).toHaveBeenCalledOnce();

      const assignedUrl = new URL(
        String((location.assign as ReturnType<typeof vi.fn>).mock.calls[0][0]),
      );
      // DPoP mode has no hosted backend to proxy through — target
      // FusionAuth's /oauth2/logout directly instead of /app/logout/.
      expect(assignedUrl.pathname).toBe('/oauth2/logout');
      expect(assignedUrl.searchParams.get('client_id')).toBe(
        dpopConfig.clientId,
      );
    });

    it('startLogout() in DPoP mode still redirects even if DPoPManager.clear() fails', async () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      vi.spyOn(DPoPManager.prototype, 'clear').mockRejectedValue(
        new Error('clear() failed'),
      );
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const location = mockWindowLocation(vi);

      const core = new SDKCore(dpopConfig);
      core.startLogout();
      await vi.waitFor(() => expect(location.assign).toHaveBeenCalledOnce());

      const assignedUrl = new URL(
        String((location.assign as ReturnType<typeof vi.fn>).mock.calls[0][0]),
      );
      expect(assignedUrl.pathname).toBe('/oauth2/logout');
    });

    it('getAccessToken() returns the stored access token when useDpop: true', () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      const core = new SDKCore(dpopConfig);

      const dpopManager = (core as any).dpopManager as DPoPManager;
      dpopManager.setTokens({
        accessToken: 'mock-access-token',
        refreshToken: undefined,
        expiresAt: Date.now() + 60_000,
        tokenType: 'DPoP',
      });

      expect(core.getAccessToken()).toBe('mock-access-token');
    });

    it('getAccessToken() returns null when logged out in DPoP mode', () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      const core = new SDKCore(dpopConfig);

      expect(core.getAccessToken()).toBeNull();
    });

    it('getAccessToken() throws when useDpop: false', () => {
      const core = new SDKCore(config); // no useDpop

      expect(() => core.getAccessToken()).toThrow(
        'getAccessToken() is only available in DPoP mode. In hosted backend mode, tokens are stored in HttpOnly cookies and are not accessible to JavaScript.',
      );
    });

    it('dpopFetch() delegates to DPoPManager.fetch() when useDpop: true', async () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      const mockResponse = new Response(null, { status: 200 });
      const fetchSpy = vi
        .spyOn(DPoPManager.prototype, 'fetch')
        .mockResolvedValue(mockResponse);

      const core = new SDKCore(dpopConfig);
      const init = { method: 'GET' };
      const response = await core.dpopFetch(
        'https://api.example.com/data',
        init,
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.example.com/data',
        init,
      );
      expect(response).toBe(mockResponse);
    });

    it('dpopFetch() throws when useDpop: false', async () => {
      const core = new SDKCore(config); // no useDpop

      await expect(
        core.dpopFetch('https://api.example.com/data'),
      ).rejects.toThrow(
        'dpopFetch() is only available in DPoP mode. In cookie mode, use fetch() with credentials: "include" instead.',
      );
    });

    it('generateProof() delegates to DPoPManager.generateProof() when useDpop: true', async () => {
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      const generateProofSpy = vi
        .spyOn(DPoPManager.prototype, 'generateProof')
        .mockResolvedValue('mock-dpop-proof-jwt');

      const core = new SDKCore(dpopConfig);
      const proof = await core.generateProof(
        'https://api.example.com/data',
        'POST',
        'mock-access-token',
        'mock-nonce',
      );

      expect(generateProofSpy).toHaveBeenCalledWith(
        'https://api.example.com/data',
        'POST',
        'mock-access-token',
        'mock-nonce',
      );
      expect(proof).toBe('mock-dpop-proof-jwt');
    });

    it('generateProof() throws when useDpop: false', async () => {
      const core = new SDKCore(config); // no useDpop

      await expect(
        core.generateProof('https://api.example.com/data', 'POST'),
      ).rejects.toThrow(
        'generateProof() is only available in DPoP mode. In cookie mode, tokens are stored in HttpOnly cookies and DPoP proofs are not applicable.',
      );
    });

    describe('fetchUserInfo() in DPoP mode', () => {
      function seedAccessToken(
        core: SDKCore,
        accessToken = 'mock-access-token',
      ) {
        const dpopManager = (core as any).dpopManager as DPoPManager;
        dpopManager.setTokens({
          accessToken,
          refreshToken: undefined,
          expiresAt: Date.now() + 60_000,
          tokenType: 'DPoP',
        });
      }

      it('calls DPoPManager.fetch() targeting /oauth2/userinfo and returns the claims', async () => {
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        const core = new SDKCore(dpopConfig);
        seedAccessToken(core);

        const userInfoClaims = { sub: 'mock-sub', email: 'user@example.com' };
        const fetchSpy = vi
          .spyOn(DPoPManager.prototype, 'fetch')
          .mockResolvedValue(
            new Response(JSON.stringify(userInfoClaims), { status: 200 }),
          );

        const userInfo = await core.fetchUserInfo();

        expect(fetchSpy).toHaveBeenCalledOnce();
        const requestedUrl = fetchSpy.mock.calls[0]?.[0];
        expect(new URL(String(requestedUrl)).pathname).toBe('/oauth2/userinfo');
        expect(userInfo).toEqual(userInfoClaims);
      });

      it('throws a descriptive error when no access token is stored', async () => {
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        const core = new SDKCore(dpopConfig); // no tokens stored — never logged in
        const fetchSpy = vi.spyOn(DPoPManager.prototype, 'fetch');

        await expect(core.fetchUserInfo()).rejects.toThrow(
          'No access token available. Have you called startLogin()?',
        );
        expect(fetchSpy).not.toHaveBeenCalled();
      });

      it('throws on a non-OK response', async () => {
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        const core = new SDKCore(dpopConfig);
        seedAccessToken(core);

        vi.spyOn(DPoPManager.prototype, 'fetch').mockResolvedValue(
          new Response(null, { status: 401 }),
        );

        await expect(core.fetchUserInfo()).rejects.toThrow(
          'Unable to fetch userInfo in fusionauth. Request failed with status code 401',
        );
      });

      it('cookie-mode fetchUserInfo() is unaffected', async () => {
        vi.spyOn(window, 'fetch').mockResolvedValue(
          new Response(JSON.stringify({ sub: 'mock-sub' }), { status: 200 }),
        );

        const core = new SDKCore(config); // no useDpop
        const userInfo = await core.fetchUserInfo();

        expect(userInfo).toEqual({ sub: 'mock-sub' });
        expect(window.fetch).toHaveBeenCalledWith(
          expect.objectContaining({ pathname: '/app/me/' }),
          { credentials: 'include' },
        );
      });
    });

    describe('handlePostRedirect() in DPoP mode', () => {
      const MOCK_PROOF = 'mock-dpop-proof-jwt';
      const MOCK_CODE = 'mock-authorization-code';
      const MOCK_ACCESS_TOKEN = 'mock-access-token';
      const MOCK_REFRESH_TOKEN = 'mock-refresh-token';
      const EXPIRES_IN_SECONDS = 3600;

      /** Mocks the DPoP key-pair/PKCE steps so `startLogin()` runs without WebCrypto. */
      function mockDpopLoginDependencies() {
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        vi.spyOn(DPoPManager.prototype, 'getThumbprint').mockResolvedValue(
          MOCK_JKT,
        );
        vi.spyOn(Pkce, 'generateCodeVerifier').mockReturnValue(MOCK_VERIFIER);
        vi.spyOn(Pkce, 'generateCodeChallenge').mockResolvedValue(
          MOCK_CHALLENGE,
        );
      }

      function mockTokenResponse(
        overrides: Partial<{
          access_token: string;
          refresh_token?: string;
          expires_in: number;
          token_type: string;
        }> = {},
      ) {
        return vi.spyOn(window, 'fetch').mockResolvedValue(
          new Response(
            JSON.stringify({
              access_token: MOCK_ACCESS_TOKEN,
              refresh_token: MOCK_REFRESH_TOKEN,
              expires_in: EXPIRES_IN_SECONDS,
              token_type: 'DPoP',
              ...overrides,
            }),
            { status: 200 },
          ),
        );
      }

      /**
       * Runs `startLogin()` (with DPoP dependencies mocked) to legitimately
       * persist a `code_verifier` via `RedirectHelper`, then simulates landing
       * back on the redirect URI with `?code=...` in the query string.
       */
      async function primePendingRedirect(core: SDKCore) {
        const location = mockWindowLocation(vi);
        core.startLogin();
        await vi.waitFor(() => expect(location.assign).toHaveBeenCalledOnce());
        location.search = `?code=${MOCK_CODE}`;
        return location;
      }

      it('does nothing when there is no code query param', async () => {
        mockWindowLocation(vi); // default search — no code
        const fetchMock = vi.spyOn(window, 'fetch');
        const core = new SDKCore(dpopConfig);
        const onRedirect = vi.fn();

        core.handlePostRedirect(onRedirect);
        await Promise.resolve();

        expect(fetchMock).not.toHaveBeenCalled();
        expect(onRedirect).not.toHaveBeenCalled();
      });

      it('does nothing when code is present but no code_verifier was persisted', async () => {
        mockWindowLocation(vi, `?code=${MOCK_CODE}`);
        const fetchMock = vi.spyOn(window, 'fetch');
        const core = new SDKCore(dpopConfig);
        const onRedirect = vi.fn();

        core.handlePostRedirect(onRedirect);
        await Promise.resolve();

        expect(fetchMock).not.toHaveBeenCalled();
        expect(onRedirect).not.toHaveBeenCalled();
      });

      it('exchanges the code with a DPoP header and stores tokens', async () => {
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );

        const core = new SDKCore(dpopConfig);
        await primePendingRedirect(core);
        const fetchMock = mockTokenResponse();

        const onRedirect = vi.fn();
        core.handlePostRedirect(onRedirect);
        await vi.waitFor(() => expect(onRedirect).toHaveBeenCalledOnce());

        expect(fetchMock).toHaveBeenCalledOnce();
        const call = fetchMock.mock.calls[0];
        if (!call) throw new Error('fetch was not called');
        const [url, init] = call;
        expect(new URL(url.toString()).pathname).toBe('/oauth2/token');
        expect(init?.method).toBe('POST');

        const headers = init?.headers as Record<string, string>;
        expect(headers['DPoP']).toBe(MOCK_PROOF);
        expect(headers['Content-Type']).toBe(
          'application/x-www-form-urlencoded',
        );

        const body = new URLSearchParams(init?.body as string);
        expect(body.get('grant_type')).toBe('authorization_code');
        expect(body.get('code')).toBe(MOCK_CODE);
        expect(body.get('code_verifier')).toBe(MOCK_VERIFIER);
        expect(body.get('client_id')).toBe(dpopConfig.clientId);
        expect(body.get('redirect_uri')).toBe(dpopConfig.redirectUri);

        expect(DPoPManager.prototype.generateProof).toHaveBeenCalledWith(
          expect.stringContaining('/oauth2/token'),
          'POST',
        );

        expect(core.isLoggedIn).toBe(true);
      });

      it('does not exchange the code twice when called concurrently (e.g. React StrictMode double-invoke)', async () => {
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );

        const core = new SDKCore(dpopConfig);
        await primePendingRedirect(core);
        const fetchMock = mockTokenResponse();

        const first = core.handlePostRedirect();
        const second = core.handlePostRedirect();

        expect(second).toBe(first);

        await Promise.all([first, second]);

        expect(fetchMock).toHaveBeenCalledOnce();
      });

      it('returns a promise that resolves once the token exchange settles, reflecting the isLoggedIn transition', async () => {
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );

        const core = new SDKCore(dpopConfig);
        await primePendingRedirect(core);
        mockTokenResponse();

        expect(core.isLoggedIn).toBe(false);

        await core.handlePostRedirect();

        expect(core.isLoggedIn).toBe(true);
      });

      it('returns a resolved (never rejected) promise even when the exchange fails', async () => {
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        vi.spyOn(console, 'error').mockImplementation(() => {});

        const core = new SDKCore(dpopConfig);
        await primePendingRedirect(core);
        vi.spyOn(window, 'fetch').mockResolvedValue(
          new Response('boom', { status: 500 }),
        );

        await expect(core.handlePostRedirect()).resolves.toBeUndefined();
        expect(core.isLoggedIn).toBe(false);
      });

      it('invokes the callback with the state persisted by startLogin() and cleans up the redirect marker', async () => {
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );

        const core = new SDKCore(dpopConfig);
        const location = mockWindowLocation(vi);
        core.startLogin('my-post-redirect-state');
        await vi.waitFor(() => expect(location.assign).toHaveBeenCalledOnce());
        location.search = `?code=${MOCK_CODE}`;
        mockTokenResponse();

        const redirectIndicator = () =>
          localStorage.getItem('fa-sdk-redirect-value');
        expect(redirectIndicator()).not.toBeNull();

        const onRedirect = vi.fn();
        core.handlePostRedirect(onRedirect);
        await vi.waitFor(() => expect(onRedirect).toHaveBeenCalledOnce());

        expect(onRedirect).toHaveBeenCalledWith('my-post-redirect-state');
        expect(redirectIndicator()).toBeNull();
      });

      it('strips code from the URL via history.replaceState() after a successful exchange', async () => {
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        const replaceState = vi.spyOn(window.history, 'replaceState');

        const core = new SDKCore(dpopConfig);
        const location = mockWindowLocation(vi);
        core.startLogin('my-post-redirect-state');
        await vi.waitFor(() => expect(location.assign).toHaveBeenCalledOnce());
        location.search = `?code=${MOCK_CODE}&state=my-post-redirect-state`;
        mockTokenResponse();

        core.handlePostRedirect();
        await vi.waitFor(() => expect(core.isLoggedIn).toBe(true));

        expect(replaceState).toHaveBeenCalledOnce();
        const [, , url] = replaceState.mock.calls[0];
        const cleanedUrl = new URL(url as string);
        expect(cleanedUrl.searchParams.get('code')).toBeNull();
      });

      it('schedules token expiration from expires_in', async () => {
        vi.useFakeTimers();
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );

        const onTokenExpiration = vi.fn();
        const core = new SDKCore({ ...dpopConfig, onTokenExpiration });
        await primePendingRedirect(core);
        mockTokenResponse();

        core.handlePostRedirect();
        await vi.waitFor(() => expect(core.isLoggedIn).toBe(true));

        vi.advanceTimersByTime(EXPIRES_IN_SECONDS * 1000 - 1000);
        expect(onTokenExpiration).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1000);
        expect(onTokenExpiration).toHaveBeenCalledTimes(1);
      });

      it('schedules auto-refresh from expires_in when shouldAutoRefresh is true', async () => {
        vi.useFakeTimers();
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        const refreshToken = vi
          .spyOn(SDKCore.prototype, 'refreshToken')
          .mockResolvedValue(new Response(null, { status: 200 }));

        const core = new SDKCore({
          ...dpopConfig,
          shouldAutoRefresh: true,
          autoRefreshSecondsBeforeExpiry: 60,
        });
        await primePendingRedirect(core);
        mockTokenResponse();

        core.handlePostRedirect();
        await vi.waitFor(() => expect(core.isLoggedIn).toBe(true));

        // Refresh fires 60s before the 3600s expiry, i.e. at 3540s.
        vi.advanceTimersByTime((EXPIRES_IN_SECONDS - 60) * 1000 - 1000);
        expect(refreshToken).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1000);
        expect(refreshToken).toHaveBeenCalledTimes(1);
      });

      it('does not schedule auto-refresh when shouldAutoRefresh is not set', async () => {
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        const refreshToken = vi.spyOn(SDKCore.prototype, 'refreshToken');

        const core = new SDKCore(dpopConfig); // shouldAutoRefresh defaults to false
        await primePendingRedirect(core);
        mockTokenResponse();

        const onRedirect = vi.fn();
        core.handlePostRedirect(onRedirect);
        await vi.waitFor(() => expect(onRedirect).toHaveBeenCalledOnce());

        expect(refreshToken).not.toHaveBeenCalled();
      });

      it('reports an exchange failure via onLoginFailure', async () => {
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );

        const onLoginFailure = vi.fn();
        const core = new SDKCore({ ...dpopConfig, onLoginFailure });
        await primePendingRedirect(core);
        vi.spyOn(window, 'fetch').mockResolvedValue(
          new Response('invalid_grant', { status: 400 }),
        );

        core.handlePostRedirect();
        await vi.waitFor(() => expect(onLoginFailure).toHaveBeenCalledOnce());

        expect(core.isLoggedIn).toBe(false);
      });

      it('falls back to console.error when an exchange failure occurs and onLoginFailure is not configured', async () => {
        mockDpopLoginDependencies();
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});

        const core = new SDKCore(dpopConfig); // no onLoginFailure configured
        await primePendingRedirect(core);
        vi.spyOn(window, 'fetch').mockResolvedValue(
          new Response('invalid_grant', { status: 400 }),
        );

        core.handlePostRedirect();
        await vi.waitFor(() =>
          expect(consoleError).toHaveBeenCalledWith(
            'FusionAuth SDK: handlePostRedirect failed',
            expect.any(Error),
          ),
        );
      });
    });

    describe('refreshToken() in DPoP mode', () => {
      const MOCK_PROOF = 'mock-dpop-refresh-proof-jwt';
      const MOCK_OLD_REFRESH_TOKEN = 'mock-old-refresh-token';
      const MOCK_NEW_ACCESS_TOKEN = 'mock-new-access-token';
      const MOCK_NEW_REFRESH_TOKEN = 'mock-new-refresh-token';
      const EXPIRES_IN_SECONDS = 3600;

      function seedExistingTokens(core: SDKCore) {
        const dpopManager = (core as any).dpopManager as DPoPManager;
        dpopManager.setTokens({
          accessToken: 'mock-old-access-token',
          refreshToken: MOCK_OLD_REFRESH_TOKEN,
          expiresAt: Date.now() + 60_000,
          tokenType: 'DPoP',
        });
      }

      function mockTokenResponse(
        overrides: Partial<{
          access_token: string;
          refresh_token?: string;
          expires_in: number;
          token_type: string;
        }> = {},
      ) {
        // Use mockImplementation (not mockResolvedValue) so every fetch()
        // call gets its own fresh Response instance — refreshToken() may be
        // invoked multiple times within a single test (e.g. an explicit
        // call followed by an auto-refresh timer firing), and a shared
        // Response instance would throw "body already used" once its body
        // has been read by an earlier call.
        return vi.spyOn(window, 'fetch').mockImplementation(() =>
          Promise.resolve(
            new Response(
              JSON.stringify({
                access_token: MOCK_NEW_ACCESS_TOKEN,
                refresh_token: MOCK_NEW_REFRESH_TOKEN,
                expires_in: EXPIRES_IN_SECONDS,
                token_type: 'DPoP',
                ...overrides,
              }),
              { status: 200 },
            ),
          ),
        );
      }

      it('sends a DPoP header and refresh_token grant body to /oauth2/token', async () => {
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        const core = new SDKCore(dpopConfig);
        seedExistingTokens(core);
        const fetchMock = mockTokenResponse();

        await core.refreshToken();

        expect(fetchMock).toHaveBeenCalledOnce();
        const call = fetchMock.mock.calls[0];
        if (!call) throw new Error('fetch was not called');
        const [url, init] = call;
        expect(new URL(url.toString()).pathname).toBe('/oauth2/token');
        expect(init?.method).toBe('POST');

        const headers = init?.headers as Record<string, string>;
        expect(headers['DPoP']).toBe(MOCK_PROOF);
        expect(headers['Content-Type']).toBe(
          'application/x-www-form-urlencoded',
        );

        const body = new URLSearchParams(init?.body as string);
        expect(body.get('grant_type')).toBe('refresh_token');
        expect(body.get('refresh_token')).toBe(MOCK_OLD_REFRESH_TOKEN);
        expect(body.get('client_id')).toBe(dpopConfig.clientId);

        expect(DPoPManager.prototype.generateProof).toHaveBeenCalledWith(
          expect.stringContaining('/oauth2/token'),
          'POST',
        );
      });

      it('updates stored tokens on success and isLoggedIn remains true', async () => {
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        const core = new SDKCore(dpopConfig);
        seedExistingTokens(core);
        mockTokenResponse();

        expect(core.isLoggedIn).toBe(true);

        await core.refreshToken();

        expect(core.isLoggedIn).toBe(true);
        expect(core.getAccessToken()).toBe(MOCK_NEW_ACCESS_TOKEN);
      });

      it('reschedules token expiration from the new expiresAt', async () => {
        vi.useFakeTimers();
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        const onTokenExpiration = vi.fn();
        const core = new SDKCore({ ...dpopConfig, onTokenExpiration });
        seedExistingTokens(core);
        mockTokenResponse();

        await core.refreshToken();

        vi.advanceTimersByTime(EXPIRES_IN_SECONDS * 1000 - 1000);
        expect(onTokenExpiration).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1000);
        expect(onTokenExpiration).toHaveBeenCalledTimes(1);
      });

      it('reschedules auto-refresh from the new expiresAt when shouldAutoRefresh is true', async () => {
        vi.useFakeTimers();
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        const core = new SDKCore({
          ...dpopConfig,
          shouldAutoRefresh: true,
          autoRefreshSecondsBeforeExpiry: 60,
        });
        seedExistingTokens(core);
        mockTokenResponse();

        const refreshTokenSpy = vi.spyOn(SDKCore.prototype, 'refreshToken');

        await core.refreshToken();
        expect(refreshTokenSpy).toHaveBeenCalledTimes(1);

        // Auto-refresh fires 60s before the 3600s expiry
        vi.advanceTimersByTime((EXPIRES_IN_SECONDS - 60) * 1000 - 1000);
        expect(refreshTokenSpy).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1000);
        expect(refreshTokenSpy).toHaveBeenCalledTimes(2); // + the auto-refresh firing
      });

      it('does not reschedule auto-refresh when shouldAutoRefresh is not set', async () => {
        vi.useFakeTimers();
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        const core = new SDKCore(dpopConfig); // shouldAutoRefresh defaults to false
        seedExistingTokens(core);
        mockTokenResponse();

        const refreshTokenSpy = vi.spyOn(SDKCore.prototype, 'refreshToken');

        await core.refreshToken();

        vi.advanceTimersByTime(EXPIRES_IN_SECONDS * 1000);
        expect(refreshTokenSpy).toHaveBeenCalledTimes(1);
      });

      it('throws a descriptive error when no refresh token is stored', async () => {
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        const fetchMock = vi.spyOn(window, 'fetch');
        const core = new SDKCore(dpopConfig); // no tokens stored — never logged in

        await expect(core.refreshToken()).rejects.toThrow(
          'No refresh token available. Have you called startLogin()?',
        );
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it('preserves the existing refresh token when the response omits refresh_token (no rotation)', async () => {
        vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
          {} as any,
        );
        vi.spyOn(DPoPManager.prototype, 'generateProof').mockResolvedValue(
          MOCK_PROOF,
        );
        const core = new SDKCore(dpopConfig);
        seedExistingTokens(core);
        // FusionAuth may not rotate the refresh token on every refresh —
        // simulate a response with no refresh_token field.
        mockTokenResponse({ refresh_token: undefined });

        await core.refreshToken();

        expect(core.getAccessToken()).toBe(MOCK_NEW_ACCESS_TOKEN);

        // A subsequent refresh must still succeed using the *original*
        // refresh token — proving it wasn't cleared out by the first
        // refresh's response.
        const fetchMock = mockTokenResponse();
        await core.refreshToken();

        const call = fetchMock.mock.calls[0];
        if (!call) throw new Error('fetch was not called');
        const [, init] = call;
        const body = new URLSearchParams(init?.body as string);
        expect(body.get('refresh_token')).toBe(MOCK_OLD_REFRESH_TOKEN);
      });
    });
  });
});
