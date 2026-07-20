/**
 * A class responsible for storing pre-redirect values in localStorage and
 * cleaning them up afterward.
 *
 * Storage format: `${randomNonce}:${codeVerifier ?? ''}:${state ?? ''}`
 *
 * - `randomNonce`   — prevents replay; marks that a redirect was initiated.
 * - `codeVerifier`  — PKCE `code_verifier` persisted for DPoP token exchange
 *                     (ENG-4800). Empty string when not in DPoP mode.
 * - `state`         — optional caller-supplied OAuth2 state value. May contain
 *                     colons; retrieved by skipping the nonce and codeVerifier
 *                     segments (indices 0 and 1) and joining all remaining
 *                     segments (index 2 onward) with `:`.
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
   * Persists a redirect marker, an optional PKCE `code_verifier`, and an
   * optional `state` value to localStorage before a redirect is initiated.
   *
   * @param state         Optional OAuth2 state string echoed back post-login.
   * @param codeVerifier  Optional PKCE `code_verifier` (DPoP mode only).
   */
  handlePreRedirect(state?: string, codeVerifier?: string) {
    const valueForStorage = `${this.generateRandomString()}:${codeVerifier ?? ''}:${state ?? ''}`;
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

  /**
   * Returns the PKCE `code_verifier` that was persisted by
   * {@link handlePreRedirect}, or `undefined` if none was stored (cookie mode)
   * or if no redirect has been initiated.
   */
  getCodeVerifier(): string | undefined {
    const raw = this.storage.getItem(this.REDIRECT_VALUE);
    if (!raw) return undefined;

    // Format: randomNonce:codeVerifier:state
    const firstColon = raw.indexOf(':');
    if (firstColon === -1) return undefined;

    const afterNonce = raw.slice(firstColon + 1);
    const secondColon = afterNonce.indexOf(':');
    if (secondColon === -1) return undefined;

    const verifier = afterNonce.slice(0, secondColon);
    return verifier || undefined;
  }

  private get state() {
    const redirectValue = this.storage.getItem(this.REDIRECT_VALUE);
    if (!redirectValue) return undefined;

    // Format: randomNonce:codeVerifier:state
    // Skip the nonce segment and the codeVerifier segment; join remainder with
    // ':' to correctly reconstruct state values that themselves contain colons.
    const [, , ...stateSegments] = redirectValue.split(':');
    return stateSegments.join(':') || undefined;
  }

  private generateRandomString() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, (n: number) =>
      ('0' + n.toString(16)).substring(-2),
    ).join('');
  }
}
