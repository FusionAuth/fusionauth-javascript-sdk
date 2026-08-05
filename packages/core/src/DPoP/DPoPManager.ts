import * as dpop from 'dpop';
import type { KeyPair } from 'dpop';

import { DPoPStorage } from './DPoPStorage';
import { DPoPTokenStore, DPoPTokens } from './DPoPTokenStore';
import { UrlHelper } from '../UrlHelper';
import { RedirectHelper } from '../RedirectHelper';
import * as Pkce from '../Pkce';

/**
 * Central coordinator for all DPoP operations.
 *
 * `SDKCore` constructs a `DPoPManager` instance when `useDpop: true`. Framework
 * layers hold a reference to expose `dpopFetch` and `generateProof`.
 */
export class DPoPManager {
  private readonly tokenStore: DPoPTokenStore;
  private readonly storage: DPoPStorage;
  private readonly urlHelper: UrlHelper;
  private readonly redirectHelper: RedirectHelper;

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
    urlHelper: UrlHelper,
    redirectHelper: RedirectHelper,
    tokenStorage: 'localStorage' | 'memory' = 'localStorage',
  ) {
    this.storage = new DPoPStorage({ clientId });
    this.tokenStore = new DPoPTokenStore(clientId, tokenStorage);
    this.urlHelper = urlHelper;
    this.redirectHelper = redirectHelper;
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
    // Normalise into a single Request object up front, then clone it twice —
    // before either clone is read from — so the initial attempt and a
    // potential retry each get an independent, unconsumed body.
    // Request.clone() safely tees any internal streaming body per spec, so
    // this covers Request objects, raw ReadableStream bodies passed via
    // init.body, and every other allowed `fetch` input shape uniformly.
    const request = this._buildWorkingRequest(input, init);
    const primaryRequest = request.clone();
    const retryRequest = request.clone();

    const response = await this._doFetch(primaryRequest);

    if (response.status === 401 && this._isUseNonceError(response)) {
      // Cache the server-provided nonce for this origin.
      const origin = new URL(request.url).origin;
      const serverNonce = response.headers.get('DPoP-Nonce')!;
      this.nonces.set(origin, serverNonce);

      // Single retry — return the result regardless of status.
      return this._doFetch(retryRequest);
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

  /**
   * Starts the authorization code grant flow.
   */
  async startLogin(state?: string): Promise<void> {
    await this.getOrCreateKeyPair();
    const dpopJkt = await this.getThumbprint();
    const codeVerifier = Pkce.generateCodeVerifier();
    const codeChallenge = await Pkce.generateCodeChallenge(codeVerifier);
    this.redirectHelper.handlePreRedirect(state, codeVerifier);
    window.location.assign(
      this.urlHelper.getAuthorizeUrl(dpopJkt, codeChallenge, state),
    );
  }

  /**
   * Performs the OAut2logout flow: clears the key pair, stored tokens, and
   * in-memory nonces, then redirects to `/oauth2/logout`.
   */
  async startLogout(): Promise<void> {
    try {
      await this.clear();
    } finally {
      window.location.assign(this.urlHelper.getOAuth2LogoutUrl());
    }
  }

  /**
   * Performs the register flow.
   */
  async startRegister(state?: string): Promise<void> {
    await this.getOrCreateKeyPair();
    const dpopJkt = await this.getThumbprint();
    const codeVerifier = Pkce.generateCodeVerifier();
    const codeChallenge = await Pkce.generateCodeChallenge(codeVerifier);
    this.redirectHelper.handlePreRedirect(state, codeVerifier);
    window.location.assign(
      this.urlHelper.getOAuth2RegisterUrl(dpopJkt, codeChallenge, state),
    );
  }

  /**
   * Performs the refresh token grant.
   * @throws {Error} if no refresh token is stored, or the request fails.
   */
  async refreshToken(): Promise<Response> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error(
        'No refresh token available. Have you called startLogin()?',
      );
    }

    const tokenUrl = this.urlHelper.getTokenUrl();
    const proof = await this.generateProof(tokenUrl.toString(), 'POST');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.urlHelper.clientId,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        DPoP: proof,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorDetails = {
        status: response.status,
        details:
          (await response.text()) ||
          'Failed to refresh fusionauth access token',
      };
      throw new Error(JSON.stringify(errorDetails));
    }

    const tokenResponse = await response.clone().json();
    this.setTokens(this.parseTokenResponse(tokenResponse, refreshToken));

    return response;
  }

  /**
   * Performs the authorization code exchange for tokens.
   */
  async handlePostRedirect(
    callback?: (state?: string) => void,
  ): Promise<Error | undefined> {
    const code = new URLSearchParams(window.location.search).get('code');
    const codeVerifier = this.redirectHelper.getCodeVerifier();

    // No pending exchange
    if (!code || !codeVerifier) {
      return undefined;
    }

    // CSRF protection: the `state` echoed back on the redirect must match
    // what was persisted before redirecting.
    const returnedState =
      new URLSearchParams(window.location.search).get('state') ?? undefined;
    if (returnedState !== this.redirectHelper.getState()) {
      return new Error(
        'FusionAuth SDK: state parameter mismatch. Aborting to prevent a possible CSRF attack.',
      );
    }

    try {
      const tokenUrl = this.urlHelper.getTokenUrl();
      const proof = await this.generateProof(tokenUrl.toString(), 'POST');

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        client_id: this.urlHelper.clientId,
        redirect_uri: this.urlHelper.redirectUri,
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          DPoP: proof,
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorDetails = {
          status: response.status,
          details:
            (await response.text()) ||
            'Failed to exchange authorization code for tokens',
        };
        return new Error(JSON.stringify(errorDetails));
      }

      const tokenResponse = await response.json();
      const tokens = this.parseTokenResponse(tokenResponse);
      this.setTokens(tokens);

      this.redirectHelper.clearCodeFromUrl();
      this.redirectHelper.handlePostRedirect(callback);
      return undefined;
    } catch (error) {
      return error as Error;
    }
  }

  /**
   * Fetches userInfo from `/oauth2/userinfo`.
   * @throws {Error} if no access token is stored, or the request fails.
   */
  async fetchUserInfo<T>(): Promise<T> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error(
        'No access token available. Have you called startLogin()?',
      );
    }

    const userInfoResponse = await this.fetch(this.urlHelper.getUserInfoUrl());

    if (!userInfoResponse.ok) {
      throw new Error(
        `Unable to fetch userInfo. Request failed with status code ${userInfoResponse?.status}`,
      );
    }

    return (await userInfoResponse.json()) as T;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Builds the request with DPoP headers and delegates to native `fetch`. */
  private async _doFetch(request: Request): Promise<Response> {
    const accessToken = this.tokenStore.getAccessToken();
    const proof = await this.generateProof(
      request.url,
      request.method,
      accessToken ?? undefined,
    );

    // Request.headers is a live, mutable Headers instance — set the
    // DPoP-specific headers directly on it rather than reconstructing.
    if (accessToken) {
      request.headers.set('Authorization', `DPoP ${accessToken}`);
    }
    request.headers.set('DPoP', proof);

    return globalThis.fetch(request);
  }

  /** Returns `true` when the response signals a DPoP nonce retry is warranted */
  private _isUseNonceError(response: Response): boolean {
    const wwwAuth = response.headers.get('WWW-Authenticate') ?? '';
    return (
      wwwAuth.includes('use_dpop_nonce') && response.headers.has('DPoP-Nonce')
    );
  }

  /**
   * Normalises any allowed `fetch()` input shape into a single `Request`
   * object, merging headers from both `input` (when it's a `Request`) and
   * `init` so neither source is silently dropped.
   *
   * When `input` is a `Request`, it is cloned before being passed to the
   * `Request` constructor — constructing `new Request(existingRequest, ...)`
   * disturbs (locks) `existingRequest`'s body as a side effect, and cloning
   * first ensures we never disturb the caller's own `Request` object.
   *
   * Header precedence matches the previous implementation: `input`'s own
   * headers win over `init.headers` on a conflicting header name. This is
   * necessary because `new Request(existingRequest, init)` replaces —
   * rather than merges — headers when `init.headers` is present, which
   * would otherwise silently drop headers unique to `input`.
   */
  private _buildWorkingRequest(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Request {
    if (!(input instanceof Request)) {
      return new Request(input, init);
    }

    const headers = new Headers(init?.headers);
    input.headers.forEach((value, key) => headers.set(key, value));
    return new Request(input.clone(), { ...init, headers });
  }

  /**
   * Validates a `/oauth2/token` response.
   */
  private parseTokenResponse(
    tokenResponse: {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
    },
    fallbackRefreshToken?: string,
  ): DPoPTokens {
    if (tokenResponse.token_type !== 'DPoP') {
      throw new Error(
        `FusionAuth SDK: expected token_type "DPoP" but received "${tokenResponse.token_type}".`,
      );
    }
    if (
      typeof tokenResponse.expires_in !== 'number' ||
      !Number.isFinite(tokenResponse.expires_in) ||
      tokenResponse.expires_in <= 0
    ) {
      throw new Error(
        `FusionAuth SDK: invalid expires_in "${tokenResponse.expires_in}" in token response.`,
      );
    }

    return {
      accessToken: tokenResponse.access_token!,
      refreshToken: tokenResponse.refresh_token ?? fallbackRefreshToken,
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
      tokenType: 'DPoP',
    };
  }
}
