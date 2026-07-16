import { describe, it, expect, beforeEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { generateKeyPair } from 'dpop';

import { DPoPStorage } from './DPoPStorage';

// Provide a fresh in-process IndexedDB for each test so tests are isolated.
beforeEach(() => {
  // @ts-ignore — jsdom does not implement indexedDB; fake-indexeddb fills the gap.
  globalThis.indexedDB = new IDBFactory();
});

describe('DPoPStorage', () => {
  it('returns undefined when no key pair has been stored', async () => {
    const storage = new DPoPStorage('client-a');
    const result = await storage.getKeyPair();
    expect(result).toBeUndefined();
  });

  it('persists a key pair and retrieves it', async () => {
    const storage = new DPoPStorage('client-a');
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
    const storage = new DPoPStorage('client-a');
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
    const storage = new DPoPStorage('client-a');
    const keyPair = await generateKeyPair('ES256', { extractable: false });
    await storage.setKeyPair(keyPair);

    await storage.clearKeyPair();

    const result = await storage.getKeyPair();
    expect(result).toBeUndefined();
  });

  it('isolates key pairs by clientId — different clients do not share keys', async () => {
    const storageA = new DPoPStorage('client-a');
    const storageB = new DPoPStorage('client-b');

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
    const storageA = new DPoPStorage('client-a');
    const storageB = new DPoPStorage('client-b');

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

  describe('openDb() error handling', () => {
    it('rejects with a descriptive error when indexedDB is unavailable (SSR / non-browser)', async () => {
      // @ts-ignore
      delete globalThis.indexedDB;

      const storage = new DPoPStorage('client-a');
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

        const storage = new DPoPStorage('client-a');
        await expect(storage.getKeyPair()).rejects.toThrow(
          'blocked by security policy',
        );
      } finally {
        globalThis.indexedDB.open = originalOpen;
      }
    });

    it('rejects when a readwrite transaction is aborted', async () => {
      const storage = new DPoPStorage('client-a');
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
            // Wrap each request made on this transaction to abort synchronously
            // inside onsuccess — this fires after the request succeeds but
            // before tx.oncomplete, which is the exact scenario we want to test.
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
