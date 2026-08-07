import { NextRequest, NextResponse } from 'next/server';
import {
  getAllStudents,
  saveOrUpdateStudent,
  bulkSaveStudentsList,
  deleteStudentById,
  deleteStudentsByIds,
  deleteAllStudents,
  getAllClasses,
  saveOrUpdateClass,
  deleteClassById,
  deleteAllClasses,
  getAppSettings,
  saveAppSettings,
  getAdminCredentialsDb,
  saveAdminCredentialsDb,
  getAllRundowns,
  saveRundownItem,
} from '@/src/db/repository';
import sampleStudents from '@/config/sampleStudents.json';
import schoolClasses from '@/config/schoolClasses.json';
import schoolMetadata from '@/config/schoolMetadata.json';

export async function GET() {
  try {
    let [students, classes, settings, rundowns] = await Promise.all([
      getAllStudents(),
      getAllClasses(),
      getAppSettings(),
      getAllRundowns(),
    ]);

    // ONLY perform initial setup/seeding on first boot when settings is missing
    const isFirstInitialization = !settings;

    if (isFirstInitialization) {
      console.log('Database first boot detected. Initializing schema and seed data...');
      
      // Auto-migrate from Firestore if possible
      try {
        const { runMigration } = await import('../migrate/route');
        await runMigration();
        [students, classes, settings, rundowns] = await Promise.all([
          getAllStudents(),
          getAllClasses(),
          getAppSettings(),
          getAllRundowns(),
        ]);
      } catch (migErr) {
        console.warn('Auto-migration from Firestore skipped or failed:', migErr);
      }

      // Seed sample students if still empty on first boot
      if (students.length === 0 && Array.isArray(sampleStudents) && sampleStudents.length > 0) {
        await bulkSaveStudentsList(sampleStudents as any);
        students = await getAllStudents();
      }

      // Seed classes if empty on first boot
      if (classes.length === 0 && Array.isArray(schoolClasses) && schoolClasses.length > 0) {
        for (const cls of schoolClasses as any) {
          await saveOrUpdateClass(cls);
        }
        classes = await getAllClasses();
      }

      // Seed default settings
      if (schoolMetadata.defaultSettings) {
        await saveAppSettings(schoolMetadata.defaultSettings as any);
        settings = await getAppSettings();
      }

      // Seed default rundowns
      if (rundowns.length === 0 && Array.isArray(schoolMetadata.defaultRundowns) && schoolMetadata.defaultRundowns.length > 0) {
        for (const rd of schoolMetadata.defaultRundowns as any) {
          await saveRundownItem(rd);
        }
        rundowns = await getAllRundowns();
      }
    }

    return NextResponse.json({
      students,
      classes,
      settings: settings || schoolMetadata.defaultSettings,
      rundowns,
    });
  } catch (error: any) {
    console.error('API /api/db GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch database data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case 'saveStudent':
        await saveOrUpdateStudent(payload);
        return NextResponse.json({ success: true });

      case 'bulkSaveStudents':
        await bulkSaveStudentsList(payload);
        return NextResponse.json({ success: true });

      case 'deleteStudent':
        const studentIdToDelete = typeof payload === 'object' && payload?.studentId ? payload.studentId : payload;
        if (studentIdToDelete) {
          await deleteStudentById(String(studentIdToDelete));
        }
        return NextResponse.json({ success: true });

      case 'deleteBatchStudents':
      case 'bulkDeleteStudents':
        const idsToDelete = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.studentIds)
          ? payload.studentIds
          : [];
        if (idsToDelete.length > 0) {
          await deleteStudentsByIds(idsToDelete);
        }
        return NextResponse.json({ success: true });

      case 'clearStudents':
      case 'deleteAllStudents':
        await deleteAllStudents();
        return NextResponse.json({ success: true });

      case 'saveClass':
        await saveOrUpdateClass(payload);
        return NextResponse.json({ success: true });

      case 'deleteClass':
        const classIdToDelete = typeof payload === 'object' && payload?.classId ? payload.classId : payload;
        if (classIdToDelete) {
          await deleteClassById(String(classIdToDelete));
        }
        return NextResponse.json({ success: true });

      case 'clearClasses':
      case 'deleteAllClasses':
        await deleteAllClasses();
        return NextResponse.json({ success: true });

      case 'saveSettings':
        await saveAppSettings(payload);
        return NextResponse.json({ success: true });

      case 'getAdminCredentials':
        const creds = await getAdminCredentialsDb();
        return NextResponse.json({ success: true, credentials: creds });

      case 'saveAdminCredentials':
        await saveAdminCredentialsDb(payload);
        return NextResponse.json({ success: true });

      case 'saveRundown':
        await saveRundownItem(payload);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API /api/db POST error:', error);
    return NextResponse.json({ error: error.message || 'Database write operation failed' }, { status: 500 });
  }
}
