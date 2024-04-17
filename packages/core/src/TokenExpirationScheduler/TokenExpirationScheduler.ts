/** A class responsible for scheduling a callback to be invoked at the moment on access token expiration */
export class TokenExpirationScheduler {
  /**
   * Schedules a callback to be invoked at the given moment.
   * @param expirationMoment - the access token expiration moment in milliseconds since the epoch.
   * @param onExpiration - the callback to be invoked at the `expirationMoment`.
   */
  static scheduleTokenExpirationCallback(
    expirationMoment: number,
    onExpiration: () => void,
  ) {
    const now = new Date().getTime();
    const millisecondsTillExpiration = expirationMoment - now;

    if (millisecondsTillExpiration > 0) {
      setTimeout(onExpiration, millisecondsTillExpiration);
    }
  }
}
