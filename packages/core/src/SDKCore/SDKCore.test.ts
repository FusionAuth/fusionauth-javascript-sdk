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

    // startLogin is synchronous in cookie mode — side-effects
    // (handlePreRedirect, window.location.assign) fire immediately.
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

  // ---------------------------------------------------------------------------
  // DPoP mode
  //
  // DPoPManager methods and Pkce functions are mocked here because jsdom's
  // crypto implementation lacks `crypto.subtle`, which is required for both
  // DPoP key-pair generation and PKCE SHA-256 challenge derivation. The
  // per-module unit tests (DPoPManager.test.ts, Pkce.test.ts) run under
  // @vitest-environment node where real WebCrypto is available and verify the
  // cryptographic correctness of those operations.
  // ---------------------------------------------------------------------------

  describe('DPoP mode', () => {
    const MOCK_JKT = 'mock-dpop-jkt-thumbprint';
    const MOCK_VERIFIER = 'mock-code-verifier-43-chars-xxxxxxxxxxxxxxxx';
    const MOCK_CHALLENGE = 'mock-code-challenge-43-chars-xxxxxxxxxxxx';

    const dpopConfig: SDKConfig = {
      ...config,
      useDpop: true,
      serverUrl: 'http://my-fusionauth-server',
    };

    it('constructs a DPoPManager when useDpop is true', () => {
      // The constructor call itself is the assertion: if it throws, the test
      // fails. We also verify the DPoP-mode isLoggedIn path is used (not cookie).
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );
      vi.spyOn(DPoPManager.prototype, 'getThumbprint').mockResolvedValue(
        MOCK_JKT,
      );
      vi.spyOn(Pkce, 'generateCodeVerifier').mockReturnValue(MOCK_VERIFIER);
      vi.spyOn(Pkce, 'generateCodeChallenge').mockResolvedValue(MOCK_CHALLENGE);

      // DPoPManager.isLoggedIn returns false by default (no tokens stored).
      const core = new SDKCore(dpopConfig);
      expect(core.isLoggedIn).toBe(false);
    });

    it('does not construct a DPoPManager when useDpop is false (default)', () => {
      // isLoggedIn should fall back to cookie path (no tokens, no cookie → false)
      const core = new SDKCore(config);
      expect(core.isLoggedIn).toBe(false);
    });

    it('isLoggedIn reads from DPoPTokenStore (not app.at_exp cookie) in DPoP mode', () => {
      // Cookie is present but DPoP mode should NOT consult it.
      mockIsLoggedIn(); // sets app.at_exp cookie → cookie-mode isLoggedIn = true
      vi.spyOn(DPoPManager.prototype, 'getOrCreateKeyPair').mockResolvedValue(
        {} as any,
      );

      const core = new SDKCore(dpopConfig);

      // DPoP tokens are not stored, so isLoggedIn is false even though the
      // app.at_exp cookie says the user is logged in.
      expect(core.isLoggedIn).toBe(false);
    });

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
      // startLogin() is synchronous (void) — the DPoP chain runs async
      // internally. Wait for the redirect to happen before asserting.
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

    it('startLogin() in DPoP mode calls getOrCreateKeyPair and getThumbprint', async () => {
      const getOrCreateKeyPair = vi
        .spyOn(DPoPManager.prototype, 'getOrCreateKeyPair')
        .mockResolvedValue({} as any);
      const getThumbprint = vi
        .spyOn(DPoPManager.prototype, 'getThumbprint')
        .mockResolvedValue(MOCK_JKT);
      vi.spyOn(Pkce, 'generateCodeVerifier').mockReturnValue(MOCK_VERIFIER);
      vi.spyOn(Pkce, 'generateCodeChallenge').mockResolvedValue(MOCK_CHALLENGE);
      const location = mockWindowLocation(vi);

      const core = new SDKCore(dpopConfig);
      core.startLogin();
      await vi.waitFor(() => expect(location.assign).toHaveBeenCalledOnce());

      expect(getOrCreateKeyPair).toHaveBeenCalledOnce();
      expect(getThumbprint).toHaveBeenCalledOnce();
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

    it('startLogin() in cookie mode is unaffected by useDpop: false', () => {
      const location = mockWindowLocation(vi);
      const core = new SDKCore(config); // no useDpop

      // Cookie mode is fully synchronous — no waiting required.
      core.startLogin('some-state');

      expect(location.assign).toHaveBeenCalledOnce();
      const assignedUrl = new URL(
        (location.assign as ReturnType<typeof vi.fn>).mock.calls[0][0],
      );
      // Cookie mode uses the app server login path, not /oauth2/authorize.
      expect(assignedUrl.pathname).not.toBe('/oauth2/authorize');
      expect(assignedUrl.searchParams.get('dpop_jkt')).toBeNull();
      expect(assignedUrl.searchParams.get('code_challenge')).toBeNull();
    });

    // -------------------------------------------------------------------------
    // handlePostRedirect() — authorization code exchange (ENG-4800)
    // -------------------------------------------------------------------------

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

        // generateProof() is called for the token endpoint with no access
        // token (no `ath`) — this is a token endpoint request, not a
        // resource server request.
        expect(DPoPManager.prototype.generateProof).toHaveBeenCalledWith(
          expect.stringContaining('/oauth2/token'),
          'POST',
        );

        expect(core.isLoggedIn).toBe(true);
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
        // Avoid an actual (cookie-mode) network call from the real
        // refreshToken() — DPoP mode's refreshToken() is implemented in a
        // later ticket (ENG-4801). We only assert *that* a refresh was
        // scheduled and fires at the right time.
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
  });
});
