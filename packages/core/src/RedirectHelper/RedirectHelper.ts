/** A class responsible for storing a redirect value in localStorage and cleanup afterward. */
export class RedirectHelper {
  private readonly REDIRECT_VALUE = 'fa-sdk-redirect-value';

  handlePreRedirect(state?: string) {
    const valueForStorage = `${this.generateRandomString()}:${state ?? ''}`;
    localStorage.setItem(this.REDIRECT_VALUE, valueForStorage);
  }

  handlePostRedirect(callback?: (state?: string) => void) {
    const stateValue = this.stateValue ?? undefined;
    callback?.(stateValue);
    localStorage.removeItem(this.REDIRECT_VALUE);
  }

  get didRedirect() {
    return Boolean(localStorage.getItem(this.REDIRECT_VALUE));
  }

  private get stateValue() {
    const redirectValue = localStorage.getItem(this.REDIRECT_VALUE);

    if (!redirectValue) {
      return null;
    }

    const [, ...stateValue] = redirectValue.split(':');
    return stateValue.join(':');
  }

  private generateRandomString() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, (n: number) =>
      ('0' + n.toString(16)).substring(-2),
    ).join('');
  }
}