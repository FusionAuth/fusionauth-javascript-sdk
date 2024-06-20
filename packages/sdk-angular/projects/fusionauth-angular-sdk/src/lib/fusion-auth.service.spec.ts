import { TestBed } from '@angular/core/testing';
import { fakeAsync, flush, tick } from '@angular/core/testing';
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
  });

  it('Can be configured to automatically handle getting userInfo', (done: DoneFn) => {
    mockIsLoggedIn();

    const user = {
      email: 'richard@test.com',
      customTrait: 'something special',
    };
    spyOn(window, 'fetch').and.resolveTo(
      new Response(JSON.stringify(user), { status: 200 }),
    );

    const service: FusionAuthService<typeof user> =
      configureTestingModule(config);

    service.getUserInfoObservable().subscribe({
      next: userInfo => {
        expect(userInfo.email).toBe('richard@test.com');
        expect(userInfo.customTrait).toBe('something special');
        done();
      },
    });
  });

  it('Handles a failure to get userInfo', (done: DoneFn) => {
    mockIsLoggedIn();

    const responseStatus = 400;
    spyOn(window, 'fetch').and.resolveTo(
      new Response(null, { status: responseStatus }),
    );

    const service = configureTestingModule(config);

    service.getUserInfoObservable().subscribe({
      error: error => {
        expect(error?.message).toBe(
          `Unable to fetch userInfo in fusionauth. Request failed with status code ${responseStatus}`,
        );
        done();
      },
    });
  });

  it("Contains an observable 'isLoggedin$' property that becomes false as the access token expires.", fakeAsync(() => {
    mockIsLoggedIn(); // sets `app.at_exp` cookie so user is logged in for 1 hour.

    const service = configureTestingModule(config);

    tick(60 * 59 * 1000);
    service.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      expect(isLoggedIn).toBe(true);
    });

    tick(60 * 1000); // access token expires
    service.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
      expect(isLoggedIn).toBe(false);
    });

    flush();
  }));

  it('Can be configured to automatically refresh the access token', () => {
    mockIsLoggedIn();
    const spy = spyOn(FusionAuthService.prototype, 'initAutoRefresh');

    const service = configureTestingModule({
      ...config,
      shouldAutoRefresh: true,
    });

    expect(service.isLoggedIn()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("Does not invoke 'initAutoRefresh' if the user is not logged in", () => {
    const initAutoRefreshSpy = spyOn(
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

    const onRedirect = jasmine.createSpy('onRedirectSpy');
    configureTestingModule({ ...config, onRedirect });

    expect(onRedirect).toHaveBeenCalledWith('/welcome-page');
  });

  it("Invokes an 'onAutoRefreshFailure' callback", fakeAsync(() => {
    mockIsLoggedIn();
    spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 400 }));
    const onAutoRefreshFailure = jasmine.createSpy('onAutoRefreshFailureSpy');

    configureTestingModule({
      ...config,
      shouldAutoRefresh: true,
      onAutoRefreshFailure,
    });

    tick(60 * 60 * 1000);
    expect(onAutoRefreshFailure).not.toHaveBeenCalledWith();
  }));
});
