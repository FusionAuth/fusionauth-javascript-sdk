/** A class responsible for storing a redirect value in localStorage and cleanup afterward. */
export class RedirectHelper {
  private readonly REDIRECT_VALUE = 'fa-sdk-redirect-value';
  private get storage(): Storage {
    try {
      return localStorage;
    } catch {
      // fallback for non-browser environments where localStorage is not defined.
      return {
        /* eslint-disable */
        setItem(_key: string, _value: string) {},
        getItem(_key: string) {},
        removeItem(_key: string) {},
        /* eslint-enable */
      } as Storage;
    }
  }

  handlePreRedirect(state?: string) {
    const valueForStorage = `${this.generateRandomString()}:${state ?? ''}`;
    this.storage.setItem(this.REDIRECT_VALUE, valueForStorage);
  }

  handlePostRedirect(callback?: (state?: string) => void) {
    const didRedirect = Boolean(this.storage.getItem(this.REDIRECT_VALUE));
    if (!didRedirect) {
      return;
    }

    const state = this.state;
    callback?.(state);
    this.storage.removeItem(this.REDIRECT_VALUE);
  }

  private get state() {
    const redirectValue = this.storage.getItem(this.REDIRECT_VALUE);

    if (!redirectValue) {
      return;
    }

    const [, ...stateValue] = redirectValue.split(':');
    return stateValue.join(':') || undefined;
  }

  private generateRandomString() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, (n: number) =>
      ('0' + n.toString(16)).substring(-2),
    ).join('');
  }
}
