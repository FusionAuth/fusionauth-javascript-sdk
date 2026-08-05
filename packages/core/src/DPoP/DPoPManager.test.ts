// @vitest-environment node
// dpop's generateProof uses TextEncoder internally. The jsdom environment
// polyfills TextEncoder in a way that its output lacks Uint8Array.prototype
// methods (e.g. subarray), causing dpop's base64url encoder to throw. The
// node environment has a spec-compliant TextEncoder, so we use it here.
// DPoPStorage uses fake-indexeddb to stand in for the missing IndexedDB global.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';

import { DPoPManager } from './DPoPManager';
import { DPoPTokens } from './DPoPTokenStore';
import { UrlHelper } from '../UrlHelper';
import { RedirectHelper } from '../RedirectHelper';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CLIENT_ID = 'test-client';
const SERVER_URL = 'https://auth.example.com';
const REDIRECT_URI = 'https://app.example.com/callback';
const RESOURCE_URL = 'https://api.example.com/data';

/** Decode the payload of a JWT without verifying the signature. */
function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const [, payloadB64] = jwt.split('.');
  // base64url → base64 → JSON
  const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(json) as Record<string, unknown>;
}

function makeTokens(overrides?: Partial<DPoPTokens>): DPoPTokens {
  return {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresAt: Date.now() + 60_000,
    tokenType: 'DPoP',
    ...overrides,
  };
}

function makeUrlHelper(): UrlHelper {
  return new UrlHelper({
    serverUrl: SERVER_URL,
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
  });
}

function makeManager(
  tokenStorage: 'localStorage' | 'memory' = 'memory',
  urlHelper: UrlHelper = makeUrlHelper(),
  redirectHelper: RedirectHelper = new RedirectHelper(),
): DPoPManager {
  return new DPoPManager(CLIENT_ID, urlHelper, redirectHelper, tokenStorage);
}

/**
 * Stubs `window` with a minimal `location`/`history` so `startLogin()`,
 * `startLogout()`, `startRegister()`, and `handlePostRedirect()` — which
 * this file exercises in the `node` test environment where `window` is
 * otherwise undefined — can run. Returns the `assign`/`replaceState` spies.
 */
function stubWindow(search = '') {
  const assign = vi.fn();
  const replaceState = vi.fn();
  vi.stubGlobal('window', {
    location: {
      origin: 'https://app.example.com',
      pathname: '/callback',
      search,
      hash: '',
      assign,
    },
    history: { replaceState },
    // RedirectHelper.handlePreDpopRedirect()/handlePreRedirect() generate a
    // random string via window.crypto.getRandomValues().
    crypto: globalThis.crypto,
  });
  return { assign, replaceState };
}

/** Minimal `Response`-like stub that satisfies the fetch return contract. */
function makeResponse(
  status: number,
  headers: Record<string, string> = {},
  body?: string,
): Response {
  return new Response(body ?? null, { status, headers });
}

beforeEach(() => {
  // Provide a fresh in-process IndexedDB for each test so tests are isolated.
  // @ts-ignore — the node environment does not implement indexedDB; fake-indexeddb fills the gap.
  globalThis.indexedDB = new IDBFactory();
  // DPoPTokenStore accesses localStorage gracefully (returns null on error), but
  // setting up a minimal stub keeps the tests clean and explicit.
  if (typeof globalThis.localStorage === 'undefined') {
    const store: Record<string, string> = {};
    // @ts-ignore
    globalThis.localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
    };
  } else {
    localStorage.clear();
  }
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('getOrCreateKeyPair()', () => {
  it('generates and persists a key pair on the first call', async () => {
    const manager = makeManager();
    const keyPair = await manager.getOrCreateKeyPair();

    expect(keyPair).toBeDefined();
    expect(keyPair.privateKey.type).toBe('private');
    expect(keyPair.publicKey.type).toBe('public');
    expect(keyPair.privateKey.extractable).toBe(false);
  });

  it('returns the same key pair on a second call (memoised — no re-generation)', async () => {
    const manager = makeManager();
    const first = await manager.getOrCreateKeyPair();
    const second = await manager.getOrCreateKeyPair();

    // Reference equality: the memoised promise resolves to the same object.
    expect(second).toBe(first);
  });

  it('loads an existing key pair from DPoPStorage instead of generating a new one', async () => {
    // Pre-populate storage by running a full first manager to generate+persist.
    const seed = makeManager();
    const original = await seed.getOrCreateKeyPair();

    // A second manager sharing the same IndexedDB and clientId should load the
    // existing key pair rather than overwrite it.
    const manager = makeManager();
    const loaded = await manager.getOrCreateKeyPair();

    // The loaded key pair should have the same algorithm as the seeded one.
    expect(loaded.privateKey.algorithm).toStrictEqual(
      original.privateKey.algorithm,
    );
    expect(loaded.publicKey.algorithm).toStrictEqual(
      original.publicKey.algorithm,
    );
  });

  it('generates a fresh key pair after clear()', async () => {
    const manager = makeManager();
    const first = await manager.getOrCreateKeyPair();

    await manager.clear();

    const second = await manager.getOrCreateKeyPair();
    // After clear the promise is reset, so a new object is produced.
    expect(second).not.toBe(first);
  });
});

describe('generateProof()', () => {
  it('produces a well-formed DPoP proof JWT with correct htu and htm', async () => {
    const manager = makeManager();
    const proof = await manager.generateProof(RESOURCE_URL, 'GET');

    const payload = decodeJwtPayload(proof);
    expect(payload.htu).toBe(RESOURCE_URL);
    expect(payload.htm).toBe('GET');
  });

  it('strips the query string and fragment from htu per RFC 9449', async () => {
    const manager = makeManager();
    const urlWithQueryAndFragment = `${RESOURCE_URL}?foo=bar&baz=qux#section`;
    const proof = await manager.generateProof(urlWithQueryAndFragment, 'GET');

    const payload = decodeJwtPayload(proof);
    // htu must be normalised to the URL without query/fragment.
    expect(payload.htu).toBe(RESOURCE_URL);
  });

  it('normalises htm to uppercase regardless of caller casing', async () => {
    const manager = makeManager();
    const proof = await manager.generateProof(RESOURCE_URL, 'post');

    const payload = decodeJwtPayload(proof);
    expect(payload.htm).toBe('POST');
  });

  it('resolves a relative htu against window.location.origin instead of throwing', async () => {
    vi.stubGlobal('window', {
      location: { origin: 'https://app.example.com' },
    });
    const manager = makeManager();
    const proof = await manager.generateProof('/api/data', 'GET');

    const payload = decodeJwtPayload(proof);
    expect(payload.htu).toBe('https://app.example.com/api/data');
    vi.unstubAllGlobals();
  });

  it('includes ath claim when an accessToken is provided', async () => {
    const manager = makeManager();
    const proof = await manager.generateProof(
      RESOURCE_URL,
      'POST',
      'my-access-token',
    );

    const payload = decodeJwtPayload(proof);
    expect(payload.ath).toBeDefined();
    // ath must be a non-empty string (base64url-encoded SHA-256 hash)
    expect(typeof payload.ath).toBe('string');
    expect((payload.ath as string).length).toBeGreaterThan(0);
  });

  it('omits ath when no accessToken is provided', async () => {
    const manager = makeManager();
    const proof = await manager.generateProof(RESOURCE_URL, 'GET');

    const payload = decodeJwtPayload(proof);
    expect(payload.ath).toBeUndefined();
  });

  it('includes nonce from the in-memory cache for the matching origin', async () => {
    const manager = makeManager();

    // Trigger a 401/use_dpop_nonce cycle via fetch() to populate the cache.
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        makeResponse(401, {
          'WWW-Authenticate': 'DPoP error="use_dpop_nonce"',
          'DPoP-Nonce': 'server-nonce-abc',
        }),
      )
      .mockResolvedValueOnce(makeResponse(200));

    await manager.fetch(RESOURCE_URL);

    // Now call generateProof directly — the nonce should come from the cache.
    const proof = await manager.generateProof(RESOURCE_URL, 'GET');
    const payload = decodeJwtPayload(proof);
    expect(payload.nonce).toBe('server-nonce-abc');
  });

  it('explicit nonce argument overrides the per-origin cache', async () => {
    const manager = makeManager();

    // Seed a cached nonce via a 401 retry.
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        makeResponse(401, {
          'WWW-Authenticate': 'DPoP error="use_dpop_nonce"',
          'DPoP-Nonce': 'cached-nonce',
        }),
      )
      .mockResolvedValueOnce(makeResponse(200));

    await manager.fetch(RESOURCE_URL);

    const proof = await manager.generateProof(
      RESOURCE_URL,
      'GET',
      undefined,
      'explicit-nonce',
    );
    const payload = decodeJwtPayload(proof);
    expect(payload.nonce).toBe('explicit-nonce');
  });

  it('omits nonce when none is cached and no explicit nonce is provided', async () => {
    const manager = makeManager();
    const proof = await manager.generateProof(RESOURCE_URL, 'GET');

    const payload = decodeJwtPayload(proof);
    expect(payload.nonce).toBeUndefined();
  });
});

describe('fetch()', () => {
  it('sets DPoP header on outgoing requests', async () => {
    const manager = makeManager();
    let capturedHeaders: Headers | undefined;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
      capturedHeaders = (input as Request).headers;
      return makeResponse(200);
    });

    await manager.fetch(RESOURCE_URL);

    expect(capturedHeaders?.has('DPoP')).toBe(true);
    // The DPoP header value should be a three-part JWT.
    const dpopHeader = capturedHeaders!.get('DPoP')!;
    expect(dpopHeader.split('.').length).toBe(3);
  });

  it('sets Authorization: DPoP <token> when a stored access token exists', async () => {
    const manager = makeManager();
    manager.setTokens(makeTokens({ accessToken: 'stored-access-token' }));

    let capturedHeaders: Headers | undefined;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
      capturedHeaders = (input as Request).headers;
      return makeResponse(200);
    });

    await manager.fetch(RESOURCE_URL);

    expect(capturedHeaders?.get('Authorization')).toBe(
      'DPoP stored-access-token',
    );
  });

  it('does not set Authorization header when no token is stored', async () => {
    const manager = makeManager();
    let capturedHeaders: Headers | undefined;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
      capturedHeaders = (input as Request).headers;
      return makeResponse(200);
    });

    await manager.fetch(RESOURCE_URL);

    expect(capturedHeaders?.has('Authorization')).toBe(false);
  });

  it('preserves caller-provided headers alongside DPoP headers', async () => {
    const manager = makeManager();
    let capturedHeaders: Headers | undefined;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
      capturedHeaders = (input as Request).headers;
      return makeResponse(200);
    });

    await manager.fetch(RESOURCE_URL, {
      headers: { 'X-Custom-Header': 'custom-value' },
    });

    expect(capturedHeaders?.get('X-Custom-Header')).toBe('custom-value');
    expect(capturedHeaders?.has('DPoP')).toBe(true);
  });

  it('merges headers from both a Request object and init when both are provided', async () => {
    const manager = makeManager();
    let capturedHeaders: Headers | undefined;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
      capturedHeaders = (input as Request).headers;
      return makeResponse(200);
    });

    const request = new Request(RESOURCE_URL, {
      headers: { 'X-From-Request': 'request-value' },
    });

    await manager.fetch(request, {
      headers: { 'X-From-Init': 'init-value' },
    });

    // Both header sources must survive — neither is silently dropped.
    expect(capturedHeaders?.get('X-From-Request')).toBe('request-value');
    expect(capturedHeaders?.get('X-From-Init')).toBe('init-value');
    expect(capturedHeaders?.has('DPoP')).toBe(true);
  });

  it('Request headers win over init headers on a conflicting header name', async () => {
    const manager = makeManager();
    let capturedHeaders: Headers | undefined;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
      capturedHeaders = (input as Request).headers;
      return makeResponse(200);
    });

    const request = new Request(RESOURCE_URL, {
      headers: { 'X-Conflict': 'from-request' },
    });

    await manager.fetch(request, {
      headers: { 'X-Conflict': 'from-init' },
    });

    // The Request's value must win over the conflicting init.headers value.
    expect(capturedHeaders?.get('X-Conflict')).toBe('from-request');
  });

  describe('nonce retry', () => {
    it('retries exactly once on 401 + use_dpop_nonce + DPoP-Nonce header', async () => {
      const manager = makeManager();
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          makeResponse(401, {
            'WWW-Authenticate': 'DPoP error="use_dpop_nonce"',
            'DPoP-Nonce': 'server-nonce-xyz',
          }),
        )
        .mockResolvedValueOnce(makeResponse(200));

      const response = await manager.fetch(RESOURCE_URL);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(response.status).toBe(200);
    });

    it('includes the cached nonce in the retry proof', async () => {
      const manager = makeManager();
      const capturedProofs: string[] = [];

      vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
        const headers = (input as Request).headers;
        const proof = headers.get('DPoP');
        if (proof) capturedProofs.push(proof);

        if (capturedProofs.length === 1) {
          return makeResponse(401, {
            'WWW-Authenticate': 'DPoP error="use_dpop_nonce"',
            'DPoP-Nonce': 'retry-nonce-42',
          });
        }
        return makeResponse(200);
      });

      await manager.fetch(RESOURCE_URL);

      expect(capturedProofs.length).toBe(2);
      // The second (retry) proof must carry the server-supplied nonce.
      const retryPayload = decodeJwtPayload(capturedProofs[1]);
      expect(retryPayload.nonce).toBe('retry-nonce-42');
      // The first proof must NOT have had a nonce (cache was empty).
      const firstPayload = decodeJwtPayload(capturedProofs[0]);
      expect(firstPayload.nonce).toBeUndefined();
    });

    it('does not retry a second time when the retry also returns 401/use_dpop_nonce', async () => {
      const manager = makeManager();
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        makeResponse(401, {
          'WWW-Authenticate': 'DPoP error="use_dpop_nonce"',
          'DPoP-Nonce': 'nonce-value',
        }),
      );

      const response = await manager.fetch(RESOURCE_URL);

      // Exactly two calls: original + one retry.
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      // The second 401 is returned as-is.
      expect(response.status).toBe(401);
    });

    it('does not retry when 401 lacks WWW-Authenticate: use_dpop_nonce', async () => {
      const manager = makeManager();
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(makeResponse(401));

      const response = await manager.fetch(RESOURCE_URL);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(401);
    });

    it('does not retry when 401 + use_dpop_nonce but DPoP-Nonce header is absent', async () => {
      const manager = makeManager();
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        makeResponse(401, {
          'WWW-Authenticate': 'DPoP error="use_dpop_nonce"',
          // No DPoP-Nonce header — malformed server response.
        }),
      );

      const response = await manager.fetch(RESOURCE_URL);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(401);
    });

    it('retries successfully when input is a Request with a body (body is not double-consumed)', async () => {
      const manager = makeManager();
      let callCount = 0;

      vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
        callCount++;
        // Simulate what native fetch does internally when sending a request
        // body — reading it. If DPoPManager.fetch() reused the same Request
        // instance across both attempts, this second read would throw
        // "body already used" instead of resolving with the text.
        const bodyText = await (input as Request).text();
        expect(bodyText).toBe('{"foo":1}');

        if (callCount === 1) {
          return makeResponse(401, {
            'WWW-Authenticate': 'DPoP error="use_dpop_nonce"',
            'DPoP-Nonce': 'nonce-for-request-body-retry',
          });
        }
        return makeResponse(200);
      });

      const request = new Request(RESOURCE_URL, {
        method: 'POST',
        body: '{"foo":1}',
      });

      const response = await manager.fetch(request);

      expect(callCount).toBe(2);
      expect(response.status).toBe(200);
    });

    it('retries successfully when init.body is a raw ReadableStream (body is not double-consumed)', async () => {
      const manager = makeManager();
      let callCount = 0;

      vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
        callCount++;
        // Same rationale as the Request-with-body retry test above: if the
        // stream were reused/double-read instead of teed via Request.clone(),
        // this second read would throw instead of resolving with the text.
        const bodyText = await (input as Request).text();
        expect(bodyText).toBe('stream-body');

        if (callCount === 1) {
          return makeResponse(401, {
            'WWW-Authenticate': 'DPoP error="use_dpop_nonce"',
            'DPoP-Nonce': 'nonce-for-stream-retry',
          });
        }
        return makeResponse(200);
      });

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('stream-body'));
          controller.close();
        },
      });

      const response = await manager.fetch(RESOURCE_URL, {
        method: 'POST',
        body: stream,
        duplex: 'half',
      } as RequestInit);

      expect(callCount).toBe(2);
      expect(response.status).toBe(200);
    });

    it('does not throw for a raw ReadableStream body when no retry is needed', async () => {
      const manager = makeManager();

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(makeResponse(200));

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('stream-body'));
          controller.close();
        },
      });

      const response = await manager.fetch(RESOURCE_URL, {
        method: 'POST',
        body: stream,
        duplex: 'half',
      } as RequestInit);

      expect(response.status).toBe(200);
    });
  });
});

describe('getExpiresAt()', () => {
  it('returns -1 when no tokens are stored', () => {
    const manager = makeManager();
    expect(manager.getExpiresAt()).toBe(-1);
  });

  it('returns the expiresAt of the stored tokens', () => {
    const manager = makeManager();
    const expiresAt = Date.now() + 60_000;
    manager.setTokens(makeTokens({ expiresAt }));
    expect(manager.getExpiresAt()).toBe(expiresAt);
  });

  it('returns -1 after clear()', async () => {
    const manager = makeManager();
    manager.setTokens(makeTokens());

    await manager.clear();

    expect(manager.getExpiresAt()).toBe(-1);
  });
});

describe('getAccessToken()', () => {
  it('returns null when no tokens are stored', () => {
    const manager = makeManager();
    expect(manager.getAccessToken()).toBeNull();
  });

  it('returns the accessToken of the stored tokens', () => {
    const manager = makeManager();
    manager.setTokens(makeTokens({ accessToken: 'stored-access-token' }));
    expect(manager.getAccessToken()).toBe('stored-access-token');
  });

  it('returns null after clear()', async () => {
    const manager = makeManager();
    manager.setTokens(makeTokens());

    await manager.clear();

    expect(manager.getAccessToken()).toBeNull();
  });
});

describe('clear()', () => {
  it('removes the key pair from DPoPStorage', async () => {
    const manager = makeManager();
    await manager.getOrCreateKeyPair(); // generate + persist

    await manager.clear();

    // A fresh manager sharing the same IndexedDB should find nothing.
    const fresh = makeManager();
    // Before calling getOrCreateKeyPair() we need to peek at storage directly.
    // Import DPoPStorage so we can query independently.
    const { DPoPStorage } = await import('./DPoPStorage');
    const storage = new DPoPStorage({ clientId: CLIENT_ID });
    const stored = await storage.getKeyPair();
    expect(stored).toBeUndefined();
    // Silence unused-variable warning — fresh is used to confirm the type.
    expect(fresh).toBeDefined();
  });

  it('clears tokens from DPoPTokenStore', async () => {
    const manager = makeManager();
    manager.setTokens(makeTokens());
    expect(manager.isLoggedIn).toBe(true);

    await manager.clear();

    expect(manager.isLoggedIn).toBe(false);
  });

  it('clears the in-memory nonce cache', async () => {
    const manager = makeManager();

    // Seed the nonce cache via a 401 retry.
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        makeResponse(401, {
          'WWW-Authenticate': 'DPoP error="use_dpop_nonce"',
          'DPoP-Nonce': 'cached-nonce',
        }),
      )
      .mockResolvedValueOnce(makeResponse(200));

    await manager.fetch(RESOURCE_URL);

    // Confirm the nonce was cached (proof should include it).
    const beforeClear = decodeJwtPayload(
      await manager.generateProof(RESOURCE_URL, 'GET'),
    );
    expect(beforeClear.nonce).toBe('cached-nonce');

    await manager.clear();

    // After clear the nonce should be gone from the proof.
    vi.restoreAllMocks(); // stop the fetch spy so generateProof can run freely
    const afterClear = decodeJwtPayload(
      await manager.generateProof(RESOURCE_URL, 'GET'),
    );
    expect(afterClear.nonce).toBeUndefined();
  });

  it('resets the memoised key-pair promise so next call regenerates', async () => {
    const manager = makeManager();
    const first = await manager.getOrCreateKeyPair();

    await manager.clear();

    const second = await manager.getOrCreateKeyPair();
    // clear() resets the promise — a new object is created.
    expect(second).not.toBe(first);
  });
});

describe('startLogin()', () => {
  it('persists code_verifier via RedirectHelper and redirects to /oauth2/authorize with dpop_jkt/code_challenge/state', async () => {
    const { assign } = stubWindow();
    const redirectHelper = new RedirectHelper();
    const manager = makeManager('memory', makeUrlHelper(), redirectHelper);

    await manager.startLogin('my-state');

    expect(assign).toHaveBeenCalledOnce();
    const url = new URL(assign.mock.calls[0][0].toString());
    expect(url.pathname).toBe('/oauth2/authorize');
    // The OAuth `state` param sent to the server is the SDK-generated
    // transactionState — not the caller's own state — since it's the actual
    // CSRF defense (see RedirectHelper.handlePreDpopRedirect()).
    expect(url.searchParams.get('state')).toBe(
      redirectHelper.getTransactionState(),
    );
    expect(url.searchParams.get('state')).not.toBe('my-state');
    expect(url.searchParams.has('dpop_jkt')).toBe(true);
    expect(url.searchParams.has('code_challenge')).toBe(true);

    expect(redirectHelper.getCodeVerifier()).toBeDefined();
    expect(redirectHelper.getState()).toBe('my-state');
  });
});

describe('startLogout()', () => {
  it('clears DPoP state and redirects to /oauth2/logout', async () => {
    const { assign } = stubWindow();
    const manager = makeManager();
    manager.setTokens(makeTokens());
    expect(manager.isLoggedIn).toBe(true);

    await manager.startLogout();

    expect(manager.isLoggedIn).toBe(false);
    expect(assign).toHaveBeenCalledOnce();
    const url = new URL(assign.mock.calls[0][0].toString());
    expect(url.pathname).toBe('/oauth2/logout');
  });

  it('still redirects even if clear() throws', async () => {
    const { assign } = stubWindow();
    const manager = makeManager();
    vi.spyOn(manager, 'clear').mockRejectedValueOnce(new Error('boom'));

    await expect(manager.startLogout()).rejects.toThrow('boom');
    expect(assign).toHaveBeenCalledOnce();
  });
});

describe('startRegister()', () => {
  it('persists code_verifier via RedirectHelper and redirects to /oauth2/register with dpop_jkt/code_challenge/state', async () => {
    const { assign } = stubWindow();
    const redirectHelper = new RedirectHelper();
    const manager = makeManager('memory', makeUrlHelper(), redirectHelper);

    await manager.startRegister('my-state');

    expect(assign).toHaveBeenCalledOnce();
    const url = new URL(assign.mock.calls[0][0].toString());
    expect(url.pathname).toBe('/oauth2/register');
    // See the equivalent startLogin() assertion above for why this is the
    // generated transactionState, not the caller's own state.
    expect(url.searchParams.get('state')).toBe(
      redirectHelper.getTransactionState(),
    );
    expect(url.searchParams.get('state')).not.toBe('my-state');
    expect(url.searchParams.has('dpop_jkt')).toBe(true);
    expect(url.searchParams.has('code_challenge')).toBe(true);

    expect(redirectHelper.getCodeVerifier()).toBeDefined();
    expect(redirectHelper.getState()).toBe('my-state');
  });
});

describe('refreshToken()', () => {
  it('throws when no refresh token is stored', async () => {
    const manager = makeManager();
    await expect(manager.refreshToken()).rejects.toThrow(
      'No refresh token available. Have you called startLogin()?',
    );
  });

  it('sends a DPoP header and refresh_token grant body to /oauth2/token', async () => {
    const manager = makeManager();
    manager.setTokens(makeTokens({ refreshToken: 'old-refresh-token' }));

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(
        200,
        {},
        JSON.stringify({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          token_type: 'DPoP',
        }),
      ),
    );

    const response = await manager.refreshToken();

    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(new URL(url.toString()).pathname).toBe('/oauth2/token');
    const headers = init?.headers as Record<string, string>;
    expect(headers['DPoP']).toBeDefined();
    const body = new URLSearchParams(init?.body as string);
    expect(body.get('grant_type')).toBe('refresh_token');
    expect(body.get('refresh_token')).toBe('old-refresh-token');
    expect(body.get('client_id')).toBe(CLIENT_ID);

    expect(manager.getAccessToken()).toBe('new-access-token');
  });

  it('throws when the response is not ok', async () => {
    const manager = makeManager();
    manager.setTokens(makeTokens());
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(400, {}, 'invalid_grant'),
    );

    await expect(manager.refreshToken()).rejects.toThrow();
  });

  it('throws when token_type is not DPoP', async () => {
    const manager = makeManager();
    manager.setTokens(makeTokens());
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(
        200,
        {},
        JSON.stringify({
          access_token: 'a',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      ),
    );

    await expect(manager.refreshToken()).rejects.toThrow('token_type');
  });

  it('throws when expires_in is not a positive number', async () => {
    const manager = makeManager();
    manager.setTokens(makeTokens());
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(
        200,
        {},
        JSON.stringify({
          access_token: 'a',
          expires_in: 0,
          token_type: 'DPoP',
        }),
      ),
    );

    await expect(manager.refreshToken()).rejects.toThrow('expires_in');
  });
});

describe('handlePostRedirect()', () => {
  it('returns undefined when there is no code query param', async () => {
    stubWindow();
    const manager = makeManager();

    expect(await manager.handlePostRedirect()).toBeUndefined();
  });

  it('returns undefined when code is present but no code_verifier was persisted', async () => {
    stubWindow('?code=abc123');
    const manager = makeManager();

    expect(await manager.handlePostRedirect()).toBeUndefined();
  });

  it('returns a state-mismatch Error and does not exchange the code (CSRF protection)', async () => {
    stubWindow(); // establishes window.crypto for handlePreDpopRedirect()
    const redirectHelper = new RedirectHelper();
    redirectHelper.handlePreDpopRedirect('my-code-verifier', 'expected-state');
    // The URL's `state` never matches a real transactionState regardless of
    // its value — this proves the mismatch check independent of what the
    // caller's own `state` was.
    stubWindow('?code=abc123&state=attacker-state');
    const manager = makeManager('memory', makeUrlHelper(), redirectHelper);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const error = await manager.handlePostRedirect();

    expect(error?.message).toContain('state');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('exchanges the code, stores tokens, clears the URL, and invokes the callback', async () => {
    stubWindow(); // establishes window.crypto for handlePreDpopRedirect()
    const redirectHelper = new RedirectHelper();
    const transactionState = redirectHelper.handlePreDpopRedirect(
      'my-code-verifier',
      'my-state',
    );
    const { replaceState } = stubWindow(
      `?code=abc123&state=${transactionState}`,
    );
    const manager = makeManager('memory', makeUrlHelper(), redirectHelper);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(
        200,
        {},
        JSON.stringify({
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          expires_in: 3600,
          token_type: 'DPoP',
        }),
      ),
    );

    const callback = vi.fn();
    const result = await manager.handlePostRedirect(callback);

    expect(result).toBeUndefined();
    expect(manager.getAccessToken()).toBe('access-token');
    expect(callback).toHaveBeenCalledWith('my-state');
    expect(replaceState).toHaveBeenCalledOnce();
  });

  it('returns an Error instead of throwing when the token exchange fails', async () => {
    stubWindow(); // establishes window.crypto for handlePreDpopRedirect()
    const redirectHelper = new RedirectHelper();
    const transactionState =
      redirectHelper.handlePreDpopRedirect('my-code-verifier');
    stubWindow(`?code=abc123&state=${transactionState}`);
    const manager = makeManager('memory', makeUrlHelper(), redirectHelper);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(400, {}, 'invalid_grant'),
    );

    const error = await manager.handlePostRedirect();
    expect(error).toBeInstanceOf(Error);
  });

  it('returns an Error when token_type is not DPoP', async () => {
    stubWindow(); // establishes window.crypto for handlePreDpopRedirect()
    const redirectHelper = new RedirectHelper();
    const transactionState =
      redirectHelper.handlePreDpopRedirect('my-code-verifier');
    stubWindow(`?code=abc123&state=${transactionState}`);
    const manager = makeManager('memory', makeUrlHelper(), redirectHelper);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(
        200,
        {},
        JSON.stringify({
          access_token: 'a',
          expires_in: 3600,
          token_type: 'Bearer',
        }),
      ),
    );

    const error = await manager.handlePostRedirect();
    expect(error?.message).toContain('token_type');
  });
});

describe('fetchUserInfo()', () => {
  it('throws when no access token is stored', async () => {
    const manager = makeManager();
    await expect(manager.fetchUserInfo()).rejects.toThrow(
      'No access token available. Have you called startLogin()?',
    );
  });

  it('fetches /oauth2/userinfo and returns the parsed claims', async () => {
    const manager = makeManager();
    manager.setTokens(makeTokens({ accessToken: 'my-access-token' }));

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(200, {}, JSON.stringify({ email: 'user@example.com' })),
    );

    const userInfo = await manager.fetchUserInfo<{ email: string }>();
    expect(userInfo).toEqual({ email: 'user@example.com' });
  });

  it('throws when the response is not ok', async () => {
    const manager = makeManager();
    manager.setTokens(makeTokens());
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse(401));

    await expect(manager.fetchUserInfo()).rejects.toThrow(/status code 401/);
  });
});
