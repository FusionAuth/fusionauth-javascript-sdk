import { describe, expect, it } from 'vitest';
import JsCookie from 'js-cookie';

import { Cookie, CookieJar, EmptyCookie, UserCookie } from '.';

const cleanUp = <T>(cookie: Cookie<T>) => {
  cookie.remove();
};

describe('CookieJar', () => {
  it('can create a Cookie', () => {
    const someCookie = CookieJar.set('user', 'foo');

    expect(someCookie instanceof EmptyCookie).toBe(false);

    expect(someCookie.isEmpty()).toBe(false);
    expect(someCookie.isNotEmpty()).toBe(true);

    if (someCookie.isNotEmpty()) {
      cleanUp(someCookie);
    }
  });

  it('can create an empty Cookie', () => {
    const someCookie = CookieJar.get('user');

    expect(someCookie instanceof EmptyCookie).toBe(true);
    expect(someCookie instanceof UserCookie).toBe(false);

    expect(someCookie.isEmpty()).toBe(true);
    expect(someCookie.isNotEmpty()).toBe(false);

    if (someCookie.isNotEmpty()) {
      cleanUp(someCookie);
    }
  });
});

describe('Cookie', () => {
  it('can have a value', () => {
    const someCookie = CookieJar.set('user', 'foo');

    if (someCookie.isEmpty()) {
      throw new Error('Cookie should not be empty.');
    }

    expect(someCookie.value()).toBe('foo');
    cleanUp(someCookie);
  });

  it('can be refreshed', () => {
    const someCookie = CookieJar.set('user', 'foo');

    if (someCookie.isEmpty()) {
      throw new Error('Cookie should not be empty.');
    }

    JsCookie.set('user', 'bar');
    const newerCookie = someCookie.refresh();

    if (newerCookie.isEmpty()) {
      throw new Error('Cookie should not be empty.');
    }

    expect(newerCookie.value()).toBe('bar');
    cleanUp(newerCookie);
  });
});

describe('EmptyCookie', () => {
  it('can be filled', () => {
    const someCookie = CookieJar.get('user');

    if (someCookie.isNotEmpty()) {
      throw new Error('Cookie should be empty.');
    }

    const newCookie = someCookie.fillWith('bar');

    expect(newCookie.isNotEmpty()).toBe(true);

    if (newCookie.isEmpty()) {
      throw new Error('Cookie should be not be empty.');
    }

    expect(newCookie.value()).toBe('bar');
    cleanUp(newCookie);
  });
});

describe('AccessTokenExpirationCookie', () => {
  it("can inform that it's expired", () => {
    const someCookie = CookieJar.set('app.at_exp', '1712085274');

    if (someCookie.isEmpty()) {
      throw new Error('Cookie should not be empty.');
    }

    expect(someCookie.isExpired()).toBe(true);

    cleanUp(someCookie);
  });

  it("can inform that it's not expired", () => {
    const nowInMs = new Date().getTime();
    const nowInSeconds = nowInMs / 1000;
    const futureInSeconds = nowInSeconds + 100;
    const someCookie = CookieJar.set('app.at_exp', String(futureInSeconds)); // set to some future value

    if (someCookie.isEmpty()) {
      throw new Error('Cookie should not be empty.');
    }

    expect(someCookie.isExpired()).toBe(false);

    cleanUp(someCookie);
  });
});
