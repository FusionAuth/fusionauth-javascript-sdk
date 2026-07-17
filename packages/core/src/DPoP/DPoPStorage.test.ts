import { describe, it, expect, beforeEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { generateKeyPair } from 'dpop';

import {
  DPoPStorage,
  DEFAULT_DPOP_DB_NAME,
  DEFAULT_DPOP_DB_VERSION,
  DEFAULT_DPOP_STORE_NAME,
} from './DPoPStorage';

// Provide a fresh in-process IndexedDB for each test so tests are isolated.
beforeEach(() => {
  // @ts-ignore — jsdom does not implement indexedDB; fake-indexeddb fills the gap.
  globalThis.indexedDB = new IDBFactory();
});

describe('DPoPStorage', () => {
  it('returns undefined when no key pair has been stored', async () => {
    const storage = new DPoPStorage({ clientId: 'client-a' });
    const result = await storage.getKeyPair();
    expect(result).toBeUndefined();
  });

  it('persists a key pair and retrieves it', async () => {
    const storage = new DPoPStorage({ clientId: 'client-a' });
    const keyPair = await generateKeyPair('ES256', { extractable: false });

    await storage.setKeyPair(keyPair);
    const retrieved = await storage.getKeyPair();

    expect(retrieved).toBeDefined();
    // CryptoKey objects are deserialized from IndexedDB — reference equality
    // will not hold. Assert structural identity instead.
    expect(retrieved!.privateKey.type).toBe('private');
    expect(retrieved!.privateKey.algorithm).toStrictEqual(
      keyPair.privateKey.algorithm,
    );
    expect(retrieved!.publicKey.type).toBe('public');
    expect(retrieved!.publicKey.algorithm).toStrictEqual(
      keyPair.publicKey.algorithm,
    );
  });

  it('returns the same key pair on a subsequent call (same IDBFactory instance)', async () => {
    const storage = new DPoPStorage({ clientId: 'client-a' });
    const keyPair = await generateKeyPair('ES256', { extractable: false });
    await storage.setKeyPair(keyPair);

    const first = await storage.getKeyPair();
    const second = await storage.getKeyPair();

    expect(second!.privateKey.algorithm).toStrictEqual(
      first!.privateKey.algorithm,
    );
    expect(second!.publicKey.algorithm).toStrictEqual(
      first!.publicKey.algorithm,
    );
  });

  it('clearKeyPair removes the stored value', async () => {
    const storage = new DPoPStorage({ clientId: 'client-a' });
    const keyPair = await generateKeyPair('ES256', { extractable: false });
    await storage.setKeyPair(keyPair);

    await storage.clearKeyPair();

    const result = await storage.getKeyPair();
    expect(result).toBeUndefined();
  });

  it('isolates key pairs by clientId — different clients do not share keys', async () => {
    const storageA = new DPoPStorage({ clientId: 'client-a' });
    const storageB = new DPoPStorage({ clientId: 'client-b' });

    const keyPairA = await generateKeyPair('ES256', { extractable: false });
    await storageA.setKeyPair(keyPairA);

    // client-b should see nothing
    const resultB = await storageB.getKeyPair();
    expect(resultB).toBeUndefined();

    // client-a's data is still intact
    const resultA = await storageA.getKeyPair();
    expect(resultA).toBeDefined();
    expect(resultA!.privateKey.algorithm).toStrictEqual(
      keyPairA.privateKey.algorithm,
    );
  });

  it('clearKeyPair for one clientId does not affect another', async () => {
    const storageA = new DPoPStorage({ clientId: 'client-a' });
    const storageB = new DPoPStorage({ clientId: 'client-b' });

    const keyPairA = await generateKeyPair('ES256', { extractable: false });
    const keyPairB = await generateKeyPair('ES256', { extractable: false });
    await storageA.setKeyPair(keyPairA);
    await storageB.setKeyPair(keyPairB);

    await storageA.clearKeyPair();

    expect(await storageA.getKeyPair()).toBeUndefined();
    const resultB = await storageB.getKeyPair();
    expect(resultB).toBeDefined();
    expect(resultB!.privateKey.algorithm).toStrictEqual(
      keyPairB.privateKey.algorithm,
    );
  });

  describe('config defaults', () => {
    it('uses DEFAULT_DPOP_DB_NAME when dbName is not provided', async () => {
      const storage = new DPoPStorage({ clientId: 'client-a' });
      const keyPair = await generateKeyPair('ES256', { extractable: false });
      await storage.setKeyPair(keyPair);

      // Verify the key landed in the default database by opening it directly.
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(
          DEFAULT_DPOP_DB_NAME,
          DEFAULT_DPOP_DB_VERSION,
        );
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const result = await new Promise((resolve, reject) => {
        const tx = db.transaction(DEFAULT_DPOP_STORE_NAME, 'readonly');
        const req = tx.objectStore(DEFAULT_DPOP_STORE_NAME).get('client-a');
        tx.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      });
      expect(result).toBeDefined();
    });

    it('uses custom dbName and storeName when provided', async () => {
      const storage = new DPoPStorage({
        clientId: 'client-a',
        dbName: 'my-custom-db',
        storeName: 'my-custom-store',
      });
      const keyPair = await generateKeyPair('ES256', { extractable: false });
      await storage.setKeyPair(keyPair);

      // Verify the key landed in the custom database, not the default one.
      const customDb = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open('my-custom-db', DEFAULT_DPOP_DB_VERSION);
        req.onupgradeneeded = e => {
          (e.target as IDBOpenDBRequest).result.createObjectStore(
            'my-custom-store',
          );
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const result = await new Promise((resolve, reject) => {
        const tx = customDb.transaction('my-custom-store', 'readonly');
        const req = tx.objectStore('my-custom-store').get('client-a');
        tx.oncomplete = () => {
          customDb.close();
          resolve(req.result);
        };
        tx.onerror = () => {
          customDb.close();
          reject(tx.error);
        };
      });
      expect(result).toBeDefined();

      // And nothing landed in the default database.
      const defaultStorage = new DPoPStorage({ clientId: 'client-a' });
      expect(await defaultStorage.getKeyPair()).toBeUndefined();
    });

    it('two instances with different dbNames but the same clientId do not share keys', async () => {
      const storageA = new DPoPStorage({
        clientId: 'client-a',
        dbName: 'db-one',
      });
      const storageB = new DPoPStorage({
        clientId: 'client-a',
        dbName: 'db-two',
      });

      const keyPair = await generateKeyPair('ES256', { extractable: false });
      await storageA.setKeyPair(keyPair);

      expect(await storageB.getKeyPair()).toBeUndefined();
    });

    it('rejects with a VersionError when dbVersion is lower than an already-open database', async () => {
      // Open the database at version 2 first.
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open(DEFAULT_DPOP_DB_NAME, 2);
        req.onupgradeneeded = e => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(DEFAULT_DPOP_STORE_NAME)) {
            db.createObjectStore(DEFAULT_DPOP_STORE_NAME);
          }
        };
        req.onsuccess = () => {
          req.result.close();
          resolve();
        };
        req.onerror = () => reject(req.error);
      });

      // Now attempt to open the same database at version 1 — must reject.
      const storage = new DPoPStorage({
        clientId: 'client-a',
        dbVersion: 1, // lower than the persisted version 2
      });
      await expect(storage.getKeyPair()).rejects.toBeDefined();
    });
  });

  describe('openDb() error handling', () => {
    it('rejects with a descriptive error when indexedDB is unavailable (SSR / non-browser)', async () => {
      // @ts-ignore
      delete globalThis.indexedDB;

      const storage = new DPoPStorage({ clientId: 'client-a' });
      await expect(storage.getKeyPair()).rejects.toThrow(
        'indexedDB is not available in this environment',
      );
      await expect(
        storage.setKeyPair(
          await generateKeyPair('ES256', { extractable: false }),
        ),
      ).rejects.toThrow('indexedDB is not available in this environment');
      await expect(storage.clearKeyPair()).rejects.toThrow(
        'indexedDB is not available in this environment',
      );
      // globalThis.indexedDB is restored by the next beforeEach
    });

    it('rejects when indexedDB.open() throws synchronously', async () => {
      const originalOpen = globalThis.indexedDB.open.bind(globalThis.indexedDB);

      try {
        globalThis.indexedDB.open = () => {
          throw new Error('blocked by security policy');
        };

        const storage = new DPoPStorage({ clientId: 'client-a' });
        await expect(storage.getKeyPair()).rejects.toThrow(
          'blocked by security policy',
        );
      } finally {
        globalThis.indexedDB.open = originalOpen;
      }
    });

    it('rejects when a readwrite transaction is aborted', async () => {
      const storage = new DPoPStorage({ clientId: 'client-a' });
      const keyPair = await generateKeyPair('ES256', { extractable: false });

      // Store a key pair so we have a committed baseline.
      await storage.setKeyPair(keyPair);

      // Intercept the next open() call to wrap db.transaction() so we can
      // abort the transaction synchronously inside the request's onsuccess —
      // after the request fires but before tx.oncomplete, simulating a real
      // abort scenario (e.g. quota exceeded).
      const originalOpen = globalThis.indexedDB.open.bind(globalThis.indexedDB);
      globalThis.indexedDB.open = (...args: Parameters<IDBFactory['open']>) => {
        const openReq = originalOpen(...args);
        openReq.addEventListener('success', () => {
          const db = openReq.result as IDBDatabase;
          const originalTx = db.transaction.bind(db);
          db.transaction = (
            ...txArgs: Parameters<IDBDatabase['transaction']>
          ) => {
            const tx = originalTx(...txArgs);
            const originalGet = tx.objectStore.bind(tx);
            const store = originalGet(txArgs[0] as string);
            const originalDelete = store.delete.bind(store);
            store.delete = (
              ...deleteArgs: Parameters<IDBObjectStore['delete']>
            ) => {
              const delReq = originalDelete(...deleteArgs);
              delReq.addEventListener('success', () => {
                tx.abort();
              });
              return delReq;
            };
            return tx;
          };
        });
        return openReq;
      };

      try {
        await expect(storage.clearKeyPair()).rejects.toThrow();
      } finally {
        globalThis.indexedDB.open = originalOpen;
      }

      // The abort happened before oncomplete — the key pair should still be present.
      const result = await storage.getKeyPair();
      expect(result).toBeDefined();
    });
  });
});
