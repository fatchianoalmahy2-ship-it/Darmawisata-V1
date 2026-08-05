import { getDb, getFirebaseSDK } from './firebaseService';

export function cleanData<T>(obj: T): T {
  if (obj === undefined) return null as unknown as T;
  if (obj === null) return null as unknown as T;
  if (Array.isArray(obj)) return obj.map((item) => cleanData(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = (obj as any)[key];
        cleaned[key] = val === undefined ? null : cleanData(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

export interface EntityWithId {
  id?: string;
}

/**
 * Generic Firestore Repository for Low-Code / Full DRY Database Operations.
 * Eliminates duplicate Firestore CRUD code across entities.
 */
export class GenericFirestoreRepository<T extends EntityWithId> {
  constructor(public readonly collectionName: string) {}

  async getAll(): Promise<T[]> {
    const db = await getDb();
    if (!db) return [];
    try {
      const sdk = await getFirebaseSDK();
      if (!sdk) return [];
      const snap = await sdk.getDocs(sdk.collection(db, this.collectionName));
      const items: T[] = [];
      snap.forEach((doc: any) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });
      return items;
    } catch (err) {
      console.error(`[GenericFirestoreRepository] Error fetching ${this.collectionName}:`, err);
      return [];
    }
  }

  async saveOne(item: T): Promise<void> {
    const db = await getDb();
    if (!db || !item.id) return;
    try {
      const sdk = await getFirebaseSDK();
      if (!sdk) return;
      await sdk.setDoc(sdk.doc(db, this.collectionName, item.id), cleanData(item), { merge: true });
    } catch (err) {
      console.error(`[GenericFirestoreRepository] Error saving to ${this.collectionName}:`, err);
    }
  }

  async saveBatch(items: T[], chunkSize = 400): Promise<void> {
    const db = await getDb();
    if (!db || items.length === 0) return;
    try {
      const sdk = await getFirebaseSDK();
      if (!sdk) return;

      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const batch = sdk.writeBatch(db);
        chunk.forEach((item) => {
          if (item.id) {
            const ref = sdk.doc(db, this.collectionName, item.id);
            batch.set(ref, cleanData(item), { merge: true });
          }
        });
        await batch.commit();
      }
    } catch (err) {
      console.error(`[GenericFirestoreRepository] Error batch saving to ${this.collectionName}:`, err);
    }
  }

  async deleteOne(id: string): Promise<void> {
    const db = await getDb();
    if (!db) return;
    try {
      const sdk = await getFirebaseSDK();
      if (!sdk) return;
      await sdk.deleteDoc(sdk.doc(db, this.collectionName, id));
    } catch (err) {
      console.error(`[GenericFirestoreRepository] Error deleting from ${this.collectionName}:`, err);
    }
  }

  async clearAll(chunkSize = 400): Promise<void> {
    const db = await getDb();
    if (!db) return;
    try {
      const sdk = await getFirebaseSDK();
      if (!sdk) return;
      const snap = await sdk.getDocs(sdk.collection(db, this.collectionName));
      if (snap.empty) return;

      const docs = snap.docs;
      for (let i = 0; i < docs.length; i += chunkSize) {
        const chunk = docs.slice(i, i + chunkSize);
        const batch = sdk.writeBatch(db);
        chunk.forEach((d: any) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (err) {
      console.error(`[GenericFirestoreRepository] Error clearing ${this.collectionName}:`, err);
    }
  }
}
