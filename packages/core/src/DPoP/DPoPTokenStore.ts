/**
 * Shape of a DPoP-bound token set stored by `DPoPTokenStore`.
 */
export interface DPoPTokens {
  accessToken: string;
  refreshToken: string | undefined;
  /** Unix timestamp in milliseconds when the access token expires. */
  expiresAt: number;
  tokenType: 'DPoP';
}

/**
 * Storage backend for DPoP-bound access and refresh tokens.
 *
 * - `'localStorage'`: tokens are persisted in `localStorage` under the key
 *   `fusionauth-sdk:tokens:<clientId>` and survive page reloads.
 * - `'memory'`: tokens are kept in memory only and are lost on page reload.
 *
 * The backend is selected at construction time via the `storageType` option,
 * which corresponds to `SDKConfig.dpopTokenStorage`.
 */
export class DPoPTokenStore {
  private readonly storageKey: string;
  private readonly storageType: 'localStorage' | 'memory';
  private memoryStore: DPoPTokens | null = null;

  constructor(
    clientId: string,
    storageType: 'localStorage' | 'memory' = 'localStorage',
  ) {
    this.storageKey = `fusionauth-sdk:tokens:${clientId}`;
    this.storageType = storageType;
  }

  /** Returns the stored `DPoPTokens`, or `null` if none are stored. */
  get(): DPoPTokens | null {
    if (this.storageType === 'memory') {
      return this.memoryStore;
    }

    const raw = this.getLocalStorage()?.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<DPoPTokens>;
      if (
        typeof parsed.accessToken !== 'string' ||
        (parsed.refreshToken !== undefined &&
          typeof parsed.refreshToken !== 'string') ||
        typeof parsed.expiresAt !== 'number' ||
        parsed.tokenType !== 'DPoP'
      ) {
        return null;
      }
      return parsed as DPoPTokens;
    } catch {
      return null;
    }
  }

  /** Stores a new set of DPoP tokens. */
  set(tokens: DPoPTokens): void {
    if (this.storageType === 'memory') {
      this.memoryStore = tokens;
      return;
    }

    this.getLocalStorage()?.setItem(this.storageKey, JSON.stringify(tokens));
  }

  /** Removes stored tokens. Called on logout. */
  clear(): void {
    this.memoryStore = null;
    this.getLocalStorage()?.removeItem(this.storageKey);
  }

  /**
   * Returns the stored access token string, or `null` if no tokens are stored.
   */
  getAccessToken(): string | null {
    return this.get()?.accessToken ?? null;
  }

  /**
   * Returns `true` if the stored tokens have expired (i.e. `expiresAt` is in
   * the past), or if no tokens are stored.
   */
  get isExpired(): boolean {
    const tokens = this.get();
    if (!tokens) return true;
    return tokens.expiresAt <= Date.now();
  }

  private getLocalStorage(): Storage | null {
    try {
      return localStorage;
    } catch {
      return null;
    }
  }
}
