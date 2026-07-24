/**
 * A class responsible for storing pre-redirect values in localStorage and
 * cleaning them up afterward.
 *
 * Two storage formats are used under the same `fa-sdk-redirect-value` key,
 * discriminated by content:
 *
 * - Hosted backend mode: a plain string `${randomNonce}:${state ?? ''}`
 *
 * - DPoP mode: a JSON object `{ codeVerifier, state }`
 */
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
        getItem(_key: string) {
          return null;
        },
        removeItem(_key: string) {},
        /* eslint-enable */
      } as Storage;
    }
  }

  /**
   * Persists a redirect marker and an optional `state` value to localStorage
   * before a redirect is initiated. When `codeVerifier` is provided (DPoP
   * mode), it is persisted alongside `state` as a JSON object instead of the
   * plain colon-delimited string used by hosted backend mode.
   *
   * @param state         Optional OAuth2 state string echoed back post-login.
   * @param codeVerifier  Optional PKCE `code_verifier` (DPoP mode only).
   */
  handlePreRedirect(state?: string, codeVerifier?: string) {
    const valueForStorage =
      codeVerifier !== undefined
        ? JSON.stringify({ codeVerifier, state })
        : `${this.generateRandomString()}:${state ?? ''}`;
    this.storage.setItem(this.REDIRECT_VALUE, valueForStorage);
  }

  handlePostRedirect(callback?: (state?: string) => void) {
    const raw = this.storage.getItem(this.REDIRECT_VALUE);
    if (!raw) {
      return;
    }

    callback?.(this.parseState(raw));
    this.storage.removeItem(this.REDIRECT_VALUE);
  }

  /**
   * Returns the PKCE `code_verifier` that was persisted by
   * {@link handlePreRedirect}, or `undefined` if none was stored (hosted
   * backend mode) or if no redirect has been initiated.
   */
  getCodeVerifier(): string | undefined {
    const raw = this.storage.getItem(this.REDIRECT_VALUE);
    if (!raw) return undefined;

    try {
      const parsed = JSON.parse(raw) as { codeVerifier?: string };
      return parsed.codeVerifier || undefined;
    } catch {
      // Hosted backend mode's plain string format never carries a verifier.
      return undefined;
    }
  }

  /**
   * Reconstructs the `state` value from a raw stored value, regardless of
   * which format (DPoP JSON or hosted-backend plain string).
   */
  private parseState(raw: string): string | undefined {
    try {
      const parsed = JSON.parse(raw) as { state?: string };
      return parsed.state ?? undefined;
    } catch {
      // Hosted backend mode format: randomNonce:state (state may itself
      // contain colons; rejoin the remainder to preserve them).
      const [, ...stateValue] = raw.split(':');
      return stateValue.join(':') || undefined;
    }
  }

  private generateRandomString() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, (n: number) =>
      ('0' + n.toString(16)).substring(-2),
    ).join('');
  }
}
