import { db } from './index.ts';
import { students, classes, settings, rundowns } from './schema.ts';
import { eq, inArray } from 'drizzle-orm';
import { Student, SchoolClass, AppSettings, RundownItem, AdminCredentials } from '@/types';

// In-Memory Caches to prevent database overloading on frequent read queries
let studentCache: Student[] | null = null;
let lastStudentFetchTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds TTL

export function invalidateStudentCache() {
  studentCache = null;
  lastStudentFetchTime = 0;
}

let classCache: SchoolClass[] | null = null;
let lastClassFetchTime = 0;

export function invalidateClassCache() {
  classCache = null;
  lastClassFetchTime = 0;
}

export async function getAllStudents(forceRefresh = false): Promise<Student[]> {
  const now = Date.now();
  if (!forceRefresh && studentCache && now - lastStudentFetchTime < CACHE_TTL_MS) {
    return studentCache;
  }
  try {
    const rows = await db.select().from(students);
    const result: Student[] = rows.map((r) => ({
      id: r.id,
      nis: r.nis,
      name: r.name,
      className: r.className,
      gender: r.gender as any,
      destination: (r.destination as any) || undefined,
      wave: (r.wave as any) || undefined,
      tShirtSize: (r.tShirtSize as any) || undefined,
      tShirtDesign: (r.tShirtDesign as any) || undefined,
      parentName: r.parentName || undefined,
      parentJob: r.parentJob || undefined,
      parentAddress: r.parentAddress || undefined,
      parentPhone: r.parentPhone || undefined,
      studentPhone: r.studentPhone || undefined,
      medicalHistory: r.medicalHistory || undefined,
      waiverType: (r.waiverType as any) || undefined,
      busNumber: r.busNumber ?? undefined,
      seatNumber: r.seatNumber ?? undefined,
      roomNumber: r.roomNumber ?? undefined,
      isRegistered: r.isRegistered,
      updatedAt: r.updatedAt || undefined,
    }));
    studentCache = result;
    lastStudentFetchTime = now;
    return result;
  } catch (error) {
    console.error('Database query getAllStudents failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function lookupStudents(query?: string, classNameFilter?: string): Promise<Student[]> {
  const all = await getAllStudents();
  if (!query && (!classNameFilter || classNameFilter === 'ALL')) {
    return all;
  }

  const cleanQ = (query || '').trim().toLowerCase();
  const normQ = cleanQ.replace(/[^0-9a-zA-Z]/g, '');

  return all.filter((s) => {
    const matchesClass = !classNameFilter || classNameFilter === 'ALL' || s.className === classNameFilter;
    if (!matchesClass) return false;

    if (!cleanQ) return true;

    const sNis = s.nis.toLowerCase();
    const sNormNis = s.nis.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
    const sName = s.name.toLowerCase();

    return (
      sName.includes(cleanQ) ||
      sNis.includes(cleanQ) ||
      (normQ.length > 0 && sNormNis.includes(normQ)) ||
      (normQ.length >= 3 && sNormNis.startsWith(normQ))
    );
  });
}

export async function saveOrUpdateStudent(student: Student): Promise<void> {
  try {
    await db
      .insert(students)
      .values({
        id: student.id,
        nis: student.nis || '',
        name: student.name || '',
        className: student.className || '',
        gender: student.gender || 'LAKI-LAKI',
        destination: student.destination || null,
        wave: student.wave || null,
        tShirtSize: student.tShirtSize || null,
        tShirtDesign: student.tShirtDesign || null,
        parentName: student.parentName || null,
        parentJob: student.parentJob || null,
        parentAddress: student.parentAddress || null,
        parentPhone: student.parentPhone || null,
        studentPhone: student.studentPhone || null,
        medicalHistory: student.medicalHistory || null,
        waiverType: student.waiverType || null,
        busNumber: student.busNumber ?? null,
        seatNumber: student.seatNumber ?? null,
        roomNumber: student.roomNumber ?? null,
        isRegistered: student.isRegistered ?? false,
        updatedAt: student.updatedAt || new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: students.id,
        set: {
          nis: student.nis || '',
          name: student.name || '',
          className: student.className || '',
          gender: student.gender || 'LAKI-LAKI',
          destination: student.destination || null,
          wave: student.wave || null,
          tShirtSize: student.tShirtSize || null,
          tShirtDesign: student.tShirtDesign || null,
          parentName: student.parentName || null,
          parentJob: student.parentJob || null,
          parentAddress: student.parentAddress || null,
          parentPhone: student.parentPhone || null,
          studentPhone: student.studentPhone || null,
          medicalHistory: student.medicalHistory || null,
          waiverType: student.waiverType || null,
          busNumber: student.busNumber ?? null,
          seatNumber: student.seatNumber ?? null,
          roomNumber: student.roomNumber ?? null,
          isRegistered: student.isRegistered ?? false,
          updatedAt: student.updatedAt || new Date().toISOString(),
        },
      });
    invalidateStudentCache();
  } catch (error) {
    console.error('Database query saveOrUpdateStudent failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function bulkSaveStudentsList(studentsList: Student[]): Promise<void> {
  try {
    for (const student of studentsList) {
      await saveOrUpdateStudent(student);
    }
    invalidateStudentCache();
  } catch (error) {
    console.error('Database bulk save students failed:', error);
    throw new Error('Database bulk save failed', { cause: error });
  }
}

export async function deleteStudentById(id: string): Promise<void> {
  try {
    await db.delete(students).where(eq(students.id, id));
    invalidateStudentCache();
  } catch (error) {
    console.error('Database deleteStudentById failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function deleteStudentsByIds(ids: string[]): Promise<void> {
  try {
    if (ids.length === 0) return;
    await db.delete(students).where(inArray(students.id, ids));
    invalidateStudentCache();
  } catch (error) {
    console.error('Database deleteStudentsByIds failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function getAllClasses(forceRefresh = false): Promise<SchoolClass[]> {
  const now = Date.now();
  if (!forceRefresh && classCache && now - lastClassFetchTime < CACHE_TTL_MS) {
    return classCache;
  }
  try {
    const rows = await db.select().from(classes);
    const result: SchoolClass[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      department: r.department,
      totalStudents: r.totalStudents,
      homeroomTeacher: r.homeroomTeacher,
      teacherPhone: r.teacherPhone || undefined,
      teacherPassword: r.teacherPassword || undefined,
    }));
    classCache = result;
    lastClassFetchTime = now;
    return result;
  } catch (error) {
    console.error('Database query getAllClasses failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function saveOrUpdateClass(cls: SchoolClass): Promise<void> {
  try {
    await db
      .insert(classes)
      .values({
        id: cls.id,
        name: cls.name,
        department: cls.department,
        totalStudents: cls.totalStudents || 0,
        homeroomTeacher: cls.homeroomTeacher || '',
        teacherPhone: cls.teacherPhone || null,
        teacherPassword: cls.teacherPassword || null,
      })
      .onConflictDoUpdate({
        target: classes.id,
        set: {
          name: cls.name,
          department: cls.department,
          totalStudents: cls.totalStudents || 0,
          homeroomTeacher: cls.homeroomTeacher || '',
          teacherPhone: cls.teacherPhone || null,
          teacherPassword: cls.teacherPassword || null,
        },
      });
    invalidateClassCache();
  } catch (error) {
    console.error('Database query saveOrUpdateClass failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function deleteClassById(id: string): Promise<void> {
  try {
    await db.delete(classes).where(eq(classes.id, id));
    invalidateClassCache();
  } catch (error) {
    console.error('Database deleteClassById failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function deleteAllStudents(): Promise<void> {
  try {
    await db.delete(students);
    invalidateStudentCache();
  } catch (error) {
    console.error('Database deleteAllStudents failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function deleteAllClasses(): Promise<void> {
  try {
    await db.delete(classes);
    invalidateClassCache();
  } catch (error) {
    console.error('Database deleteAllClasses failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function getAdminCredentialsDb(): Promise<AdminCredentials | null> {
  try {
    const rows = await db.select().from(settings).where(eq(settings.id, 'admin_credentials'));
    if (rows.length === 0) return null;
    return rows[0].data as AdminCredentials;
  } catch (error) {
    console.error('Database query getAdminCredentialsDb failed:', error);
    return null;
  }
}

export async function saveAdminCredentialsDb(creds: AdminCredentials): Promise<void> {
  try {
    await db
      .insert(settings)
      .values({
        id: 'admin_credentials',
        data: creds,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: settings.id,
        set: {
          data: creds,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error('Database query saveAdminCredentialsDb failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function getAppSettings(): Promise<AppSettings | null> {
  try {
    const rows = await db.select().from(settings).where(eq(settings.id, 'app_settings'));
    if (rows.length === 0) return null;
    return rows[0].data as AppSettings;
  } catch (error) {
    console.error('Database query getAppSettings failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function saveAppSettings(appSettings: AppSettings): Promise<void> {
  try {
    await db
      .insert(settings)
      .values({
        id: 'app_settings',
        data: appSettings,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: settings.id,
        set: {
          data: appSettings,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error('Database query saveAppSettings failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function getAllRundowns(): Promise<RundownItem[]> {
  try {
    const rows = await db.select().from(rundowns);
    return rows.map((r) => ({
      id: r.id,
      day: r.day,
      time: r.time,
      activity: r.activity,
      location: r.location,
      notes: r.notes || undefined,
    }));
  } catch (error) {
    console.error('Database query getAllRundowns failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}

export async function saveRundownItem(item: RundownItem): Promise<void> {
  try {
    const itemId = item.id || `rd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db
      .insert(rundowns)
      .values({
        id: itemId,
        day: item.day,
        time: item.time,
        activity: item.activity,
        location: item.location,
        notes: item.notes || null,
      })
      .onConflictDoUpdate({
        target: rundowns.id,
        set: {
          day: item.day,
          time: item.time,
          activity: item.activity,
          location: item.location,
          notes: item.notes || null,
        },
      });
  } catch (error) {
    console.error('Database query saveRundownItem failed:', error);
    throw new Error('Database query failed', { cause: error });
  }
}
