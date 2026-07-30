import { TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { vi } from 'vitest';
import { take } from 'rxjs';

import { FusionAuthConfig } from './types';
import { FusionAuthService } from './fusion-auth.service';
import { FusionAuthModule } from './fusion-auth.module';
import {
  mockIsLoggedIn,
  removeAt_expCookie,
  mockWindowLocation,
  DPoPManager,
} from '../sdkcore';

const config: FusionAuthConfig = {
  clientId: 'a-client-id',
  redirectUri: 'http://my-app.com',
  serverUrl: 'http://localhost:9011',
};

const dpopConfig: FusionAuthConfig = {
  ...config,
  useDpop: true,
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

function configureTestingModule(config: FusionAuthConfig) {
  TestBed.configureTestingModule({
    imports: [FusionAuthModule.forRoot(config)],
  });
  return TestBed.inject(FusionAuthService);
}

describe('FusionAuthService', () => {
  afterEach(() => {
    removeAt_expCookie();
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('Can be configured to automatically handle getting userInfo', async () => {
    mockIsLoggedIn();

    const user = {
      email: 'richard@test.com',
      customTrait: 'something special',
    };
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(user), { status: 200 }),
    );

    const service: FusionAuthService<typeof user> =
      configureTestingModule(config);

    await new Promise<void>((resolve, reject) => {
      service
        .getUserInfoObservable()
        .pipe(take(1))
        .subscribe({
          next: userInfo => {
            expect(userInfo.email).toBe('richard@test.com');
            expect(userInfo.customTrait).toBe('something special');
            resolve();
          },
          error: reject,
        });
    });
  });

  it('Handles a failure to get userInfo', async () => {
    mockIsLoggedIn();

    const responseStatus = 400;
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(null, { status: responseStatus }),
    );

    const service = configureTestingModule(config);

    await new Promise<void>((resolve, reject) => {
      service
        .getUserInfoObservable()
        .pipe(take(1))
        .subscribe({
          error: error => {
            expect(error?.message).toBe(
              `Unable to fetch userInfo in fusionauth. Request failed with status code ${responseStatus}`,
            );
            resolve();
          },
          next: () => reject(new Error('Expected error but got next')),
        });
    });
  });

  it("Contains an observable 'isLoggedIn$' property that becomes false as the access token expires.", async () => {
    vi.useFakeTimers();
    mockIsLoggedIn(); // sets `app.at_exp` cookie so user is logged in for 1 hour.

    const service = configureTestingModule(config);

    await vi.advanceTimersByTimeAsync(60 * 59 * 1000);
    service.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      expect(isLoggedIn).toBe(true);
    });

    await vi.advanceTimersByTimeAsync(60 * 1000); // access token expires
    service.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      expect(isLoggedIn).toBe(false);
    });
  });

  it('Can be configured to automatically refresh the access token', () => {
    mockIsLoggedIn();
    const spy = vi.spyOn(FusionAuthService.prototype, 'initAutoRefresh');

    const service = configureTestingModule({
      ...config,
      shouldAutoRefresh: true,
    });

    expect(service.isLoggedIn()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("Does not invoke 'initAutoRefresh' if the user is not logged in", () => {
    const initAutoRefreshSpy = vi.spyOn(
      FusionAuthService.prototype,
      'initAutoRefresh',
    );

    const service = configureTestingModule({
      ...config,
      shouldAutoRefresh: true,
    });

    expect(service.isLoggedIn()).toBe(false);
    expect(initAutoRefreshSpy).not.toHaveBeenCalled();
  });

  it("Invokes an 'onRedirect' callback", () => {
    mockIsLoggedIn();

    const stateValue = '/welcome-page';
    // Format: nonce:state (hosted backend mode)
    localStorage.setItem('fa-sdk-redirect-value', `abc123:${stateValue}`);

    const onRedirect = vi.fn();
    configureTestingModule({ ...config, onRedirect });

    expect(onRedirect).toHaveBeenCalledWith('/welcome-page');
  });

  describe('DPoP mode', () => {
    it('dpopFetch() delegates to DPoPManager when useDpop: true', async () => {
      const mockResponse = new Response(null, { status: 200 });
      const fetchSpy = vi
        .spyOn(DPoPManager.prototype, 'fetch')
        .mockResolvedValue(mockResponse);

      const service = configureTestingModule(dpopConfig);
      const init = { method: 'GET' };
      const response = await service.dpopFetch(
        'https://api.example.com/data',
        init,
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.example.com/data',
        init,
      );
      expect(response).toBe(mockResponse);
    });

    it('dpopFetch() throws when useDpop is not enabled', async () => {
      const service = configureTestingModule(config);

      await expect(
        service.dpopFetch('https://api.example.com/data'),
      ).rejects.toThrow(
        'dpopFetch() is only available in DPoP mode. In cookie mode, use fetch() with credentials: "include" instead.',
      );
    });

    it('generateProof() delegates to DPoPManager when useDpop: true', async () => {
      const generateProofSpy = vi
        .spyOn(DPoPManager.prototype, 'generateProof')
        .mockResolvedValue('mock-dpop-proof-jwt');

      const service = configureTestingModule(dpopConfig);
      const proof = await service.generateProof(
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

    it('generateProof() throws when useDpop is not enabled', async () => {
      const service = configureTestingModule(config);

      await expect(
        service.generateProof('https://api.example.com/data', 'POST'),
      ).rejects.toThrow(
        'generateProof() is only available in DPoP mode. In cookie mode, tokens are stored in HttpOnly cookies and DPoP proofs are not applicable.',
      );
    });

    it('getAccessToken() returns the stored access token when useDpop: true', () => {
      seedDpopTokens(dpopConfig.clientId, {
        accessToken: 'mock-stored-access-token',
      });

      const service = configureTestingModule(dpopConfig);

      expect(service.getAccessToken()).toBe('mock-stored-access-token');
    });

    it('getAccessToken() returns null when logged out in DPoP mode', () => {
      const service = configureTestingModule(dpopConfig);

      expect(service.getAccessToken()).toBeNull();
    });

    it('getAccessToken() throws when useDpop is not enabled', () => {
      const service = configureTestingModule(config);

      expect(() => service.getAccessToken()).toThrow(
        'getAccessToken() is only available in DPoP mode. In hosted backend mode, tokens are stored in HttpOnly cookies and are not accessible to JavaScript.',
      );
    });

    it('isLoggedIn$ emits true once the post-redirect DPoP token exchange settles', async () => {
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

      const service = configureTestingModule(dpopConfig);

      // isLoggedIn$ is a BehaviorSubject seeded at construction time — before
      // the DPoP exchange has had a chance to complete — so the first
      // emission must be false. A second emission of true, once the async
      // exchange settles, only happens if handlePostRedirect()'s promise is
      // observed and used to re-emit the (now-updated) isLoggedIn state.
      const emissions: boolean[] = [];
      service.isLoggedIn$.subscribe(isLoggedIn => emissions.push(isLoggedIn));

      expect(emissions).toEqual([false]);

      await vi.waitFor(() => {
        expect(emissions).toContain(true);
      });

      expect(service.getAccessToken()).toBe('mock-access-token');
    });

    it('isLoggedInSignal reflects true once the post-redirect DPoP token exchange settles', async () => {
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

      const service = configureTestingModule(dpopConfig);

      expect(service.isLoggedInSignal()).toBe(false);

      await vi.waitFor(() => {
        expect(service.isLoggedInSignal()).toBe(true);
      });
    });

    it('getUserInfoObservable() re-enters the Angular zone for its `next` callback, even when the underlying fetch settles outside it (as happens via IndexedDB in DPoP mode)', async () => {
      seedDpopTokens(dpopConfig.clientId);

      const service = configureTestingModule(dpopConfig);
      const ngZone = TestBed.inject(NgZone);
      const mockUserInfo = { email: 'richard@example.com' };

      // Simulate the real DPoP-mode zone leak: DPoPManager.fetch() resolves
      // through IndexedDB (via getOrCreateKeyPair()/generateProof()), which
      // zone.js cannot patch, so the promise settles outside NgZone.
      vi.spyOn(DPoPManager.prototype, 'fetch').mockImplementation(
        () =>
          ngZone.runOutsideAngular(
            () =>
              new Promise<Response>(resolve => {
                setTimeout(() => {
                  resolve(
                    new Response(JSON.stringify(mockUserInfo), {
                      status: 200,
                    }),
                  );
                }, 0);
              }),
          ) as Promise<Response>,
      );

      let wasInAngularZone: boolean | undefined;
      await new Promise<void>((resolve, reject) => {
        service
          .getUserInfoObservable()
          .pipe(take(1))
          .subscribe({
            next: userInfo => {
              wasInAngularZone = NgZone.isInAngularZone();
              expect(userInfo).toEqual(mockUserInfo);
              resolve();
            },
            error: reject,
          });
      });

      expect(wasInAngularZone).toBe(true);
    });
  });
});
