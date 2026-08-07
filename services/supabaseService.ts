import { supabase } from '@/lib/supabaseClient';
import { Student, SchoolClass, AppSettings, RundownItem, AdminCredentials } from '@/types';
import schoolMetadata from '@/config/schoolMetadata.json';
import { sortClassesAlphabetically, normalizeClassName } from '@/lib/utils';

export async function getDb(): Promise<any> {
  return null;
}

export async function getFirebaseSDK(): Promise<any> {
  return null;
}

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

// ----------------------------------------------------------------------------
// SAFE UPSERT HELPER (Handles missing columns dynamically without failing sync)
// ----------------------------------------------------------------------------
export async function safeUpsert(table: string, data: any[], onConflict = 'id'): Promise<void> {
  if (!data || data.length === 0) return;
  let currentData = [...data];
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    const { error } = await supabase.from(table).upsert(currentData, { onConflict });
    if (!error) return;

    const fullMsg = `${error.message || ''} ${error.details || ''} ${error.hint || ''} ${JSON.stringify(error)}`;
    
    // Find missing column names from any error pattern
    const matches = [
      ...fullMsg.matchAll(/Could not find the ['"]?([^'"]+?)['"]? column/gi),
      ...fullMsg.matchAll(/column ['"]?([^'"]+?)['"]? of relation/gi),
      ...fullMsg.matchAll(/column ['"]?([^'"]+?)['"]? does not exist/gi),
      ...fullMsg.matchAll(/has no column ['"]?([^'"]+?)['"]?/gi),
    ];

    const missingCols = Array.from(new Set(matches.map((m) => m[1]).filter(Boolean)));

    if (missingCols.length > 0) {
      console.warn(`[Supabase] Table '${table}' missing column(s): ${missingCols.join(', ')}. Stripping keys and retrying...`);
      currentData = currentData.map((item) => {
        if (item && typeof item === 'object') {
          const newItem = { ...item };
          for (const col of missingCols) {
            delete newItem[col];
          }
          return newItem;
        }
        return item;
      });
      attempts++;
    } else {
      console.error(`[Supabase] Upsert error on table '${table}':`, error);
      throw new Error(`Supabase ${table} upsert error: ${error.message || fullMsg}`);
    }
  }

  // If maxAttempts reached, attempt one final call or throw clear error
  const { error: finalErr } = await supabase.from(table).upsert(currentData, { onConflict });
  if (finalErr) {
    throw new Error(`Supabase ${table} upsert error after ${maxAttempts} attempts: ${finalErr.message}`);
  }
}

// ----------------------------------------------------------------------------
// 1. STUDENTS COLLECTION / TABLE
// ----------------------------------------------------------------------------
export async function getStudentByNis(nis: string): Promise<Student | null> {
  const cleanNis = nis.trim();
  if (!cleanNis) return null;

  try {
    // 1. Direct exact / ilike lookup
    const { data: exactData, error: exactErr } = await supabase
      .from('students')
      .select('*')
      .ilike('nis', cleanNis)
      .maybeSingle();

    if (exactData && !exactErr) {
      const s = { ...exactData } as Student;
      s.className = normalizeClassName(s.className);
      return s;
    }

    // 2. Prefix lookup (e.g., entering 5-digit NIS "25082")
    const { data: prefixData, error: prefixErr } = await supabase
      .from('students')
      .select('*')
      .ilike('nis', `${cleanNis}%`)
      .limit(1)
      .maybeSingle();

    if (prefixData && !prefixErr) {
      const s = { ...prefixData } as Student;
      s.className = normalizeClassName(s.className);
      return s;
    }

    // 3. Contains lookup if needed
    const { data: containsData, error: containsErr } = await supabase
      .from('students')
      .select('*')
      .ilike('nis', `%${cleanNis}%`)
      .limit(1)
      .maybeSingle();

    if (containsData && !containsErr) {
      const s = { ...containsData } as Student;
      s.className = normalizeClassName(s.className);
      return s;
    }

    return null;
  } catch (err) {
    console.error('Error fetching student by NIS from Supabase:', err);
    return null;
  }
}

export async function getStudentsByClass(className: string): Promise<Student[]> {
  try {
    const normalizedTargetClass = normalizeClassName(className);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('className', normalizedTargetClass);

    if (data && !error) {
      return data.map((d) => ({
        ...d,
        className: normalizeClassName(d.className),
      })) as Student[];
    }
    return [];
  } catch (err) {
    console.error('Error fetching students by class from Supabase:', err);
    return [];
  }
}

export async function getInitialStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*');

    if (data && !error) {
      const students = data as Student[];
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

    return [];
  } catch (err) {
    console.warn('Error loading students from Supabase:', err);
    return [];
  }
}

export async function saveStudents(students: Student[]): Promise<void> {
  if (!students || students.length === 0) return;
  const CHUNK_SIZE = 50;
  const cleaned = students.map((s) => cleanData(s));
  for (let i = 0; i < cleaned.length; i += CHUNK_SIZE) {
    const chunk = cleaned.slice(i, i + CHUNK_SIZE);
    await safeUpsert('students', chunk, 'id');
  }
}

export async function saveSingleStudent(student: Student): Promise<void> {
  if (!student || !student.id) return;
  await safeUpsert('students', [cleanData(student)], 'id');
}

export async function deleteSingleStudent(studentId: string): Promise<void> {
  if (!studentId) return;
  const { error } = await supabase.from('students').delete().eq('id', studentId);
  if (error) {
    console.error('Error deleting student from Supabase:', error);
    throw new Error(`Supabase student delete error: ${error.message || JSON.stringify(error)}`);
  }
}

export async function deleteMultipleStudents(studentIds: string[]): Promise<void> {
  if (!studentIds || studentIds.length === 0) return;
  const CHUNK_SIZE = 100;
  for (let i = 0; i < studentIds.length; i += CHUNK_SIZE) {
    const chunk = studentIds.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase.from('students').delete().in('id', chunk);
    if (error) {
      console.error('Error deleting multiple students from Supabase:', error);
      throw new Error(`Supabase students delete error: ${error.message || JSON.stringify(error)}`);
    }
  }
}

export async function clearAllStudents(): Promise<void> {
  const { error } = await supabase.from('students').delete().neq('id', '');
  if (error) {
    console.error('Error clearing students in Supabase:', error);
    throw new Error(`Supabase clear students error: ${error.message || JSON.stringify(error)}`);
  }
}

// ----------------------------------------------------------------------------
// 2. CLASSES COLLECTION / TABLE
// ----------------------------------------------------------------------------
export async function getInitialClasses(): Promise<SchoolClass[]> {
  try {
    const { data, error } = await supabase.from('classes').select('*');

    if (data && !error) {
      const classes = data.map((cls) => ({
        ...cls,
        name: normalizeClassName(cls.name),
      })) as SchoolClass[];
      return sortClassesAlphabetically(classes);
    }

    return [];
  } catch (err) {
    console.warn('Error loading classes from Supabase:', err);
    return [];
  }
}

export async function saveClasses(classes: SchoolClass[]): Promise<void> {
  if (!classes || classes.length === 0) return;
  const CHUNK_SIZE = 50;
  const cleaned = classes.map((c) => cleanData(c));
  for (let i = 0; i < cleaned.length; i += CHUNK_SIZE) {
    const chunk = cleaned.slice(i, i + CHUNK_SIZE);
    await safeUpsert('classes', chunk, 'id');
  }
}

export async function deleteSingleClass(classId: string): Promise<void> {
  if (!classId) return;
  const { error } = await supabase.from('classes').delete().eq('id', classId);
  if (error) {
    console.error('Error deleting class from Supabase:', error);
    throw new Error(`Supabase class delete error: ${error.message || JSON.stringify(error)}`);
  }
}

export async function clearAllClasses(): Promise<void> {
  const { error } = await supabase.from('classes').delete().neq('id', '');
  if (error) {
    console.error('Error clearing classes in Supabase:', error);
    throw new Error(`Supabase clear classes error: ${error.message || JSON.stringify(error)}`);
  }
}

// ----------------------------------------------------------------------------
// 3. SETTINGS TABLE
// ----------------------------------------------------------------------------
export async function getInitialSettings(): Promise<AppSettings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('data')
      .eq('id', 'global')
      .maybeSingle();

    if (data && data.data && !error) {
      return data.data as AppSettings;
    }

    return schoolMetadata.defaultSettings as AppSettings;
  } catch (err) {
    console.error('Error loading settings from Supabase:', err);
    return schoolMetadata.defaultSettings as AppSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await safeUpsert('settings', [{ id: 'global', data: cleanData(settings) }], 'id');
}

export async function getAdminCredentialsSupabase(): Promise<AdminCredentials | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('data')
      .eq('id', 'admin')
      .maybeSingle();

    if (data && data.data && !error) {
      return data.data as AdminCredentials;
    }
    return null;
  } catch (err) {
    console.error('Error loading admin credentials from Supabase:', err);
    return null;
  }
}

export async function saveAdminCredentialsSupabase(creds: AdminCredentials): Promise<void> {
  await safeUpsert('settings', [{ id: 'admin', data: cleanData(creds) }], 'id');
}

// ----------------------------------------------------------------------------
// 4. RUNDOWNS TABLE
// ----------------------------------------------------------------------------
export async function getInitialRundowns(): Promise<RundownItem[]> {
  try {
    const { data, error } = await supabase.from('rundowns').select('*');

    if (data && !error) {
      const items = data as RundownItem[];
      return items.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
    }

    return [];
  } catch (err) {
    console.warn('Error loading rundowns from Supabase:', err);
    return [];
  }
}

export async function saveRundownItem(item: RundownItem): Promise<RundownItem> {
  const itemId = item.id || `rd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const itemToSave = { ...item, id: itemId };
  await safeUpsert('rundowns', [cleanData(itemToSave)], 'id');
  return itemToSave;
}

export async function deleteRundownItem(itemId: string): Promise<void> {
  if (!itemId) return;
  const { error } = await supabase.from('rundowns').delete().eq('id', itemId);
  if (error) {
    console.error('Error deleting rundown item from Supabase:', error);
    throw new Error(`Supabase rundown delete error: ${error.message || JSON.stringify(error)}`);
  }
}

export async function resetRundownsToDefault(): Promise<RundownItem[]> {
  const defaultItems: RundownItem[] = [
    ...(schoolMetadata.rundowns.BALI as RundownItem[]).map((r, idx) => ({ ...r, id: `bali_${idx}` })),
    ...(schoolMetadata.rundowns.YOGYAKARTA as RundownItem[]).map((r, idx) => ({ ...r, id: `yogya_${idx}` })),
  ];

  const { error: delErr } = await supabase.from('rundowns').delete().neq('id', '');
  if (delErr) console.warn('Warning clearing rundowns:', delErr);
  
  const cleaned = defaultItems.map((item) => cleanData(item));
  await safeUpsert('rundowns', cleaned, 'id');
  return defaultItems;
}
