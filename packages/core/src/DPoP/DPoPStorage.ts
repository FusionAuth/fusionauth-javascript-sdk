import { KeyPair } from 'dpop';

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
      req.onsuccess = () => {
        db.close();
        resolve(req.result as KeyPair | undefined);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
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
      const req = tx.objectStore(STORE_NAME).put(keyPair, this.clientId);
      req.onsuccess = () => {
        db.close();
        resolve();
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
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
      const req = tx.objectStore(STORE_NAME).delete(this.clientId);
      req.onsuccess = () => {
        db.close();
        resolve();
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

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
