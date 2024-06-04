import { describe, it, expect, afterEach } from 'vitest';

import { CookieAdapter, getAccessTokenExpirationMoment } from '.';

describe('getAccessTokenExpirationMoment', () => {
  afterEach(() => {
    document.cookie =
      'app.at_exp' + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  });

  it('Should get the "app.at_exp" cookie value in milliseconds', () => {
    const exp = Date.now();
    document.cookie = `app.at_exp=${exp}`;
    expect(getAccessTokenExpirationMoment()).toBe(exp * 1000);
  });

  it('Should return -1 if the cookie is not set', () => {
    expect(getAccessTokenExpirationMoment()).toBe(-1);
  });

  it('Accepts a specific cookieName if one is provided', () => {
    const cookieName = 'my-special-cookie';
    const exp = 1200;
    document.cookie = `${cookieName}=${exp}`;

    expect(getAccessTokenExpirationMoment(cookieName)).toBe(1200000);
  });

  it('Will get the value from a cookieAdapter if one is passed in', () => {
    const value = '500';
    const cookieAdapter: CookieAdapter = {
      at_exp() {
        return value;
      },
    };

    expect(getAccessTokenExpirationMoment(undefined, cookieAdapter)).toBe(
      500000,
    );
  });
});
