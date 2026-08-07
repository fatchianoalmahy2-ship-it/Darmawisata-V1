import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  writeBatch,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { Student, SchoolClass, AppSettings, RundownItem, AdminCredentials } from '@/types';
import schoolMetadata from '@/config/schoolMetadata.json';
import sampleStudentsData from '@/config/sampleStudents.json';
import schoolClassesData from '@/config/schoolClasses.json';
import firebaseConfig from '@/firebase-applet-config.json';
import { sortClassesAlphabetically, normalizeClassName } from '@/lib/utils';
import { GenericFirestoreRepository, cleanData } from './genericRepository';

// Static Firebase SDK export object
const firebaseSDK = {
  initializeApp,
  getApps,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  writeBatch,
  deleteDoc,
  query,
  where,
};

let dbInstance: any = null;

export { cleanData };

// Repositories
export const studentsRepo = new GenericFirestoreRepository<Student>('students');
export const classesRepo = new GenericFirestoreRepository<SchoolClass>('classes');
export const rundownsRepo = new GenericFirestoreRepository<RundownItem>('rundowns');

export async function getFirebaseSDK() {
  return firebaseSDK;
}

export async function getDb() {
  if (dbInstance) return dbInstance;
  if (typeof window === 'undefined') return null;

  try {
    const configToUse = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firestoreDatabaseId: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    } : firebaseConfig;

    const app = getApps().length === 0 ? initializeApp(configToUse) : getApps()[0];
    const databaseId = (configToUse as any).firestoreDatabaseId || '(default)';
    
    try {
      dbInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
        experimentalForceLongPolling: true,
      }, databaseId);
    } catch (cacheErr) {
      console.warn('Persistent local cache might already be enabled or failed:', cacheErr);
      dbInstance = getFirestore(app, databaseId);
    }
    
    return dbInstance;
  } catch (err) {
    console.error('Gagal menginisialisasi Firestore:', err);
    return null;
  }
}

// ----------------------------------------------------------------------------
// 1. STUDENTS COLLECTION
// ----------------------------------------------------------------------------
export async function getInitialStudents(): Promise<Student[]> {
  try {
    const res = await fetch('/api/db');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.students)) {
        data.students.forEach((s: Student) => {
          s.className = normalizeClassName(s.className);
        });
        return data.students;
      }
    }
  } catch (err) {
    console.warn('Error fetching students from Cloud SQL /api/db:', err);
  }
  return [];
}

export async function saveStudents(students: Student[]): Promise<void> {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulkSaveStudents', payload: students }),
    });
  } catch (err) {
    console.error('Error saving students to Cloud SQL:', err);
  }
}

export async function saveSingleStudent(student: Student): Promise<void> {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveStudent', payload: student }),
    });
  } catch (err) {
    console.error('Error saving single student to Cloud SQL:', err);
  }
}

export async function deleteSingleStudent(studentId: string): Promise<void> {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteStudent', payload: { studentId } }),
    });
  } catch (err) {
    console.error('Error deleting student from Cloud SQL:', err);
  }
}

export async function deleteBatchStudents(studentIds: string[]): Promise<void> {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteBatchStudents', payload: { studentIds } }),
    });
  } catch (err) {
    console.error('Error deleting batch students from Cloud SQL:', err);
  }
}

export async function clearAllStudents(): Promise<void> {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clearStudents', payload: null }),
    });
  } catch (err) {
    console.error('Error clearing all students from Cloud SQL:', err);
  }
}

// ----------------------------------------------------------------------------
// 2. CLASSES COLLECTION
// ----------------------------------------------------------------------------
export async function getInitialClasses(): Promise<SchoolClass[]> {
  try {
    const res = await fetch('/api/db');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.classes) && data.classes.length > 0) {
        data.classes.forEach((c: SchoolClass) => {
          c.name = normalizeClassName(c.name);
        });
        return sortClassesAlphabetically(data.classes);
      }
    }
  } catch (err) {
    console.warn('Error loading classes from Cloud SQL:', err);
  }
  return sortClassesAlphabetically(schoolClassesData as SchoolClass[]);
}

export async function saveClasses(classes: SchoolClass[]): Promise<void> {
  try {
    for (const cls of classes) {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveClass', payload: cls }),
      });
    }
  } catch (err) {
    console.error('Error saving classes to Cloud SQL:', err);
  }
}

export async function deleteSingleClass(classId: string): Promise<void> {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteClass', payload: { classId } }),
    });
  } catch (err) {
    console.error('Error deleting class from Cloud SQL:', err);
  }
}

export async function clearAllClasses(): Promise<void> {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clearClasses', payload: null }),
    });
  } catch (err) {
    console.error('Error clearing all classes from Cloud SQL:', err);
  }
}

// ----------------------------------------------------------------------------
// 3. SETTINGS DOCUMENT
// ----------------------------------------------------------------------------
export async function getInitialSettings(): Promise<AppSettings> {
  try {
    const res = await fetch('/api/db');
    if (res.ok) {
      const data = await res.json();
      if (data.settings) {
        return data.settings;
      }
    }
  } catch (err) {
    console.warn('Error loading settings from Cloud SQL:', err);
  }
  return schoolMetadata.defaultSettings as AppSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveSettings', payload: settings }),
    });
  } catch (err) {
    console.error('Error saving settings to Cloud SQL:', err);
  }
}

export async function getAdminCredentialsFirestore(): Promise<AdminCredentials | null> {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getAdminCredentials' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.credentials) return data.credentials;
    }
  } catch (err) {
    console.warn('Error loading admin credentials from DB API:', err);
  }

  // Fallback to Firestore if configured
  const db = await getDb();
  if (!db) return null;

  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return null;

    const ref = sdk.doc(db, 'settings', 'admin');
    const snap = await sdk.getDoc(ref);

    if (snap.exists()) {
      return snap.data() as AdminCredentials;
    }
    return null;
  } catch (err) {
    console.warn('Firestore fallback loading admin credentials:', err);
    return null;
  }
}

export async function saveAdminCredentialsFirestore(creds: AdminCredentials): Promise<void> {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveAdminCredentials', payload: creds }),
    });
  } catch (err) {
    console.warn('Error saving admin credentials via DB API:', err);
  }

  // Dual-save to Firestore if available
  const db = await getDb();
  if (!db) return;

  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return;

    await sdk.setDoc(sdk.doc(db, 'settings', 'admin'), cleanData(creds), { merge: true });
  } catch (err) {
    console.warn('Firestore fallback saving admin credentials:', err);
  }
}

// ----------------------------------------------------------------------------
// 4. RUNDOWNS COLLECTION
// ----------------------------------------------------------------------------
export async function getInitialRundowns(): Promise<RundownItem[]> {
  const defaultItems: RundownItem[] = [
    ...(schoolMetadata.rundowns.BALI as RundownItem[]).map((r, idx) => ({ ...r, id: `bali_${idx}` })),
    ...(schoolMetadata.rundowns.YOGYAKARTA as RundownItem[]).map((r, idx) => ({ ...r, id: `yogya_${idx}` })),
  ];

  try {
    const res = await fetch('/api/db');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.rundowns) && data.rundowns.length > 0) {
        return data.rundowns;
      }
    }
  } catch (err) {
    console.warn('Error loading rundowns from Cloud SQL:', err);
  }
  return defaultItems;
}

export async function saveRundownItem(item: RundownItem): Promise<RundownItem> {
  const itemId = item.id || `rd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const itemToSave = { ...item, id: itemId };
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveRundown', payload: itemToSave }),
    });
  } catch (err) {
    console.error('Error saving rundown item to Cloud SQL:', err);
  }
  return itemToSave;
}

export async function deleteRundownItem(itemId: string): Promise<void> {
  await rundownsRepo.deleteOne(itemId);
}

export async function resetRundownsToDefault(): Promise<RundownItem[]> {
  const db = await getDb();
  const defaultItems: RundownItem[] = [
    ...(schoolMetadata.rundowns.BALI as RundownItem[]).map((r, idx) => ({ ...r, id: `bali_${idx}` })),
    ...(schoolMetadata.rundowns.YOGYAKARTA as RundownItem[]).map((r, idx) => ({ ...r, id: `yogya_${idx}` })),
  ];

  if (!db) return defaultItems;

  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return defaultItems;

    const snap = await sdk.getDocs(sdk.collection(db, 'rundowns'));
    const batch1 = sdk.writeBatch(db);
    snap.docs.forEach((d: any) => batch1.delete(d.ref));
    await batch1.commit();

    const batch2 = sdk.writeBatch(db);
    defaultItems.forEach((item) => {
      const ref = sdk.doc(db, 'rundowns', item.id!);
      batch2.set(ref, cleanData(item));
    });
    await batch2.commit();
  } catch (err) {
    console.error('Error resetting rundowns:', err);
  }
  return defaultItems;
}
