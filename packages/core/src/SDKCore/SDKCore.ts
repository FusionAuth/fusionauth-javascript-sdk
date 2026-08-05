import { UrlHelper } from '../UrlHelper';
import { SDKConfig } from '../SDKConfig';
import { UserInfo } from '../SDKContext';
import { RedirectHelper } from '../RedirectHelper';
import { getAccessTokenExpirationMoment } from '../CookieHelpers';
import { DPoPManager } from '../DPoP';

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
        this.urlHelper,
        this.redirectHelper,
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
   * In DPoP mode, this synchronously returns after starting an async chain
   * that handles the DPoP login flow.
  
   * In hosted backend mode the processing is synchronous.
   *
   * @param state  Optional OAuth2 state value echoed back post-login.
   */
  startLogin(state?: string): void {
    const dpopManager = this.dpopManager;
    if (dpopManager) {
      (async () => {
        try {
          await dpopManager.startLogin(state);
        } catch (error) {
          if (this.config.onLoginFailure) {
            this.config.onLoginFailure(error as Error);
          } else {
            console.error('FusionAuth SDK: startLogin failed', error);
          }
        }
      })();
      return;
    }

    this.redirectHelper.handlePreRedirect(state);
    window.location.assign(this.urlHelper.getLoginUrl(state));
  }

  /**
   * Initiates the register flow.
   * @param state  Optional OAuth2 state value echoed back post-register.
   */
  startRegister(state?: string): void {
    const dpopManager = this.dpopManager;
    if (dpopManager) {
      (async () => {
        try {
          await dpopManager.startRegister(state);
        } catch (error) {
          if (this.config.onLoginFailure) {
            this.config.onLoginFailure(error as Error);
          } else {
            console.error('FusionAuth SDK: startRegister failed', error);
          }
        }
      })();
      return;
    }

    this.redirectHelper.handlePreRedirect(state);
    window.location.assign(this.urlHelper.getRegisterUrl(state));
  }

  /**
   * Initiates the logout flow.
   *
   * In DPoP mode, this synchronously returns after starting an
   * asynchronous flow.
   *
   * In hosted backend mode, the flow is synchronous.
   */
  startLogout(): void {
    clearTimeout(this.tokenExpirationTimeout);
    this.stopAutoRefresh();

    const dpopManager = this.dpopManager;
    if (dpopManager) {
      (async () => {
        try {
          await dpopManager.startLogout();
        } catch (error) {
          console.error('FusionAuth SDK: startLogout failed', error);
        }
      })();
      return;
    }

    window.location.assign(this.urlHelper.getLogoutUrl());
  }

  manageAccount() {
    window.location.assign(this.urlHelper.getAccountManagementUrl());
  }

  /**
   * Returns the current DPoP mode access token.  In hosted backend mode, tokens
   * are stored in HttpOnly cookies and are never accessible to JavaScript,
   * so this method throws instead.
   *
   * @throws {Error} if called in hosted backend mode
   */
  getAccessToken(): string | null {
    if (!this.dpopManager) {
      throw new Error(
        'getAccessToken() is only available in DPoP mode. In hosted backend mode, tokens are stored in HttpOnly cookies and are not accessible to JavaScript.',
      );
    }
    return this.dpopManager.getAccessToken();
  }

  /**
   * DPoP-aware `fetch()` wrapper. Automatically attaches `Authorization: DPoP
   * <token>` and `DPoP: <proof>` headers to the outgoing request.
   *
   * @throws {Error} if called in hosted backend mode (`useDpop: false`).
   */
  async dpopFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    if (!this.dpopManager) {
      throw new Error(
        'dpopFetch() is only available in DPoP mode. In hosted backend mode, use fetch() with credentials: "include" instead.',
      );
    }
    return this.dpopManager.fetch(input, init);
  }

  /**
   * Generates a signed DPoP proof JWT for the given request, for use cases
   *  (e.g. axios or other HTTP libraries) that can't use
   * {@link dpopFetch}).
   *
   * @throws {Error} if called in hosted backend mode (`useDpop: false`).
   */
  async generateProof(
    htu: string,
    htm: string,
    accessToken?: string,
    nonce?: string,
  ): Promise<string> {
    if (!this.dpopManager) {
      throw new Error(
        'generateProof() is only available in DPoP mode. In hosted backend mode, tokens are stored in HttpOnly cookies and DPoP proofs are not applicable.',
      );
    }
    return this.dpopManager.generateProof(htu, htm, accessToken, nonce);
  }

  async fetchUserInfo<T = UserInfo>(): Promise<T> {
    if (this.dpopManager) {
      return this.dpopManager.fetchUserInfo<T>();
    }

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
    if (this.dpopManager) {
      const response = await this.dpopManager.refreshToken();
      this.scheduleTokenExpiration();
      if (this.config.shouldAutoRefresh) {
        this.initAutoRefresh();
      }
      return response;
    }

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
   * restarted via {@link initAutoRefresh}.
   */
  stopAutoRefresh(): void {
    clearTimeout(this.refreshTokenTimeout);
  }

  /**
   * Handles the return trip from a login/register redirect.
   *
   * In DPoP mode (`useDpop: true`), this synchronously returns after
   * kicking off an async chain, otherwise continue using Hosted
   * Backend Mode.
   */
  async handlePostRedirect(callback?: (state?: string) => void): Promise<void> {
    if (this.dpopManager) {
      const error = await this.dpopManager.handlePostRedirect(callback);
      if (error) {
        if (this.config.onLoginFailure) {
          this.config.onLoginFailure(error);
        } else {
          console.error('FusionAuth SDK: handlePostRedirect failed', error);
        }
      } else {
        this.scheduleTokenExpiration();
        if (this.config.shouldAutoRefresh) {
          this.initAutoRefresh();
        }
      }
      return;
    }

    if (this.isLoggedIn) {
      this.redirectHelper.handlePostRedirect(callback);
    }
  }

  /**
   * Whether the user is currently logged in.
   *
   * - DPoP mode: delegates to `DPoPManager.isLoggedIn` which checks whether
   *   the stored tokens exist and have not expired.
   * - Hosted backend mode: reads the `app.at_exp` cookie (existing behavior).
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
   * - Hosted backend mode: reads the `app.at_exp` cookie (existing behavior).
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
   * so `onTokenExpiration` is for reactive frameworks to hook in and
   * perform actions as on token expiration.
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
