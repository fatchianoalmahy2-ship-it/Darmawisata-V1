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
export async function getStudentByNis(nis: string): Promise<Student | null> {
  const db = await getDb();
  const cleanNis = nis.trim();
  const normSearch = normalizeNis(cleanNis);

  const findInArray = (arr: Student[]) => {
    return arr.find((s) => s.nis.trim().toLowerCase() === cleanNis.toLowerCase() || normalizeNis(s.nis) === normSearch);
  };

  if (!db) {
    return findInArray(sampleStudentsData as Student[]) || null;
  }

  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return findInArray(sampleStudentsData as Student[]) || null;

    const q = sdk.query(sdk.collection(db, 'students'), sdk.where('nis', '==', cleanNis));
    const snap = await sdk.getDocs(q);

    if (!snap.empty) {
      const doc = snap.docs[0];
      const s = { id: doc.id, ...doc.data() } as Student;
      s.className = normalizeClassName(s.className);
      return s;
    }

    const all = await getInitialStudents();
    return findInArray(all) || null;
  } catch (err) {
    console.error('Error fetching student by NIS:', err);
    return findInArray(sampleStudentsData as Student[]) || null;
  }
}

export async function getStudentsByClass(className: string): Promise<Student[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return [];
    
    const normalizedTargetClass = normalizeClassName(className);
    const q = sdk.query(sdk.collection(db, 'students'), sdk.where('className', '==', normalizedTargetClass));
    const snap = await sdk.getDocs(q);
    
    const items: Student[] = [];
    snap.forEach((doc: any) => {
      const s = { id: doc.id, ...doc.data() } as Student;
      s.className = normalizeClassName(s.className);
      items.push(s);
    });
    return items;
  } catch (err) {
    console.error('Error fetching students by class:', err);
    return [];
  }
}

export async function getInitialStudents(): Promise<Student[]> {
  const db = await getDb();
  if (!db) return sampleStudentsData as Student[];

  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return sampleStudentsData as Student[];

    const students = await studentsRepo.getAll();

    if (students.length > 0) {
      students.forEach((s) => {
        s.className = normalizeClassName(s.className);
        if (!s.isRegistered) {
          delete s.destination;
          delete s.wave;
          delete s.tShirtSize;
          delete s.tShirtDesign;
          delete s.parentName;
          delete s.parentAddress;
          delete s.parentPhone;
          delete s.studentPhone;
          delete s.medicalHistory;
          delete s.busNumber;
          delete s.seatNumber;
          delete s.roomNumber;
        }
      });
      return students;
    }

    const statusRef = sdk.doc(db, 'system', 'status');
    let isSeeded = false;
    try {
      const statusSnap = await sdk.getDoc(statusRef);
      isSeeded = statusSnap.exists() && statusSnap.data()?.studentsSeeded === true;
    } catch (e) {
      isSeeded = false;
    }

    if (!isSeeded) {
      const initial = sampleStudentsData as Student[];
      await saveStudents(initial);
      try {
        await sdk.setDoc(statusRef, { studentsSeeded: true }, { merge: true });
      } catch (e) {
        // Ignore write failure on quota
      }
      return initial;
    }
    return [];
  } catch (err) {
    console.warn('Error loading students from Firestore (falling back to cached/local):', err);
    return sampleStudentsData as Student[];
  }
}

export async function saveStudents(students: Student[]): Promise<void> {
  await studentsRepo.saveBatch(students);
}

export async function saveSingleStudent(student: Student): Promise<void> {
  await studentsRepo.saveOne(student);
}

export async function deleteSingleStudent(studentId: string): Promise<void> {
  await studentsRepo.deleteOne(studentId);
}

export async function clearAllStudents(): Promise<void> {
  await studentsRepo.clearAll();
}

// ----------------------------------------------------------------------------
// 2. CLASSES COLLECTION
// ----------------------------------------------------------------------------
export async function getInitialClasses(): Promise<SchoolClass[]> {
  const db = await getDb();
  if (!db) return sortClassesAlphabetically(schoolClassesData as SchoolClass[]);

  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return sortClassesAlphabetically(schoolClassesData as SchoolClass[]);

    let querySnapshot;
    try {
      querySnapshot = await sdk.getDocs(sdk.collection(db, 'classes'));
    } catch (fetchErr: any) {
      console.warn('Remote getDocs for classes failed, checking cache fallback:', fetchErr?.message);
      try {
        const { getDocsFromCache } = await import('firebase/firestore');
        querySnapshot = await getDocsFromCache(sdk.collection(db, 'classes'));
      } catch (cacheErr) {
        return sortClassesAlphabetically(schoolClassesData as SchoolClass[]);
      }
    }

    if (querySnapshot && !querySnapshot.empty) {
      const classes: SchoolClass[] = [];
      querySnapshot.forEach((d: any) => {
        const cls = d.data() as SchoolClass;
        cls.name = normalizeClassName(cls.name);
        classes.push(cls);
      });
      return sortClassesAlphabetically(classes);
    }

    const statusRef = sdk.doc(db, 'system', 'status');
    let isSeeded = false;
    try {
      const statusSnap = await sdk.getDoc(statusRef);
      isSeeded = statusSnap.exists() && statusSnap.data()?.classesSeeded === true;
    } catch (e) {
      isSeeded = true;
    }

    if (isSeeded) {
      console.log('Database initialized: Class collection was intentionally cleared or quota limit reached.');
      return [];
    }

    const batch = sdk.writeBatch(db);
    const initial = sortClassesAlphabetically(schoolClassesData as SchoolClass[]);
    initial.forEach((cls) => {
      const ref = sdk.doc(db, 'classes', cls.id);
      batch.set(ref, cleanData(cls));
    });
    batch.set(statusRef, { classesSeeded: true }, { merge: true });
    await batch.commit();
    return initial;
  } catch (err) {
    console.warn('Error loading classes from Firestore, falling back to static data:', err);
    return sortClassesAlphabetically(schoolClassesData as SchoolClass[]);
  }
}

export async function saveClasses(classes: SchoolClass[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const sdk = await getFirebaseSDK();
  if (sdk) {
    await sdk.setDoc(sdk.doc(db, 'system', 'status'), { classesSeeded: true }, { merge: true });
  }
  await classesRepo.saveBatch(classes);
}

export async function deleteSingleClass(classId: string): Promise<void> {
  await classesRepo.deleteOne(classId);
}

export async function clearAllClasses(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const sdk = await getFirebaseSDK();
  if (sdk) {
    await sdk.setDoc(sdk.doc(db, 'system', 'status'), { classesSeeded: true }, { merge: true });
  }
  await classesRepo.clearAll();
}

// ----------------------------------------------------------------------------
// 3. SETTINGS DOCUMENT
// ----------------------------------------------------------------------------
export async function getInitialSettings(): Promise<AppSettings> {
  const db = await getDb();
  if (!db) return schoolMetadata.defaultSettings as AppSettings;

  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return schoolMetadata.defaultSettings as AppSettings;

    const ref = sdk.doc(db, 'settings', 'global');
    try {
      const snap = await sdk.getDoc(ref);
      if (snap.exists()) {
        return snap.data() as AppSettings;
      }
      const defaultStg = schoolMetadata.defaultSettings as AppSettings;
      await sdk.setDoc(ref, defaultStg);
      return defaultStg;
    } catch (docErr: any) {
      console.warn('Remote getDoc for settings failed, checking cache:', docErr?.message);
      try {
        const { getDocFromCache } = await import('firebase/firestore');
        const snap = await getDocFromCache(ref);
        if (snap.exists()) {
          return snap.data() as AppSettings;
        }
      } catch (cacheErr) {
        // Fallback to default
      }
      return schoolMetadata.defaultSettings as AppSettings;
    }
  } catch (err) {
    console.error('Error loading settings from Firestore:', err);
    return schoolMetadata.defaultSettings as AppSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return;

    await sdk.setDoc(sdk.doc(db, 'settings', 'global'), cleanData(settings), { merge: true });
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
  }
}

export async function getAdminCredentialsFirestore(): Promise<AdminCredentials | null> {
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
    console.error('Error loading admin credentials from Firestore:', err);
    return null;
  }
}

export async function saveAdminCredentialsFirestore(creds: AdminCredentials): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return;

    await sdk.setDoc(sdk.doc(db, 'settings', 'admin'), cleanData(creds), { merge: true });
  } catch (err) {
    console.error('Error saving admin credentials to Firestore:', err);
  }
}

// ----------------------------------------------------------------------------
// 4. RUNDOWNS COLLECTION
// ----------------------------------------------------------------------------
export async function getInitialRundowns(): Promise<RundownItem[]> {
  const db = await getDb();
  const defaultItems: RundownItem[] = [
    ...(schoolMetadata.rundowns.BALI as RundownItem[]).map((r, idx) => ({ ...r, id: `bali_${idx}` })),
    ...(schoolMetadata.rundowns.YOGYAKARTA as RundownItem[]).map((r, idx) => ({ ...r, id: `yogya_${idx}` })),
  ];

  if (!db) return defaultItems;

  try {
    const sdk = await getFirebaseSDK();
    if (!sdk) return defaultItems;

    let querySnapshot;
    try {
      querySnapshot = await sdk.getDocs(sdk.collection(db, 'rundowns'));
    } catch (fetchErr: any) {
      console.warn('Remote getDocs for rundowns failed, checking cache fallback:', fetchErr?.message);
      try {
        const { getDocsFromCache } = await import('firebase/firestore');
        querySnapshot = await getDocsFromCache(sdk.collection(db, 'rundowns'));
      } catch (cacheErr) {
        return defaultItems;
      }
    }

    if (querySnapshot && !querySnapshot.empty) {
      const items: RundownItem[] = [];
      querySnapshot.forEach((d: any) => {
        items.push({ id: d.id, ...d.data() } as RundownItem);
      });
      return items.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
    }

    const batch = sdk.writeBatch(db);
    defaultItems.forEach((item) => {
      const ref = sdk.doc(db, 'rundowns', item.id!);
      batch.set(ref, cleanData(item));
    });
    await batch.commit();
    return defaultItems;
  } catch (err) {
    console.warn('Error loading rundowns from Firestore, falling back to default:', err);
    return defaultItems;
  }
}

export async function saveRundownItem(item: RundownItem): Promise<RundownItem> {
  const itemId = item.id || `rd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const itemToSave = { ...item, id: itemId };
  await rundownsRepo.saveOne(itemToSave);
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
