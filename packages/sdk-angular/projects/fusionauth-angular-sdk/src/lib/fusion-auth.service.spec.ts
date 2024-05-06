import { FusionAuthConfig } from './types';
import { FusionAuthService } from './fusion-auth.service';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { mockIsLoggedIn, removeAt_expCookie } from '@fusionauth-sdk/core';
import { take } from 'rxjs';

describe('FusionAuthService', () => {
  afterEach(() => {
    removeAt_expCookie();
    localStorage.clear();
  });

  const config: FusionAuthConfig = {
    clientId: 'a-client-id',
    redirectUri: 'http://my-app.com',
    serverUrl: 'http://localhost:9011',
  };

  it('Can be configured to automatically handle getting userInfo', (done: DoneFn) => {
    mockIsLoggedIn();

    spyOn(window, 'fetch').and.resolveTo(
      new Response(
        JSON.stringify({
          email: 'richard@test.com',
        }),
        { status: 200 },
      ),
    );

    const service = new FusionAuthService(config);

    service.getUserInfoObservable().subscribe({
      next: userInfo => {
        expect(userInfo.email).toBe('richard@test.com');
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

    const service = new FusionAuthService(config);

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

    const service = new FusionAuthService(config);

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

    const service = new FusionAuthService({
      ...config,
      shouldAutoRefresh: true,
    });

    expect(service.isLoggedIn()).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("Does not invoke 'initAutoRefresh' if the user is not logged in", () => {
    const spy = spyOn(FusionAuthService.prototype, 'initAutoRefresh');
    const service = new FusionAuthService({
      ...config,
      shouldAutoRefresh: true,
    });

    expect(service.isLoggedIn()).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it("Invokes an 'onRedirect' callback", () => {
    mockIsLoggedIn();

    const stateValue = '/welcome-page';
    localStorage.setItem('fa-sdk-redirect-value', `abc123:${stateValue}`);

    const onRedirect = jasmine.createSpy('onRedirectSpy');

    new FusionAuthService({ ...config, onRedirect });

    expect(onRedirect).toHaveBeenCalledWith('/welcome-page');
  });
});
