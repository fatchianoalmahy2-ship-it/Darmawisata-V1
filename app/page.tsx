'use client';

import React, { useState, useEffect } from 'react';
import { AppTab } from '@/components/ui/Header';
import { MainLayout } from '@/components/layout/MainLayout';
import { AngketForm } from '@/components/angket/AngketForm';
import { WaliKelasPortal } from '@/components/walikelas/WaliKelasPortal';
import { BusSeatMap } from '@/components/bus/BusSeatMap';
import { RoomGrid } from '@/components/kamar/RoomGrid';
import { RecapDashboard } from '@/components/recap/RecapDashboard';
import { SuratIzinView } from '@/components/surat/SuratIzinView';
import { RundownTimeline } from '@/components/rundown/RundownTimeline';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { SettingsModal } from '@/components/admin/SettingsModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { ProfileSettingsModal } from '@/components/auth/ProfileSettingsModal';
import { ToastProvider, useToast } from '@/components/ui/Toast';

import { Student, SchoolClass, AppSettings, Bus, Room, AuthUser, RundownItem } from '@/types';
import { AuthService, DEFAULT_PUBLIC_USER } from '@/services/authService';
import { dbService } from '@/services/dbService';
import {
  getInitialStudents,
  getInitialClasses,
  getInitialSettings,
  getInitialRundowns,
  resetRundownsToDefault,
} from '@/services/supabaseService';
import { RoomAllocatorEngine } from '@/services/roomAllocator';
import { SeatAllocatorEngine } from '@/services/seatAllocator';
import { normalizeClassName } from '@/lib/utils';
import schoolMetadata from '@/config/schoolMetadata.json';
import { useAppData, LS_CACHE_KEYS } from '@/hooks/useAppData';
import { Lock, LogIn } from 'lucide-react';

export default function HomePage() {
  return (
    <ToastProvider>
      <HomePageContent />
    </ToastProvider>
  );
}

function HomePageContent() {
  const { showToast } = useToast();
  const {
    currentUser,
    setCurrentUser,
    students,
    setStudents,
    classes,
    setClasses,
    settings,
    setSettings,
    rundowns,
    setRundowns,
    buses,
    setBuses,
    rooms,
    setRooms,
    isLoaded,
    isSyncing,
    loadError,
    isAngketClosed,
    checkIsAngketClosed,
    autoAllocateAllWhenClosed,
  } = useAppData();

  const [activeTab, setActiveTab] = useState<AppTab>('ANGKET');
  const [selectedStudentForSurat, setSelectedStudentForSurat] = useState<Student | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState<boolean>(false);

  // Authentication State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [targetTabForLogin, setTargetTabForLogin] = useState<string | undefined>(undefined);
  const [initialRoleForLogin, setInitialRoleForLogin] = useState<'ADMIN' | 'WALI_KELAS' | 'PUBLIC_SISWA' | undefined>(undefined);

  // Set initial activeTab according to role once user is loaded
  useEffect(() => {
    if (currentUser.role === 'ADMIN') {
      setActiveTab('ADMIN');
    } else if (currentUser.role === 'WALI_KELAS') {
      setActiveTab('WALI_KELAS');
    }
  }, [currentUser.role]);

  // Auth Handlers
  const handleOpenLoginModal = (targetTabName?: string, initialRole?: 'ADMIN' | 'WALI_KELAS' | 'PUBLIC_SISWA') => {
    setTargetTabForLogin(targetTabName);
    setInitialRoleForLogin(initialRole);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    showToast(`Selamat datang, ${user.name || user.username || 'Pengguna'}!`, 'success');
    if (user.role === 'ADMIN') {
      setActiveTab('ADMIN');
    } else if (user.role === 'WALI_KELAS') {
      setActiveTab('WALI_KELAS');
    }
  };

  const handleLogout = () => {
    const freshPublic = AuthService.logout();
    setCurrentUser(freshPublic);
    setActiveTab('ANGKET');
    showToast('Sesi berhasil keluar.', 'info');
  };

  // Student Handlers with IndexedDB first and Query Sync queueing
  const handleSaveStudent = async (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updated);
    await dbService.putSingleStudent(updatedStudent);
    await dbService.enqueueTask('save_student', updatedStudent);
    showToast(`Data siswa ${updatedStudent.name} berhasil disimpan!`, 'success');
  };

  const handleAddStudent = async (newStudent: Student) => {
    const updated = [newStudent, ...students];
    setStudents(updated);
    await dbService.putSingleStudent(newStudent);
    await dbService.enqueueTask('save_student', newStudent);
    showToast(`Siswa baru ${newStudent.name} berhasil ditambahkan!`, 'success');
  };

  const handleDeleteStudent = async (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== studentId);
      try { localStorage.setItem(LS_CACHE_KEYS.STUDENTS, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    await dbService.deleteStudent(studentId);
    await dbService.enqueueTask('delete_student', studentId);
    if (target) {
      showToast(`Data siswa ${target.name} berhasil dihapus.`, 'info');
    }
  };

  const handleDeleteMultipleStudents = async (studentIds: string[]) => {
    if (!studentIds || studentIds.length === 0) return;
    setStudents((prev) => {
      const updated = prev.filter((s) => !studentIds.includes(s.id));
      try { localStorage.setItem(LS_CACHE_KEYS.STUDENTS, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    
    // Batch deletion from local IndexedDB and enqueue sync task for bulk deletion
    await dbService.deleteMultipleStudents(studentIds);
    await dbService.enqueueTask('delete_students', studentIds);
    
    showToast(`Berhasil menghapus ${studentIds.length} data siswa terpilih.`, 'info');
  };

  const handleBulkImportStudents = async (
    importedStudents: Student[],
    importedClasses?: SchoolClass[]
  ) => {
    const studentMap = new Map<string, Student>();
    students.forEach((s) => studentMap.set(s.nis || s.id, s));
    
    // Merge imported students, reusing existing ID if matched by NIS to avoid duplicates in DB
    const finalImportedStudents = importedStudents.map((imported) => {
      const existing = studentMap.get(imported.nis || imported.id);
      if (existing) {
        return {
          ...imported,
          id: existing.id // MUST reuse the existing ID to overwrite in DB
        };
      }
      return imported;
    });

    finalImportedStudents.forEach((s) => studentMap.set(s.nis || s.id, s));
    const combined = Array.from(studentMap.values());

    setStudents(combined);
    await dbService.putStudents(finalImportedStudents);
    await dbService.enqueueTask('save_students', finalImportedStudents);

    if (importedClasses && importedClasses.length > 0) {
      setClasses((prevClasses) => {
        const classMap = new Map(prevClasses.map((c) => [c.name, c]));
        importedClasses.forEach((uc) => {
          const existing = classMap.get(uc.name);
          if (existing) {
            classMap.set(uc.name, {
              ...existing,
              totalStudents: Math.max(existing.totalStudents, uc.totalStudents),
              homeroomTeacher: uc.homeroomTeacher || existing.homeroomTeacher,
            });
          } else {
            classMap.set(uc.name, uc);
          }
        });
        const updatedClassesList = Array.from(classMap.values());
        dbService.putClasses(updatedClassesList);
        dbService.enqueueTask('save_classes', updatedClassesList);
        return updatedClassesList;
      });
    }

    showToast(`Berhasil mengimpor ${importedStudents.length} data siswa.`, 'success');
  };

  const handleClearAllStudents = async () => {
    setStudents([]);
    setClasses([]);
    setBuses([]);
    setRooms([]);
    await dbService.clearStudents();
    await dbService.clearClasses();
    await dbService.enqueueTask('clear_students', null);
    await dbService.enqueueTask('clear_classes', null);
    showToast('Seluruh data siswa dan kelas telah dikosongkan.', 'warning');
  };

  const handleClearClassData = async (
    className: string,
    actionType: 'REGISTRATION_ONLY' | 'DELETE_STUDENTS'
  ) => {
    try {
      if (actionType === 'REGISTRATION_ONLY') {
        const updated = students.map((s) => {
          if (s.className === className) {
            return {
              id: s.id,
              nis: s.nis,
              name: s.name,
              className: s.className,
              gender: s.gender,
              isRegistered: false,
            };
          }
          return s;
        });
        setStudents(updated);
        const updatedClassStudents = updated.filter((s) => s.className === className);
        await dbService.putStudents(updatedClassStudents);
        await dbService.enqueueTask('save_students', updatedClassStudents);
      } else {
        const classStudentsToDelete = students.filter((s) => s.className === className);
        const remainingStudents = students.filter((s) => s.className !== className);
        setStudents(remainingStudents);
        await Promise.all(classStudentsToDelete.map((s) => dbService.deleteStudent(s.id)));
        await Promise.all(classStudentsToDelete.map((s) => dbService.enqueueTask('delete_student', s.id)));

        const targetClass = classes.find((c) => c.name === className);
        if (targetClass) {
          const remainingClasses = classes.filter((c) => c.id !== targetClass.id);
          setClasses(remainingClasses);
          await dbService.deleteClass(targetClass.id);
          await dbService.enqueueTask('delete_class', targetClass.id);
        }
      }
      showToast(`Data kelas ${className} berhasil dibersihkan.`, 'warning');
    } catch (err) {
      console.error(`Gagal mengosongkan data kelas ${className}:`, err);
      showToast(`Gagal mengosongkan data kelas ${className}.`, 'error');
      throw err;
    }
  };

  // Class CRUD handlers
  const handleAddClass = async (newClass: SchoolClass) => {
    const updated = [...classes, newClass];
    setClasses(updated);
    await dbService.putClasses(updated);
    await dbService.enqueueTask('save_classes', updated);
    showToast(`Kelas ${newClass.name} berhasil ditambahkan!`, 'success');
  };

  const handleUpdateClass = async (updatedClass: SchoolClass) => {
    const updated = classes.map((c) => (c.id === updatedClass.id ? updatedClass : c));
    setClasses(updated);
    await dbService.putClasses(updated);
    await dbService.enqueueTask('save_classes', updated);
    showToast(`Data kelas ${updatedClass.name} berhasil diperbarui!`, 'success');
  };

  const handleDeleteClass = async (classId: string) => {
    const target = classes.find((c) => c.id === classId);
    const updated = classes.filter((c) => c.id !== classId);
    setClasses(updated);
    await dbService.deleteClass(classId);
    await dbService.enqueueTask('delete_class', classId);
    showToast(`Kelas ${target ? target.name : ''} berhasil dihapus.`, 'info');
  };

  const handleUpdateStudentSeat = async (
    studentId: string,
    busNumber: number,
    seatNumber: number
  ) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const updatedStudent = { ...targetStudent, busNumber, seatNumber };
    const updatedList = students.map((s) => (s.id === studentId ? updatedStudent : s));

    setStudents(updatedList);
    await dbService.putSingleStudent(updatedStudent);
    await dbService.enqueueTask('save_student', updatedStudent);
    showToast(`Nomor bus & kursi ${targetStudent.name} berhasil disimpan.`, 'success');
  };

  const handleAutoAllocateRooms = async () => {
    const result = RoomAllocatorEngine.autoAllocateRooms(
      students,
      settings.defaultRoomCapacity
    );
    setStudents(result.updatedStudents);
    setRooms(result.rooms);
    await dbService.putStudents(result.updatedStudents);
    await dbService.enqueueTask('save_students', result.updatedStudents);
    showToast(`Berhasil membagikan ${result.rooms.length} kamar hotel!`, 'success');
  };

  const handleAutoAllocateBuses = async () => {
    const result = SeatAllocatorEngine.autoAllocateBuses(
      students,
      settings.defaultBusCapacity
    );
    setStudents(result.updatedStudents);
    setBuses(result.buses);
    await dbService.putStudents(result.updatedStudents);
    await dbService.enqueueTask('save_students', result.updatedStudents);
    showToast(`Berhasil menetapkan tempat duduk di ${result.buses.length} bus!`, 'success');
  };

  // Settings & Rundown Handlers
  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await dbService.putSettings(newSettings);
    await dbService.enqueueTask('save_settings', newSettings);

    const isClosed = checkIsAngketClosed(newSettings);
    if (isClosed) {
      const allocRes = autoAllocateAllWhenClosed(students, newSettings);
      setStudents(allocRes.updatedStudents);
      setBuses(allocRes.buses);
      setRooms(allocRes.rooms);
      await dbService.putStudents(allocRes.updatedStudents);
      await dbService.enqueueTask('save_students', allocRes.updatedStudents);
    }
    showToast('Pengaturan sistem berhasil disimpan.', 'success');
  };

  const handleSaveRundown = async (item: RundownItem) => {
    const updated = rundowns.some((r) => r.id === item.id)
      ? rundowns.map((r) => (r.id === item.id ? item : r))
      : [...rundowns, item];
    setRundowns(updated);
    await dbService.putRundown(item);
    await dbService.enqueueTask('save_rundown', item);
    showToast(`Agenda "${item.activity}" berhasil disimpan!`, 'success');
  };

  const handleDeleteRundown = async (id: string) => {
    const target = rundowns.find((r) => r.id === id);
    setRundowns(rundowns.filter((r) => r.id !== id));
    await dbService.deleteRundown(id);
    await dbService.enqueueTask('delete_rundown', id);
    showToast(`Agenda "${target ? target.activity : ''}" berhasil dihapus.`, 'info');
  };

  const handleResetRundowns = async () => {
    const defaultRdns = await resetRundownsToDefault();
    setRundowns(defaultRdns);
    await dbService.clearRundowns();
    await dbService.putRundowns(defaultRdns);
    showToast('Jadwal & Destinasi berhasil direset ke konfigurasi default.', 'info');
  };

  const handleNavigateToSurat = (student: Student) => {
    setSelectedStudentForSurat(student);
    setActiveTab('SURAT_IZIN');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <h3 className="font-extrabold text-lg tracking-tight">
          SMK PGRI 2 PONOROGO — SIM DARMAWISATA
        </h3>
        <p className="text-xs text-slate-400">Menghubungkan ke Database Terdesentralisasi...</p>
        {loadError && <p className="text-xs text-red-500">{loadError}</p>}
      </div>
    );
  }

  const registeredCount = students.filter((s) => s.isRegistered).length;
  const isPublicUser = currentUser.role === 'PUBLIC_SISWA';
  const isAdminUser = currentUser.role === 'ADMIN';

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUser={currentUser}
      onLogout={handleLogout}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenProfileSettings={() => setIsProfileSettingsOpen(true)}
      onOpenLoginModal={handleOpenLoginModal}
      totalStudentsCount={students.length}
      registeredStudentsCount={registeredCount}
      settings={settings}
      isSyncing={isSyncing}
    >
      {activeTab === 'ANGKET' && (
        <AngketForm
          students={students}
          classes={classes}
          settings={settings}
          onSaveStudent={handleSaveStudent}
          onNavigateToSurat={handleNavigateToSurat}
        />
      )}

      {activeTab === 'WALI_KELAS' && (
        isPublicUser ? (
          <AccessDeniedCard
            title="Akses Portal Wali Kelas Terkunci"
            description="Menu ini berisi statistik dan laporan khusus Wali Kelas. Silakan login sebagai Wali Kelas atau Admin Panitia untuk melanjutkan."
            onLogin={() => handleOpenLoginModal('Menu Wali Kelas')}
          />
        ) : (
          <WaliKelasPortal
            classes={classes}
            students={students}
            thresholdPercentage={settings.waliKelasParticipationThreshold}
            currentUser={currentUser}
            settings={settings}
            onClearClassData={handleClearClassData}
            onUpdateClass={handleUpdateClass}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
          />
        )
      )}

      {activeTab === 'REKAP_HARIAN' && (
        isPublicUser ? (
          <AccessDeniedCard
            title="Akses Rekap WA & PDF Terkunci"
            description="Fitur rekap harian otomatis WA/PDF khusus digunakan oleh Wali Kelas dan Panitia. Silakan login untuk melihat rekap."
            onLogin={() => handleOpenLoginModal('Rekap WA / PDF')}
          />
        ) : (
          <RecapDashboard
            classes={classes}
            students={students}
            currentUser={currentUser}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )
      )}

      {activeTab === 'DENAH_BUS' && (
        isPublicUser ? (
          <AccessDeniedCard
            title="Akses Denah Bus Terkunci"
            description="Denah duduk bus memerlukan verifikasi login Wali Kelas atau Admin Panitia."
            onLogin={() => handleOpenLoginModal('Denah Bus')}
          />
        ) : (
          <div className="space-y-4">
            {!isAngketClosed && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl font-bold">ℹ️ Info Pra-Penutupan</span>
                  <p>
                    Pengisian angket masih dibuka. Anda dapat memantau, menyusun, dan menyesuaikan denah kursi bus secara langsung.
                  </p>
                </div>
              </div>
            )}
            <BusSeatMap
              students={students}
              buses={buses}
              defaultBusCapacity={settings.defaultBusCapacity}
              onUpdateStudentSeat={handleUpdateStudentSeat}
              onOpenBusConfig={() => setIsSettingsOpen(true)}
            />
          </div>
        )
      )}

      {activeTab === 'PEMBAGIAN_KAMAR' && (
        isPublicUser ? (
          <AccessDeniedCard
            title="Akses Pembagian Kamar Terkunci"
            description="Pembagian kamar hotel memerlukan verifikasi login Wali Kelas atau Admin Panitia."
            onLogin={() => handleOpenLoginModal('Pembagian Kamar')}
          />
        ) : (
          <div className="space-y-4">
            {!isAngketClosed && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl font-bold">ℹ️ Info Pra-Penutupan</span>
                  <p>
                    Pengisian angket masih dibuka. Anda dapat menjalankan alokasi otomatis atau menyesuaikan susunan kamar siswa.
                  </p>
                </div>
              </div>
            )}
            <RoomGrid
              students={students}
              rooms={rooms}
              defaultRoomCapacity={settings.defaultRoomCapacity}
              onAutoAllocateRooms={handleAutoAllocateRooms}
              onOpenRoomConfig={() => setIsSettingsOpen(true)}
            />
          </div>
        )
      )}

      {activeTab === 'SURAT_IZIN' && (
        <SuratIzinView
          students={students}
          initialStudent={selectedStudentForSurat}
          settings={settings}
          onSaveSettings={handleSaveSettings}
          currentUser={currentUser}
        />
      )}

      {activeTab === 'RUNDOWN' && <RundownTimeline rundowns={rundowns} />}

      {activeTab === 'ADMIN' && (
        !isAdminUser ? (
          <AccessDeniedCard
            title="Akses Admin Panitia Terkunci"
            description="Halaman ini hanya dapat diakses oleh Panitia Utama (Super Admin) dengan kredensial terdaftar."
            onLogin={() => handleOpenLoginModal('Admin Data', 'ADMIN')}
          />
        ) : (
          <AdminDashboard
            students={students}
            classes={classes}
            buses={buses}
            rooms={rooms}
            rundowns={rundowns}
            settings={settings}
            isAngketClosed={isAngketClosed}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onDeleteMultipleStudents={handleDeleteMultipleStudents}
            onBulkImportStudents={handleBulkImportStudents}
            onClearAllStudents={handleClearAllStudents}
            onAutoAllocateRooms={handleAutoAllocateRooms}
            onAutoAllocateBuses={handleAutoAllocateBuses}
            onSaveRundown={handleSaveRundown}
            onDeleteRundown={handleDeleteRundown}
            onResetRundowns={handleResetRundowns}
            onAddClass={handleAddClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
          />
        )
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetData={() => {
          if (confirm('Aksi ini akan mereset pengaturan ke default. Lanjutkan?')) {
            handleSaveSettings(schoolMetadata.defaultSettings as AppSettings);
          }
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        classes={classes}
        onLoginSuccess={handleLoginSuccess}
        targetTabName={targetTabForLogin}
        initialRole={initialRoleForLogin}
      />

      <ProfileSettingsModal
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
        currentUser={currentUser}
        classes={classes}
        onUpdateClass={handleUpdateClass}
        onUpdateCurrentUser={(updatedUser) => setCurrentUser(updatedUser)}
      />
    </MainLayout>
  );
}

// Access Denied Placeholder Component
function AccessDeniedCard({
  title,
  description,
  onLogin,
}: {
  title: string;
  description: string;
  onLogin: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-5 shadow-lg animate-in fade-in" id="access-denied-card">
      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
        <Lock className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onLogin}
        className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
      >
        <LogIn className="w-4 h-4 text-emerald-400" />
        <span>Login Otentikasi Sekarang</span>
      </button>
    </div>
  );
}
