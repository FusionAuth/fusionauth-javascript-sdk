/**
 * A class responsible for storing pre-redirect values in localStorage and
 * cleaning them up afterward.
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
   * before a redirect is initiated, for hosted backend mode.
   *
   * Format: a plain string `${randomNonce}:${state ?? ''}`.
   *
   * @param state  Optional OAuth2 state string echoed back post-login.
   */
  handlePreRedirect(state?: string) {
    const valueForStorage = `${this.generateRandomString()}:${state ?? ''}`;
    this.storage.setItem(this.REDIRECT_VALUE, valueForStorage);
  }

  /**
   * Persists a redirect marker for DPoP mode: the PKCE `code_verifier`, an
   * optional caller-supplied `state`, and a freshly generated
   * `transactionState`, all as a JSON object.
   *
   * `transactionState` — not the caller's `state` — must be sent as the
   * OAuth2 `state` parameter on the `/oauth2/authorize` (or `/oauth2/register`)
   * request, and is what {@link getTransactionState} returns for verifying
   * the value FusionAuth echoes back on redirect. The caller's own `state`
   * may be predictable, absent, or attacker-influenced, so it cannot serve
   * as the CSRF defense described in RFC 6749 section 10.12 — a distinct,
   * unguessable SDK-generated value is required for that.
   *
   * @param codeVerifier  PKCE `code_verifier` for the pending exchange.
   * @param state         Optional caller-supplied state, returned as-is to
   *                       the {@link handlePostRedirect} callback.
   * @returns The generated `transactionState` to send as the OAuth2 `state`
   *          parameter.
   */
  handlePreDpopRedirect(codeVerifier: string, state?: string): string {
    const transactionState = this.generateRandomString();
    this.storage.setItem(
      this.REDIRECT_VALUE,
      JSON.stringify({ codeVerifier, transactionState, state }),
    );
    return transactionState;
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
   * Removes `code` from the current URL, leaving other query params intact.
   */
  clearCodeFromUrl(): void {
    const { origin, pathname, search, hash } = window.location;
    const url = new URL(`${origin}${pathname}${search}${hash}`);
    url.searchParams.delete('code');
    window.history.replaceState(null, '', url.toString());
  }

  /**
   * Returns the PKCE `code_verifier` that was persisted by
   * {@link handlePreDpopRedirect}, or `undefined` if none was stored (hosted
   * backend mode) or if no redirect has been initiated.
   */
  getCodeVerifier(): string | undefined {
    const raw = this.storage.getItem(this.REDIRECT_VALUE);
    if (!raw) return undefined;

    return this.parseStoredValue(raw).codeVerifier;
  }

  /**
   * Returns the `state` value persisted by {@link handlePreRedirect} or
   * {@link handlePreDpopRedirect}, or `undefined` if none was stored or no
   * redirect has been initiated.
   */
  getState(): string | undefined {
    const raw = this.storage.getItem(this.REDIRECT_VALUE);
    if (!raw) return undefined;

    return this.parseStoredValue(raw).state;
  }

  /**
   * Returns the `transactionState` persisted by {@link handlePreDpopRedirect},
   * or `undefined` if none was stored (hosted backend mode) or if no redirect
   * has been initiated.
   *
   * Compare this against the `state` query parameter FusionAuth echoes back
   * on redirect to guard against CSRF — do not use {@link getState} for this,
   * since it returns the caller's own (possibly predictable) `state` value.
   */
  getTransactionState(): string | undefined {
    const raw = this.storage.getItem(this.REDIRECT_VALUE);
    if (!raw) return undefined;

    return this.parseStoredValue(raw).transactionState;
  }

  /**
   * Parses a raw stored value for either mode.
   */
  private parseStoredValue(raw: string): {
    codeVerifier?: string;
    transactionState?: string;
    state?: string;
  } {
    if (raw.startsWith('{')) {
      // DPoP mode
      const parsed = JSON.parse(raw) as {
        codeVerifier?: string;
        transactionState?: string;
        state?: string;
      };
      return {
        codeVerifier: parsed.codeVerifier || undefined,
        transactionState: parsed.transactionState || undefined,
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
