import { UrlHelper } from '../UrlHelper';
import { SDKConfig } from '../SDKConfig';
import { UserInfo } from '../SDKContext';
import { RedirectHelper } from '../RedirectHelper';
import { getAccessTokenExpirationMoment } from '../CookieHelpers';
import { DPoPManager } from '../DPoP';
import * as Pkce from '../Pkce';

/** A class containing framework-agnostic SDK methods */
export class SDKCore {
  private config: SDKConfig;
  private urlHelper: UrlHelper;
  private redirectHelper: RedirectHelper = new RedirectHelper();
  private tokenExpirationTimeout?: NodeJS.Timeout;
  private refreshTokenTimeout?: NodeJS.Timeout;
  private isDisposed = false;
  private dpopManager?: DPoPManager;

  constructor(config: SDKConfig) {
    this.config = config;
    this.urlHelper = new UrlHelper({
      serverUrl: config.serverUrl,
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scope: config.scope,
      authParams: config.authParams,
      mePath: config.mePath,
      loginPath: config.loginPath,
      registerPath: config.registerPath,
      logoutPath: config.logoutPath,
      tokenRefreshPath: config.tokenRefreshPath,
      postLogoutRedirectUri: config.postLogoutRedirectUri,
    });

    if (config.useDpop) {
      this.dpopManager = new DPoPManager(
        config.clientId,
        config.dpopTokenStorage,
      );
    }

    this.scheduleTokenExpiration();
  }

  dispose() {
    clearTimeout(this.tokenExpirationTimeout);
    clearTimeout(this.refreshTokenTimeout);
    this.isDisposed = true;
  }

  /**
   * Initiates the login flow.
   *
   * In DPoP mode (`useDpop: true`), this synchronously returns after kicking
   * off an async chain that:
   * 1. Loads or generates the DPoP key pair.
   * 2. Computes `dpop_jkt` (JWK SHA-256 thumbprint of the public key).
   * 3. Generates a PKCE `code_verifier` and derives `code_challenge`.
   * 4. Persists `code_verifier` via `RedirectHelper` for later token exchange.
   * 5. Redirects to FusionAuth `/oauth2/authorize` directly with `dpop_jkt`
   *    and `code_challenge` parameters.
   *
   * `startLogin()` itself is `void` (not `async`) so its signature matches
   * the public `SDKContext`/framework wrapper types exactly. If the async
   * DPoP chain fails, the error is reported via `SDKConfig.onLoginFailure`
   * (or `console.error` if not configured) rather than becoming an unhandled
   * promise rejection.
   *
   * In cookie mode: delegates to the Hosted Backend API, fully synchronously.
   *
   * @param state  Optional OAuth2 state value echoed back post-login.
   */
  startLogin(state?: string): void {
    if (this.dpopManager) {
      this.startDpopLogin(state).catch(error => {
        if (this.config.onLoginFailure) {
          this.config.onLoginFailure(error as Error);
        } else {
          console.error('FusionAuth SDK: startLogin failed', error);
        }
      });
      return;
    }

    // Cookie mode — unchanged behavior.
    this.redirectHelper.handlePreRedirect(state);
    window.location.assign(this.urlHelper.getLoginUrl(state));
  }

  /**
   * Performs the DPoP-mode login flow. See {@link startLogin} for the full
   * step-by-step description. Split out as its own async method so that
   * `startLogin()` itself can remain synchronous (`void`) while still
   * performing the necessary async key-pair/PKCE work before redirecting.
   */
  private async startDpopLogin(state?: string): Promise<void> {
    await this.dpopManager!.getOrCreateKeyPair();
    const dpopJkt = await this.dpopManager!.getThumbprint();
    const codeVerifier = Pkce.generateCodeVerifier();
    const codeChallenge = await Pkce.generateCodeChallenge(codeVerifier);
    this.redirectHelper.handlePreRedirect(state, codeVerifier);
    window.location.assign(
      this.urlHelper.getAuthorizeUrl(dpopJkt, codeChallenge, state),
    );
  }

  startRegister(state?: string) {
    this.redirectHelper.handlePreRedirect(state);
    window.location.assign(this.urlHelper.getRegisterUrl(state));
  }

  startLogout() {
    window.location.assign(this.urlHelper.getLogoutUrl());
  }

  manageAccount() {
    window.location.assign(this.urlHelper.getAccountManagementUrl());
  }

  async fetchUserInfo<T = UserInfo>() {
    const userInfoResponse = await fetch(this.urlHelper.getMeUrl(), {
      credentials: 'include',
    });

    if (!userInfoResponse.ok) {
      throw new Error(
        `Unable to fetch userInfo in fusionauth. Request failed with status code ${userInfoResponse?.status}`,
      );
    }

    const userInfo: T = await userInfoResponse.json();
    return userInfo;
  }

  async refreshToken(): Promise<Response> {
    const response = await fetch(this.urlHelper.getTokenRefreshUrl(), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    if (!(response.status >= 200 && response.status < 300)) {
      const errorDetails = {
        status: response.status,
        details:
          (await response?.text()) ||
          'Failed to refresh fusionauth access token',
      };
      throw new Error(JSON.stringify(errorDetails));
    }

    // a successful request means that app_exp was bumped into the future.
    // reschedule the access token expiration event.
    this.scheduleTokenExpiration();

    return response;
  }

  initAutoRefresh(): NodeJS.Timeout | undefined {
    // Clear any pending refresh so repeated calls (e.g. a reactive framework
    // re-running an effect) doesn't leave duplicate timers running.
    clearTimeout(this.refreshTokenTimeout);

    if (!this.isLoggedIn || this.isDisposed) {
      return;
    }

    const secondsBeforeRefresh =
      this.config.autoRefreshSecondsBeforeExpiry ?? 10;

    const millisecondsBeforeRefresh = secondsBeforeRefresh * 1000;

    const now = new Date().getTime();
    const refreshTime = this.at_exp - millisecondsBeforeRefresh;
    const timeTillRefresh = Math.max(refreshTime - now, 0);

    this.refreshTokenTimeout = setTimeout(async () => {
      try {
        await this.refreshToken();
        this.initAutoRefresh();
      } catch (error) {
        this.config.onAutoRefreshFailure?.(error as Error);
      }
    }, timeTillRefresh);

    return this.refreshTokenTimeout;
  }

  /**
   * Cancels a pending automatic token refresh without disposing the core.
   * Unlike {@link dispose}, the core remains usable and auto refresh can be
   * restarted via {@link initAutoRefresh}. This makes it safe to stop/start
   * across React StrictMode's mount → unmount → remount cycle.
   */
  stopAutoRefresh(): void {
    clearTimeout(this.refreshTokenTimeout);
  }

  /**
   * Handles the return trip from a login/register redirect.
   *
   * In DPoP mode (`useDpop: true`), this synchronously returns after
   * kicking off an async chain, otherwise continue using the Hosted
   * Backend API.
   */
  handlePostRedirect(callback?: (state?: string) => void): void {
    if (this.dpopManager) {
      this.handleDpopPostRedirect(callback).catch(error => {
        if (this.config.onLoginFailure) {
          this.config.onLoginFailure(error as Error);
        } else {
          console.error('FusionAuth SDK: handlePostRedirect failed', error);
        }
      });
      return;
    }

    if (this.isLoggedIn) {
      this.redirectHelper.handlePostRedirect(callback);
    }
  }

  /**
   * Performs the DPoP-mode authorization code exchange. The full
   * step-by-step description:
   *
   * 1. Detects the `code` query parameter on the current URL.
   * 2. Retrieves the persisted PKCE `code_verifier`.
   * 3. Exchanges the code for tokens at FusionAuth's `/oauth2/token`,
   *    signing the request with a DPoP proof (no `ath`, since this is a
   *    token endpoint request, not a resource server request).
   * 4. Stores the returned tokens via `DPoPManager.setTokens()`.
   * 5. Schedules token expiration and (if `shouldAutoRefresh`) auto-refresh
   *    from the tokens' `expiresAt`.
   * 6. Invokes `callback` with the `state` value and cleans up the
   *    redirect marker, via `RedirectHelper.handlePostRedirect()`.
   */
  private async handleDpopPostRedirect(
    callback?: (state?: string) => void,
  ): Promise<void> {
    // SSR/non-browser guard
    if (typeof window === 'undefined') {
      return;
    }

    const code = new URLSearchParams(window.location.search).get('code');
    const codeVerifier = this.redirectHelper.getCodeVerifier();

    // No pending exchange
    if (!code || !codeVerifier) {
      return;
    }

    const tokenUrl = this.urlHelper.getTokenUrl();
    // No `ath` — this proof is for the token endpoint, not a resource server.
    const proof = await this.dpopManager!.generateProof(
      tokenUrl.toString(),
      'POST',
    );

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        DPoP: proof,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorDetails = {
        status: response.status,
        details:
          (await response.text()) ||
          'Failed to exchange authorization code for tokens',
      };
      throw new Error(JSON.stringify(errorDetails));
    }

    const tokenResponse = await response.json();
    this.dpopManager!.setTokens({
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
      tokenType: 'DPoP',
    });

    this.clearRedirectQueryParams();
    this.scheduleTokenExpiration();
    if (this.config.shouldAutoRefresh) {
      this.initAutoRefresh();
    }

    this.redirectHelper.handlePostRedirect(callback);
  }

  /**
   * Removes `code` and `state` from the current URL regarding security.
   */
  private clearRedirectQueryParams(): void {
    const { origin, pathname, search, hash } = window.location;
    const url = new URL(`${origin}${pathname}${search}${hash}`);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    window.history.replaceState(null, '', url.toString());
  }

  /**
   * Whether the user is currently logged in.
   *
   * - DPoP mode: delegates to `DPoPManager.isLoggedIn` which checks whether
   *   the stored tokens exist and have not expired.
   * - Cookie mode: reads the `app.at_exp` cookie (existing behavior).
   */
  get isLoggedIn() {
    if (this.dpopManager) {
      return this.dpopManager.isLoggedIn;
    }
    return this.at_exp > new Date().getTime();
  }

  /**
   * The moment of access token expiration in milliseconds since epoch.
   *
   * - DPoP mode: delegates to `DPoPManager.getExpiresAt()`.
   * - Cookie mode: reads the `app.at_exp` cookie (existing behavior).
   */
  private get at_exp(): number | -1 {
    if (this.dpopManager) {
      return this.dpopManager.getExpiresAt();
    }
    return getAccessTokenExpirationMoment(
      this.config.accessTokenExpireCookieName,
      this.config.cookieAdapter,
    );
  }

  /**
   * Schedules `onTokenExpiration` at moment of access token expiration.
   * SDKCore is not necessarily reactive like React, Angular, and Vue.
   * so `onTokenExpiration` is for reactive frameworks to hook in and perform actions as on token expiration.
   */
  private scheduleTokenExpiration(): void {
    clearTimeout(this.tokenExpirationTimeout);

    const now = new Date().getTime();
    const millisecondsTillExpiration = this.at_exp - now;

    if (millisecondsTillExpiration > 0) {
      this.tokenExpirationTimeout = setTimeout(
        this.config.onTokenExpiration,
        millisecondsTillExpiration,
      );
    }
  }
}
