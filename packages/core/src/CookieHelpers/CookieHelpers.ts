/**
 * Parses document.cookie for the access token expiration cookie value.
 * @returns {(number | null)} The moment of expiration in milliseconds since epoch.
 */
export function getAccessTokenExpirationMoment(
  cookieName: string = 'app.at_exp',
): number | null {
  const expCookie = document.cookie
    .split('; ')
    .map(c => c.split('='))
    .find(([name]) => name === cookieName);
  const cookieValue = expCookie?.[1];
  return cookieValue ? parseInt(cookieValue) * 1000 : null;
}
