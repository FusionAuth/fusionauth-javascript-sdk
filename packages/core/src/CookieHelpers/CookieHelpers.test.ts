import { describe, it, expect, afterEach } from 'vitest';

import { getAccessTokenExpirationMoment } from '.';

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
  it('Should return null if the cookie is not set', () => {
    expect(getAccessTokenExpirationMoment()).toBeNull();
  });
});
