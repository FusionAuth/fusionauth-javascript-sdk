import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { take } from 'rxjs';

import { FusionAuthConfig } from './types';
import { FusionAuthService } from './fusion-auth.service';
import { FusionAuthModule } from './fusion-auth.module';
import { mockIsLoggedIn, removeAt_expCookie } from '../sdkcore';

const config: FusionAuthConfig = {
  clientId: 'a-client-id',
  redirectUri: 'http://my-app.com',
  serverUrl: 'http://localhost:9011',
};

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
    localStorage.setItem('fa-sdk-redirect-value', `abc123:${stateValue}`);

    const onRedirect = vi.fn();
    configureTestingModule({ ...config, onRedirect });

    expect(onRedirect).toHaveBeenCalledWith('/welcome-page');
  });
});
