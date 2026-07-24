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
  });
});
