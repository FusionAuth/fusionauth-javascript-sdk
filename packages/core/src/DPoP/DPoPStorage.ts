import type { KeyPair } from 'dpop';

const DB_NAME = 'fusionauth-sdk:dpop';
const DB_VERSION = 1;
const STORE_NAME = 'keypair';

/**
 * IndexedDB abstraction for persisting the ES256 `CryptoKeyPair` across
 * browser sessions. Keys are namespaced by `clientId` to isolate multiple
 * FusionAuth applications hosted on the same origin.
 */
export class DPoPStorage {
  private readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Retrieves the persisted `CryptoKeyPair` for this `clientId`, or
   * `undefined` if none exists.
   */
  async getKeyPair(): Promise<KeyPair | undefined> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(this.clientId);
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
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(keyPair, this.clientId);
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
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(this.clientId);
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
        req = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (err) {
        reject(err);
        return;
      }

      req.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}
