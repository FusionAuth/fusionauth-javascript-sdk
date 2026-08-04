import * as dpop from 'dpop';
import type { KeyPair } from 'dpop';

import { DPoPStorage } from './DPoPStorage';
import { DPoPTokenStore, DPoPTokens } from './DPoPTokenStore';

/** Duck-types `Request` instead of `instanceof Request` */
function isRequestLike(input: unknown): input is Request {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof (input as Request).clone === 'function' &&
    typeof (input as Request).headers === 'object' &&
    typeof (input as Request).url === 'string' &&
    typeof (input as Request).method === 'string'
  );
}

/**
 * Central coordinator for all DPoP operations.
 *
 * `SDKCore` constructs a `DPoPManager` instance when `useDpop: true`. Framework
 * layers hold a reference to expose `dpopFetch` and `generateProof`.
 */
export class DPoPManager {
  private readonly tokenStore: DPoPTokenStore;
  private readonly storage: DPoPStorage;

  /** In-memory nonce cache keyed by origin (e.g. `https://api.example.com`). */
  private readonly nonces = new Map<string, string>();

  /**
   * Memoised promise for the active key pair. A single `Promise` is shared so
   * concurrent callers all await the same generation/load and the key pair is
   * never regenerated within the lifetime of a `DPoPManager` instance (unless
   * `clear()` is called).
   */
  private keyPairPromise: Promise<KeyPair> | undefined;

  constructor(
    clientId: string,
    tokenStorage: 'localStorage' | 'memory' = 'localStorage',
  ) {
    this.storage = new DPoPStorage({ clientId });
    this.tokenStore = new DPoPTokenStore(clientId, tokenStorage);
  }

  /**
   * Loads the persisted `CryptoKeyPair` from `DPoPStorage`, or generates a new
   * non-extractable ES256 key pair and persists it. Lazy — called on first DPoP
   * operation. Subsequent calls return the memoised result immediately.
   */
  async getOrCreateKeyPair(): Promise<KeyPair> {
    if (!this.keyPairPromise) {
      this.keyPairPromise = (async () => {
        const existing = await this.storage.getKeyPair();
        if (existing) return existing;

        const keyPair = await dpop.generateKeyPair('ES256', {
          extractable: false,
        });
        await this.storage.setKeyPair(keyPair);
        return keyPair;
      })();
    }
    return this.keyPairPromise;
  }

  /**
   * Computes the JWK SHA-256 thumbprint of the public key via
   * `dpop.calculateThumbprint()`. Used for the `dpop_jkt` parameter on
   * `/oauth2/authorize`.
   */
  async getThumbprint(): Promise<string> {
    const { publicKey } = await this.getOrCreateKeyPair();
    return dpop.calculateThumbprint(publicKey);
  }

  /**
   * `true` when stored tokens exist and have not yet expired. Used by
   * `SDKCore.isLoggedIn` in DPoP mode instead of the `app.at_exp` cookie.
   */
  get isLoggedIn(): boolean {
    return !this.tokenStore.isExpired;
  }

  /**
   * Stores a new set of DPoP-bound tokens. Called by `SDKCore` after a
   * successful authorization code exchange or token refresh.
   */
  setTokens(tokens: DPoPTokens): void {
    this.tokenStore.set(tokens);
  }

  /**
   * Returns the stored refresh token string, or `null` if none is stored.
   * Used by `SDKCore.refreshToken()` in DPoP mode.
   */
  getRefreshToken(): string | null {
    return this.tokenStore.get()?.refreshToken ?? null;
  }

  /**
   * Returns the stored access token string, or `null` if none is stored.
   */
  getAccessToken(): string | null {
    return this.tokenStore.getAccessToken();
  }

  /**
   * Returns the expiration moment (ms since epoch) of the stored access
   * token, or `-1` if no tokens are stored. Mirrors the `-1` convention used
   * by `CookieHelpers.getAccessTokenExpirationMoment()` so `SDKCore` can
   * schedule token expiration / auto-refresh identically in both modes.
   */
  getExpiresAt(): number | -1 {
    return this.tokenStore.get()?.expiresAt ?? -1;
  }

  /**
   * Generates a signed DPoP proof JWT.
   *
   * - `ath` (access token hash) is included only when `accessToken` is provided.
   * - Nonce precedence: explicit `nonce` argument → cached nonce for the target
   *   origin → `undefined` (no nonce claim).
   * - Per RFC 9449, `htu` is normalised by stripping any query string and
   *   fragment (e.g. `Request.url` may include a query string), and `htm` is
   *   normalised to uppercase (DPoP verifiers commonly require this).
   *
   * @param htu          HTTP URI of the request. Any query/fragment is stripped.
   * @param htm          HTTP method of the request (e.g. `'POST'`). Case-insensitive.
   * @param accessToken  Optional access token; when provided, `ath` is included.
   * @param nonce        Optional explicit nonce; overrides the per-origin cache.
   */
  async generateProof(
    htu: string,
    htm: string,
    accessToken?: string,
    nonce?: string,
  ): Promise<string> {
    const keyPair = await this.getOrCreateKeyPair();

    // Per RFC 9449, htu MUST NOT include the query or fragment components.
    // Relative URLs (e.g. `/api/data`) are resolved against the current
    // origin, since `dpopFetch()` accepts them.
    const base =
      typeof window !== 'undefined' ? window.location.origin : undefined;
    const url = new URL(htu, base);
    const normalizedHtu = `${url.origin}${url.pathname}`;
    const normalizedHtm = htm.toUpperCase();

    // Resolve the nonce: explicit arg wins, then fall back to per-origin cache.
    const effectiveNonce = nonce ?? this.nonces.get(url.origin) ?? undefined;

    return dpop.generateProof(
      keyPair,
      normalizedHtu,
      normalizedHtm,
      effectiveNonce,
      accessToken,
    );
  }

  /**
   * The `dpopFetch` implementation.
   *
   * 1. Retrieves the stored access token from `DPoPTokenStore`.
   * 2. Generates a DPoP proof (with `ath` when an access token is available).
   * 3. Sets `Authorization: DPoP <token>` and `DPoP: <proof>` on the request.
   * 4. Calls the native `fetch`.
   * 5. On a `401` whose `WWW-Authenticate` header contains `use_dpop_nonce`
   *    **and** whose `DPoP-Nonce` response header is present, caches the nonce
   *    and retries the request exactly once. A second `401` is returned as-is.
   */
  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Request bodies can only be read once. If `input` is a Request, clone it
    // twice up front — before either clone is read from — so the initial
    // attempt and a potential retry each get an independent, unconsumed body.
    // Request.clone() safely tees any internal streaming body per spec, so
    // this also covers a Request constructed with a ReadableStream body.
    const primaryInput = isRequestLike(input) ? input.clone() : input;
    const retryInput = isRequestLike(input) ? input.clone() : input;

    const response = await this._doFetch(primaryInput, init);

    if (response.status === 401 && this._isUseNonceError(response)) {
      // A raw ReadableStream passed via init.body (not wrapped in a Request)
      // cannot be safely reused for a retry — it's single-read and there is
      // no Request object to clone. Fail clearly rather than let native
      // fetch throw an opaque "body already used" error on the retry.
      if (!isRequestLike(input) && init?.body instanceof ReadableStream) {
        throw new Error(
          'DPoPManager.fetch() received a use_dpop_nonce challenge but cannot ' +
            'automatically retry because init.body is a ReadableStream (single-use). ' +
            'Pass the body as a string, Blob, ArrayBuffer, or FormData instead, or ' +
            'handle the nonce retry manually for streaming request bodies.',
        );
      }

      // Cache the server-provided nonce for this origin.
      const htu = this._resolveUrl(input);
      const origin = new URL(htu).origin;
      const serverNonce = response.headers.get('DPoP-Nonce')!;
      this.nonces.set(origin, serverNonce);

      // Single retry — return the result regardless of status.
      return this._doFetch(retryInput, init);
    }

    return response;
  }

  /**
   * Clears all DPoP state:
   * - Key pair from `DPoPStorage`
   * - Tokens from `DPoPTokenStore`
   * - In-memory nonce cache
   *
   * The memoised key-pair promise is also reset so the next call to
   * `getOrCreateKeyPair()` generates a fresh key pair. Called on logout.
   */
  async clear(): Promise<void> {
    this.keyPairPromise = undefined;
    this.nonces.clear();
    await Promise.all([this.storage.clearKeyPair(), this.tokenStore.clear()]);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Builds the request with DPoP headers and delegates to native `fetch`. */
  private async _doFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const htu = this._resolveUrl(input);
    const htm = this._resolveMethod(input, init);
    const accessToken = this.tokenStore.getAccessToken();

    const proof = await this.generateProof(htu, htm, accessToken ?? undefined);

    // Merge headers: start from any existing headers on the request/init, then
    // layer in the DPoP-specific ones so we never silently drop caller headers.
    const headers = this._resolveHeaders(input, init);
    if (accessToken) {
      headers.set('Authorization', `DPoP ${accessToken}`);
    }
    headers.set('DPoP', proof);

    return globalThis.fetch(input, { ...init, headers });
  }

  /** Returns `true` when the response signals a DPoP nonce retry is warranted */
  private _isUseNonceError(response: Response): boolean {
    const wwwAuth = response.headers.get('WWW-Authenticate') ?? '';
    return (
      wwwAuth.includes('use_dpop_nonce') && response.headers.has('DPoP-Nonce')
    );
  }

  /** Extracts the URL string from any of the three allowed `fetch` input shapes. */
  private _resolveUrl(input: RequestInfo | URL): string {
    if (isRequestLike(input)) {
      return input.url;
    }
    return input.toString();
  }

  /** Extracts the HTTP method from the request/init, defaulting to `'GET'`. */
  private _resolveMethod(input: RequestInfo | URL, init?: RequestInit): string {
    if (init?.method) return init.method.toUpperCase();
    if (isRequestLike(input) && input.method) return input.method.toUpperCase();
    return 'GET';
  }

  /**
   * Merges headers from `init.headers` and, if `input` is a `Request`, its
   * own headers — so callers never lose headers regardless of which of the
   * two allowed places they set them on. When the same header name appears
   * in both, the `Request`'s value wins, since a caller who went to the
   * trouble of building a `Request` object with specific headers most likely
   * intended those to be authoritative.
   */
  private _resolveHeaders(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Headers {
    // Base: init.headers (lowest precedence).
    const headers = new Headers(init?.headers);

    // Overlay: Request.headers wins on any conflicting header name.
    if (isRequestLike(input)) {
      input.headers.forEach((value, key) => headers.set(key, value));
    }

    return headers;
  }
}
