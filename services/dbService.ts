import { Student, SchoolClass, AppSettings, RundownItem } from '@/types';
import {
  saveStudents,
  saveSingleStudent as saveSingleStudentFirebase,
  deleteSingleStudent as deleteSingleStudentFirebase,
  clearAllStudents as clearAllStudentsFirebase,
  saveClasses,
  deleteSingleClass as deleteSingleClassFirebase,
  clearAllClasses as clearAllClassesFirebase,
  saveSettings as saveSettingsFirebase,
  saveRundownItem as saveRundownItemFirebase,
  deleteRundownItem as deleteRundownItemFirebase,
} from './firebaseService';

const DB_NAME = 'SchoolDarmawisataDB';
const DB_VERSION = 2;

export interface SyncTask {
  id: string;
  action: string;
  payload: any;
  timestamp: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available on server-side'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('students')) {
        db.createObjectStore('students', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('classes')) {
        db.createObjectStore('classes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings'); // key-value, key: 'global'
      }
      if (!db.objectStoreNames.contains('rundowns')) {
        db.createObjectStore('rundowns', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// Helper to wrap object store operations in standard promises
async function getStore(storeName: string, mode: IDBTransactionMode) {
  const db = await getIDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

// Generic IDB Low-Code CRUD Helpers
async function idbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const store = await getStore(storeName, 'readonly');
    return new Promise<T[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error(`IndexedDB getAll on ${storeName} failed:`, e);
    return [];
  }
}

async function idbPutBatch<T>(storeName: string, items: T[]): Promise<void> {
  try {
    const db = await getIDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach((item) => store.put(item));
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error(`IndexedDB putBatch on ${storeName} failed:`, e);
  }
}

async function idbPutOne<T>(storeName: string, item: T, key?: IDBValidKey): Promise<void> {
  try {
    const store = await getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = key !== undefined ? store.put(item, key) : store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error(`IndexedDB putOne on ${storeName} failed:`, e);
  }
}

async function idbDeleteOne(storeName: string, key: IDBValidKey): Promise<void> {
  try {
    const store = await getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error(`IndexedDB deleteOne on ${storeName} failed:`, e);
  }
}

async function idbClearStore(storeName: string): Promise<void> {
  try {
    const store = await getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error(`IndexedDB clearStore on ${storeName} failed:`, e);
  }
}

export const dbService = {
  // --------------------------------------------------------------------------
  // DB Local Storage Operations (Refactored to Generic IDB Helpers)
  // --------------------------------------------------------------------------
  getAllStudents: () => idbGetAll<Student>('students'),
  putStudents: (students: Student[]) => idbPutBatch('students', students),
  putSingleStudent: (student: Student) => idbPutOne('students', student),
  deleteStudent: (studentId: string) => idbDeleteOne('students', studentId),
  deleteBatchStudents: async (studentIds: string[]) => {
    for (const id of studentIds) {
      await idbDeleteOne('students', id);
    }
  },
  clearStudents: () => idbClearStore('students'),

  getAllClasses: () => idbGetAll<SchoolClass>('classes'),
  putClasses: (classes: SchoolClass[]) => idbPutBatch('classes', classes),
  deleteClass: (classId: string) => idbDeleteOne('classes', classId),
  clearClasses: () => idbClearStore('classes'),

  getSettings: async (): Promise<AppSettings | null> => {
    try {
      const store = await getStore('settings', 'readonly');
      return new Promise<AppSettings | null>((resolve, reject) => {
        const req = store.get('global');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('IndexedDB getSettings failed:', e);
      return null;
    }
  },
  putSettings: (settings: AppSettings) => idbPutOne('settings', settings, 'global'),

  getAllRundowns: () => idbGetAll<RundownItem>('rundowns'),
  putRundowns: (rundowns: RundownItem[]) => idbPutBatch('rundowns', rundowns),
  putRundown: (item: RundownItem) => idbPutOne('rundowns', item),
  deleteRundown: (itemId: string) => idbDeleteOne('rundowns', itemId),
  clearRundowns: () => idbClearStore('rundowns'),

  // --------------------------------------------------------------------------
  // BACKGROUND SYNC QUEUE OPERATIONS
  // --------------------------------------------------------------------------
  async getSyncQueue(): Promise<SyncTask[]> {
    try {
      const store = await getStore('sync_queue', 'readonly');
      return new Promise<SyncTask[]>((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const tasks = req.result || [];
          resolve(tasks.sort((a, b) => a.timestamp - b.timestamp));
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('IndexedDB getSyncQueue failed:', e);
      return [];
    }
  },

  async enqueueTask(action: string, payload: any): Promise<void> {
    try {
      const task: SyncTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        action,
        payload,
        timestamp: Date.now(),
      };
      const store = await getStore('sync_queue', 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.put(task);
        req.onsuccess = () => {
          resolve();
          // Proactively trigger processing
          this.triggerSync();
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('IndexedDB enqueueTask failed:', e);
    }
  },

  async removeTask(taskId: string): Promise<void> {
    try {
      const store = await getStore('sync_queue', 'readwrite');
      return new Promise((resolve, reject) => {
        const req = store.delete(taskId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('IndexedDB removeTask failed:', e);
    }
  },

  // Process the queue when online
  isSyncing: false,
  async triggerSync(): Promise<void> {
    if (this.isSyncing) return;
    if (typeof window !== 'undefined' && (window as any).__forceOffline) {
      console.log('App is simulating offline mode. Sync postponed.');
      return;
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('App is currently offline. Sync postponed.');
      return;
    }

    const queue = await this.getSyncQueue();
    if (queue.length === 0) return;

    this.isSyncing = true;
    console.log(`Processing ${queue.length} background sync tasks...`);

    for (const task of queue) {
      try {
        await this.executeTask(task);
        await this.removeTask(task.id);
        console.log(`Background sync task completed: ${task.action}`);
      } catch (err) {
        console.error(`Failed to process sync task ${task.action}:`, err);
        // Break to avoid blocking on permanent errors or when network goes offline mid-sync
        break;
      }
    }
    this.isSyncing = false;
  },

  async executeTask(task: SyncTask): Promise<void> {
    const { action, payload } = task;
    try {
      if (action === 'save_student') {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'saveStudent', payload }),
        });
      } else if (action === 'save_students') {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'bulkSaveStudents', payload }),
        });
      } else if (action === 'save_classes') {
        if (Array.isArray(payload)) {
          for (const cls of payload) {
            await fetch('/api/db', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'saveClass', payload: cls }),
            });
          }
        } else {
          await fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'saveClass', payload }),
          });
        }
      } else if (action === 'save_settings') {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'saveSettings', payload }),
        });
      } else if (action === 'save_rundown') {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'saveRundown', payload }),
        });
      } else if (action === 'delete_student') {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deleteStudent', payload: { studentId: payload } }),
        });
      } else if (action === 'delete_batch_students') {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deleteBatchStudents', payload: { studentIds: payload } }),
        });
      } else if (action === 'clear_students') {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clearStudents', payload: null }),
        });
      } else if (action === 'delete_class') {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deleteClass', payload: { classId: payload } }),
        });
      } else if (action === 'clear_classes') {
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clearClasses', payload: null }),
        });
      }
    } catch (e) {
      console.error(`Failed to execute sync task ${action} for Cloud SQL:`, e);
      throw e;
    }
  },
};
