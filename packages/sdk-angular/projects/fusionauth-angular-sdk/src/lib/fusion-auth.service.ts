import {
  Injectable,
  Inject,
  PLATFORM_ID,
  NgZone,
  Signal,
  ApplicationRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, BehaviorSubject } from 'rxjs';

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
  private isLoggedInSubject: BehaviorSubject<boolean>;

  constructor(
    @Inject(FUSIONAUTH_SERVICE_CONFIG) config: FusionAuthConfig,
    @Inject(PLATFORM_ID) platformId: Object,
    private ngZone: NgZone,
    private appRef: ApplicationRef,
  ) {
    this.core = new SDKCore({
      ...config,
      onTokenExpiration: () => {
        this.runInZoneAndTick(() => this.isLoggedInSubject.next(false));
      },
      cookieAdapter: new SSRCookieAdapter(isPlatformBrowser(platformId)),
    });

    this.isLoggedInSubject = new BehaviorSubject(this.core.isLoggedIn);
    this.isLoggedIn$ = this.isLoggedInSubject.asObservable();
    this.isLoggedInSignal = toSignal(this.isLoggedIn$, {
      initialValue: this.core.isLoggedIn,
    });

    this.core.handlePostRedirect(config.onRedirect).then(() => {
      this.runInZoneAndTick(() =>
        this.isLoggedInSubject.next(this.core.isLoggedIn),
      );
    });

    if (config.shouldAutoRefresh && this.core.isLoggedIn) {
      this.initAutoRefresh();
    }
  }

  private runInZoneAndTick(fn: () => void): void {
    this.ngZone.run(fn);
    if (!this.appRef.destroyed) {
      this.appRef.tick();
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
          this.runInZoneAndTick(() => observer.next(userInfo));
        })
        .catch(error => {
          this.runInZoneAndTick(() => observer.error(error));
        })
        .finally(() => {
          this.runInZoneAndTick(() => callbacks?.onDone?.());
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
    return this.core.fetchUserInfo<T>().then(userInfo => {
      let result!: T;
      this.runInZoneAndTick(() => {
        result = userInfo;
      });
      return result;
    });
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
