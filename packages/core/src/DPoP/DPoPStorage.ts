import type { KeyPair } from 'dpop';

export const DEFAULT_DPOP_DB_NAME = 'fusionauth-sdk:dpop';
export const DEFAULT_DPOP_DB_VERSION = 1;
export const DEFAULT_DPOP_STORE_NAME = 'keypair';

/**
 * Configuration for `DPoPStorage`.
 *
 * All fields except `clientId` are optional and fall back to well-known
 * defaults. Override them only when you have a specific reason to do so —
 * for example, to isolate parallel test runs or to avoid collisions with
 * another SDK instance on the same origin.
 *
 * **`dbVersion` warning:** IndexedDB versions can only increase. If a browser
 * already has the database open at version N, opening the same database name
 * at version M < N will fail with a `VersionError`. Only increase
 * `dbVersion` (relative to whatever is already persisted in browsers), and
 * only do so when you also need to make a structural change to the object
 * store inside `onupgradeneeded`. Never decrement it.
 */
export interface DPoPStorageConfig {
  /**
   * The OAuth2 `client_id` of the application. Used to namespace key pairs
   * so that multiple FusionAuth applications on the same origin do not share
   * IndexedDB records.
   */
  clientId: string;

  /**
   * IndexedDB database name.
   * @default 'fusionauth-sdk:dpop'
   */
  dbName?: string;

  /**
   * IndexedDB schema version. Must only increase — see warning above.
   * @default 1
   */
  dbVersion?: number;

  /**
   * Name of the IndexedDB object store used to persist key pairs.
   * @default 'keypair'
   */
  storeName?: string;
}

/**
 * IndexedDB abstraction for persisting the ES256 `CryptoKeyPair` across
 * browser sessions. Keys are namespaced by `clientId` to isolate multiple
 * FusionAuth applications hosted on the same origin.
 */
export class DPoPStorage {
  private readonly clientId: string;
  private readonly dbName: string;
  private readonly dbVersion: number;
  private readonly storeName: string;

  constructor(config: DPoPStorageConfig) {
    this.clientId = config.clientId;
    this.dbName = config.dbName ?? DEFAULT_DPOP_DB_NAME;
    this.dbVersion = config.dbVersion ?? DEFAULT_DPOP_DB_VERSION;
    this.storeName = config.storeName ?? DEFAULT_DPOP_STORE_NAME;
  }

  /**
   * Retrieves the persisted `CryptoKeyPair` for this `clientId`, or
   * `undefined` if none exists.
   */
  async getKeyPair(): Promise<KeyPair | undefined> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const req = tx.objectStore(this.storeName).get(this.clientId);
      tx.oncomplete = () => {
        db.close();
        resolve(req.result as KeyPair | undefined);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error ?? new Error('IndexedDB transaction aborted'));
      };
    });
  }

  /**
   * Persists a `CryptoKeyPair` to IndexedDB under this `clientId`.
   */
  async setKeyPair(keyPair: KeyPair): Promise<void> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).put(keyPair, this.clientId);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error ?? new Error('IndexedDB transaction aborted'));
      };
    });
  }

  /**
   * Removes the stored key pair for this `clientId`. Called on logout.
   */
  async clearKeyPair(): Promise<void> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).delete(this.clientId);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error ?? new Error('IndexedDB transaction aborted'));
      };
    });
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      // Graceful fallback for non-browser/SSR environments.
      if (typeof indexedDB === 'undefined') {
        reject(new Error('indexedDB is not available in this environment'));
        return;
      }
      let req: IDBOpenDBRequest;
      try {
        req = indexedDB.open(this.dbName, this.dbVersion);
      } catch (err) {
        reject(err);
        return;
      }

      req.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}
