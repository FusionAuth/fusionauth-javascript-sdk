/**
 * Gets the `app.at_exp` cookie and converts it to milliseconds since epoch.
 * Returns -1 if the cookie is not present.
 * @param cookieName - defaults to `app.at_exp`.
 * @param adapter - SSR frameworks like Nuxt, Next, and angular/ssr will pass in an adapter.
 */
export function getAccessTokenExpirationMoment(
  cookieName: string = 'app.at_exp',
  adapter?: CookieAdapter,
): number | -1 {
  if (adapter) {
    return toMilliseconds(adapter.at_exp(cookieName));
  }

  let cookie;

  try {
    // `document` throws a ReferenceError if this runs in a
    // non-browser environment such as an SSR framework like Nuxt or Next.
    cookie = document.cookie;
  } catch {
    console.error(
      'Error accessing cookies in fusionauth. If you are using SSR you must configure the SDK with a cookie adapter',
    );
    return -1;
  }

  const expCookie = cookie
    .split('; ')
    .map(c => c.split('='))
    .find(([name]) => name === cookieName);
  const cookieValue = expCookie?.[1];

  return toMilliseconds(cookieValue);
}

export interface CookieAdapter {
  /** returns the `app.at_exp` cookie without manipulating the value. */
  at_exp: (cookieName?: string) => number | string | undefined;
}

function toMilliseconds(seconds?: number | string): number {
  if (!seconds) return -1;
  else return Number(seconds) * 1000;
}
