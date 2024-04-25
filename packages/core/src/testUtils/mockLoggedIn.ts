/** Sets `app.at_exp` moment cookie so the user will be logged in for 1 hour. */
function mockIsLoggedIn() {
  const expirationMoment = new Date();
  expirationMoment.setHours(expirationMoment.getHours() + 1);
  const oneHourInTheFutureInMilliseconds = expirationMoment.getTime() / 1000;
  document.cookie = `app.at_exp=${oneHourInTheFutureInMilliseconds}`;
}

/** Removes the `app.at_exp` cookie. */
function removeAt_expCookie() {
  document.cookie = 'app.at_exp' + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export { mockIsLoggedIn, removeAt_expCookie };
