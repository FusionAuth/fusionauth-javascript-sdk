/**
 * A class responsible for storing pre-redirect values in localStorage and
 * cleaning them up afterward.
 *
 * Two storage formats are used under the same `fa-sdk-redirect-value` key,
 * discriminated by content (never by an explicit flag):
 *
 * - Hosted backend mode (no `codeVerifier`): a plain string
 *   `${randomNonce}:${state ?? ''}` — unchanged since before DPoP support
 *   was added, so no legacy-format handling is needed for this mode. Every
 *   published SDK version has always written exactly this format.
 * - DPoP mode (`codeVerifier` provided): a JSON object
 *   `{ codeVerifier, state }`. A hosted-backend-mode string never starts
 *   with `{` (it always starts with hex nonce characters), so the two
 *   formats can never be confused with one another.
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
    const isDpopMode = codeVerifier !== undefined;
    const valueForStorage = isDpopMode
      ? JSON.stringify({ codeVerifier, state })
      : `${this.generateRandomString()}:${state ?? ''}`;
    this.storage.setItem(this.REDIRECT_VALUE, valueForStorage);
  }

  handlePostRedirect(callback?: (state?: string) => void) {
    const raw = this.storage.getItem(this.REDIRECT_VALUE);
    if (!raw) {
      return;
    }

    callback?.(this.parseStoredValue(raw).state);
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

    return this.parseStoredValue(raw).codeVerifier;
  }

  /**
   * Parses a raw stored value from either format into its component parts.
   *
   * DPoP mode values are JSON objects, always starting with `{`. Hosted
   * backend mode values are the plain `randomNonce:state` string, which
   * never starts with `{`. This check is a cheap, deterministic format sniff
   * rather than relying on a caught `JSON.parse` failure — hosted backend
   * mode calls this on every single redirect, so treating that as the
   * "exceptional" path isn't appropriate.
   */
  private parseStoredValue(raw: string): {
    codeVerifier?: string;
    state?: string;
  } {
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw) as {
        codeVerifier?: string;
        state?: string;
      };
      return {
        codeVerifier: parsed.codeVerifier || undefined,
        state: parsed.state ?? undefined,
      };
    }

    // Hosted backend mode format: randomNonce:state (state may itself
    // contain colons; rejoin the remainder to preserve them).
    const [, ...stateValue] = raw.split(':');
    return { state: stateValue.join(':') || undefined };
  }

  private generateRandomString() {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, (n: number) =>
      ('0' + n.toString(16)).substring(-2),
    ).join('');
  }
}
