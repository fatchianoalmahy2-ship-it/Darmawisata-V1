import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, getDocs, collection, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';
import {
  bulkSaveStudentsList,
  saveOrUpdateClass,
  saveAppSettings,
  saveRundownItem,
} from '@/src/db/repository';

export async function runMigration() {
  const configToUse = firebaseConfig;
  const app = getApps().length === 0 ? initializeApp(configToUse) : getApps()[0];
  const databaseId = configToUse.firestoreDatabaseId || '(default)';
  const db = getFirestore(app, databaseId);

  // 1. Migrate Students
  const studentSnap = await getDocs(collection(db, 'students'));
  const students: any[] = [];
  studentSnap.forEach((d) => {
    students.push({ id: d.id, ...d.data() });
  });

  if (students.length > 0) {
    await bulkSaveStudentsList(students);
  }

  // 2. Migrate Classes
  const classSnap = await getDocs(collection(db, 'classes'));
  const classes: any[] = [];
  classSnap.forEach((d) => {
    classes.push({ id: d.id, ...d.data() });
  });

  for (const cls of classes) {
    await saveOrUpdateClass(cls);
  }

  // 3. Migrate Settings
  const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
  let migratedSettings = false;
  if (settingsSnap.exists()) {
    await saveAppSettings(settingsSnap.data() as any);
    migratedSettings = true;
  }

  // 4. Migrate Rundowns
  const rundownSnap = await getDocs(collection(db, 'rundowns'));
  const rundowns: any[] = [];
  rundownSnap.forEach((d) => {
    rundowns.push({ id: d.id, ...d.data() });
  });

  for (const rd of rundowns) {
    await saveRundownItem(rd);
  }

  return {
    studentsCount: students.length,
    classesCount: classes.length,
    settingsMigrated: migratedSettings,
    rundownsCount: rundowns.length,
  };
}

export async function GET() {
  try {
    const stats = await runMigration();
    return NextResponse.json({
      success: true,
      message: 'Migration from Firestore to Cloud SQL completed successfully',
      stats,
    });
  } catch (error: any) {
    console.error('Migration endpoint error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Migration failed' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const stats = await runMigration();
    return NextResponse.json({
      success: true,
      message: 'Migration from Firestore to Cloud SQL completed successfully',
      stats,
    });
  } catch (error: any) {
    console.error('Migration endpoint error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Migration failed' }, { status: 500 });
  }
}
