import { describe, it, expect, beforeEach } from 'vitest';

import { DPoPTokenStore, DPoPTokens } from './DPoPTokenStore';

const CLIENT_ID = 'test-client';
const STORAGE_KEY = `fusionauth-sdk:tokens:${CLIENT_ID}`;

function makeTokens(overrides?: Partial<DPoPTokens>): DPoPTokens {
  return {
    accessToken: 'access-token-value',
    refreshToken: 'refresh-token-value',
    expiresAt: Date.now() + 60_000, // expires in 60 s by default
    tokenType: 'DPoP',
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('DPoPTokenStore — localStorage mode', () => {
  it('returns null when nothing is stored', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    expect(store.get()).toBeNull();
  });

  it('tokens survive get() after set()', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    const tokens = makeTokens();

    store.set(tokens);
    const retrieved = store.get();

    expect(retrieved).toEqual(tokens);
  });

  it('writes tokens to localStorage', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    const tokens = makeTokens();

    store.set(tokens);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual(tokens);
  });

  it('clear() removes tokens', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    store.set(makeTokens());

    store.clear();

    expect(store.get()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('getAccessToken() returns the access token string after set()', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    store.set(makeTokens());

    expect(store.getAccessToken()).toBe('access-token-value');
  });

  it('getAccessToken() returns null when no tokens are stored', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    expect(store.getAccessToken()).toBeNull();
  });

  it('getAccessToken() returns null after clear()', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    store.set(makeTokens());
    store.clear();

    expect(store.getAccessToken()).toBeNull();
  });

  it('isExpired returns false when tokens are fresh', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    store.set(makeTokens({ expiresAt: Date.now() + 60_000 }));

    expect(store.isExpired).toBe(false);
  });

  it('isExpired returns true when expiresAt is in the past', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    store.set(makeTokens({ expiresAt: Date.now() - 1 }));

    expect(store.isExpired).toBe(true);
  });

  it('isExpired returns true when no tokens are stored', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'localStorage');
    expect(store.isExpired).toBe(true);
  });

  it('defaults to localStorage when no storageType is provided', () => {
    const store = new DPoPTokenStore(CLIENT_ID);
    const tokens = makeTokens();
    store.set(tokens);

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });
});

describe('DPoPTokenStore — memory mode', () => {
  it('returns null when nothing is stored', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'memory');
    expect(store.get()).toBeNull();
  });

  it('tokens survive get() after set()', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'memory');
    const tokens = makeTokens();

    store.set(tokens);

    expect(store.get()).toEqual(tokens);
  });

  it('does NOT write tokens to localStorage', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'memory');
    store.set(makeTokens());

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clear() removes tokens from memory', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'memory');
    store.set(makeTokens());

    store.clear();

    expect(store.get()).toBeNull();
  });

  it('getAccessToken() returns the access token string after set()', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'memory');
    store.set(makeTokens());

    expect(store.getAccessToken()).toBe('access-token-value');
  });

  it('getAccessToken() returns null when no tokens are stored', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'memory');
    expect(store.getAccessToken()).toBeNull();
  });

  it('getAccessToken() returns null after clear()', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'memory');
    store.set(makeTokens());
    store.clear();

    expect(store.getAccessToken()).toBeNull();
  });

  it('isExpired returns false when tokens are fresh', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'memory');
    store.set(makeTokens({ expiresAt: Date.now() + 60_000 }));

    expect(store.isExpired).toBe(false);
  });

  it('isExpired returns true when expiresAt is in the past', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'memory');
    store.set(makeTokens({ expiresAt: Date.now() - 1 }));

    expect(store.isExpired).toBe(true);
  });

  it('isExpired returns true when no tokens are stored', () => {
    const store = new DPoPTokenStore(CLIENT_ID, 'memory');
    expect(store.isExpired).toBe(true);
  });
});
