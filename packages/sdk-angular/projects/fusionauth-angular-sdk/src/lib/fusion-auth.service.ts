import {
  Injectable,
  Inject,
  PLATFORM_ID,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError } from 'rxjs';

import { SDKCore } from '../sdkcore';
import { SSRCookieAdapter } from './SSRCookieAdapter';
import { FusionAuthConfig, UserInfo } from './types';
import { FUSIONAUTH_SERVICE_CONFIG } from './injectionToken';

/**
 * Service class to use with FusionAuth backend endpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class FusionAuthService<T = UserInfo> {
  private core: SDKCore;
  private autoRefreshTimer?: NodeJS.Timeout;
  private isLoggedInState: WritableSignal<boolean>;

  constructor(
    @Inject(FUSIONAUTH_SERVICE_CONFIG) config: FusionAuthConfig,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.core = new SDKCore({
      ...config,
      onTokenExpiration: () => {
        this.isLoggedInState.set(false);
      },
      cookieAdapter: new SSRCookieAdapter(isPlatformBrowser(platformId)),
    });

    // A signal is used here because updating a signal read in an HTML template
    // is one of Angular's built-in change-detection notification mechanisms.
    this.isLoggedInState = signal(this.core.isLoggedIn);
    this.isLoggedInSignal = this.isLoggedInState;
    this.isLoggedIn$ = toObservable(this.isLoggedInState);

    this.core.handlePostRedirect(state => {
      this.isLoggedInState.set(this.core.isLoggedIn);
      config.onRedirect?.(state);
    });

    if (config.shouldAutoRefresh && this.core.isLoggedIn) {
      this.initAutoRefresh();
    }
  }

  /** An observable representing whether the user is logged in. */
  isLoggedIn$: Observable<boolean>;

  /**
   * A Signal representing whether the user is logged in.
   */
  isLoggedInSignal: Signal<boolean>;

  /** A function that returns whether the user is logged in. This returned value is non-observable. */
  isLoggedIn() {
    return this.core.isLoggedIn;
  }

  /**
   * Refreshes the access token a single time.
   * Automatic token refreshing can be enabled if the SDK is configured with `shouldAutoRefresh`.
   */
  async refreshToken(): Promise<Response> {
    return await this.core.refreshToken();
  }

  /**
   * Initializes automatic access token refreshing.
   * This is handled automatically if the SDK is configured with `shouldAutoRefresh`.
   */
  initAutoRefresh(): void {
    if (this.autoRefreshTimer) {
      clearTimeout(this.autoRefreshTimer);
    }

    this.autoRefreshTimer = this.core.initAutoRefresh();
  }

  /**
   * Returns an observable request that fetches userInfo, and catches error.
   */
  getUserInfoObservable(callbacks?: {
    onBegin?: () => void;
    onDone?: () => void;
  }): Observable<T> {
    callbacks?.onBegin?.();
    return new Observable<T>(observer => {
      this.core
        .fetchUserInfo<T>()
        .then(userInfo => {
          observer.next(userInfo);
        })
        .catch(error => {
          observer.error(error);
        })
        .finally(() => {
          callbacks?.onDone?.();
        });
    }).pipe(
      catchError(error => {
        throw error;
      }),
    );
  }

  /**
   * Fetches userInfo from the 'me' endpoint.
   * @throws {Error} - if an error occurred while fetching.
   */
  async getUserInfo<T>(): Promise<T> {
    return await this.core.fetchUserInfo<T>();
  }

  /**
   * Initiates login flow.
   * @param {string} [state] - Optional value to be echoed back to the SDK upon redirect.
   */
  startLogin(state?: string): void {
    this.core.startLogin(state);
  }

  /**
   * Initiates register flow.
   * @param {string} [state] - Optional value to be echoed back to the SDK upon redirect.
   */
  startRegistration(state?: string): void {
    this.core.startRegister(state);
  }

  /**
   * Initiates logout flow.
   */
  logout(): void {
    this.core.startLogout();
  }

  /**
   * Redirects to [self service account management](https://fusionauth.io/docs/lifecycle/manage-users/account-management/)
   * Self service account management is only available in FusionAuth paid plans.
   */
  manageAccount(): void {
    this.core.manageAccount();
  }

  /**
   * DPoP mode `fetch()` wrapper that automatically attaches DPoP proof
   * headers.
   * @throws {Error} if called when `useDpop` is not enabled.
   */
  async dpopFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    return this.core.dpopFetch(input, init);
  }

  /**
   * Returns a signed DPoP proof JWT for use with axios or other
   * HTTP libraries that can't use {@link dpopFetch}.
   * @throws {Error} if called when `useDpop` is not enabled.
   */
  async generateProof(
    htu: string,
    htm: string,
    accessToken?: string,
    nonce?: string,
  ): Promise<string> {
    return this.core.generateProof(htu, htm, accessToken, nonce);
  }

  /**
   * Returns the stored DPoP access token, or `null` if not logged in.
   * @throws {Error} if called when `useDpop` is not enabled.
   */
  getAccessToken(): string | null {
    return this.core.getAccessToken();
  }
}
