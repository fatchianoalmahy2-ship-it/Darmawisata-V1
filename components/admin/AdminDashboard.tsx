'use client';

import React, { useState } from 'react';
import type { Student, RundownItem, SchoolClass, Bus, Room, AppSettings } from '@/types';
import { RundownManager } from './RundownManager';
import { ClassManager } from './ClassManager';
import { BusManager } from './BusManager';
import { RoomManager } from './RoomManager';
import { StudentManager } from './StudentManager';
import { WaliKelasManager } from './WaliKelasManager';
import { QueryQueueMonitor } from './QueryQueueMonitor';
import { AdminOverviewStats } from './AdminOverviewStats';
import {
  Compass,
  BedDouble,
  Bus as BusIcon,
  Users,
  Building,
  UserCheck,
  Database,
  BarChart3,
} from 'lucide-react';

interface AdminDashboardProps {
  students: Student[];
  classes: SchoolClass[];
  buses: Bus[];
  rooms: Room[];
  rundowns: RundownItem[];
  settings: AppSettings;
  isAngketClosed?: boolean;
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeleteMultipleStudents?: (studentIds: string[]) => void;
  onBulkImportStudents: (importedStudents: Student[], importedClasses?: SchoolClass[]) => void;
  onClearAllStudents: () => void;
  onAutoAllocateRooms: () => void;
  onAutoAllocateBuses: () => void;
  onSaveRundown: (item: RundownItem) => Promise<void>;
  onDeleteRundown: (id: string) => Promise<void>;
  onResetRundowns: () => Promise<void>;
  onAddClass: (newClass: SchoolClass) => void;
  onUpdateClass: (updatedClass: SchoolClass) => void;
  onDeleteClass: (classId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  classes,
  buses,
  rooms,
  rundowns,
  settings,
  isAngketClosed = false,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteMultipleStudents,
  onBulkImportStudents,
  onClearAllStudents,
  onAutoAllocateRooms,
  onAutoAllocateBuses,
  onSaveRundown,
  onDeleteRundown,
  onResetRundowns,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STUDENTS' | 'CLASSES' | 'WALI_KELAS' | 'BUSES' | 'ROOMS' | 'RUNDOWNS' | 'QUERIES'>('OVERVIEW');

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="admin-dashboard-container">
      {/* Tab Selector (Standardized Grid Layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs no-print" id="admin-tab-selector">
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`h-11 sm:h-12 py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-purple-700 text-white shadow-xs font-black'
              : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" /> Ringkasan & Stats
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('STUDENTS')}
          className={`h-11 sm:h-12 py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'STUDENTS'
              ? 'bg-[#0284c7] text-white shadow-xs font-black'
              : 'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" /> Master Siswa ({students.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CLASSES')}
          className={`h-11 sm:h-12 py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'CLASSES'
              ? 'bg-amber-600 text-white shadow-xs font-black'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Building className="w-4 h-4 shrink-0" /> Kelola Rombel ({classes.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('WALI_KELAS')}
          className={`h-11 sm:h-12 py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'WALI_KELAS'
              ? 'bg-[#00875a] text-white shadow-xs font-black'
              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" /> Kelola Wali Kelas ({classes.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BUSES')}
          className={`h-11 sm:h-12 py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'BUSES'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <BusIcon className="w-4 h-4 shrink-0" /> Kelola Bus ({buses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ROOMS')}
          className={`h-11 sm:h-12 py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'ROOMS'
              ? 'bg-teal-600 text-white shadow-xs font-black'
              : 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200'
          }`}
        >
          <BedDouble className="w-4 h-4 shrink-0" /> Kelola Kamar ({rooms.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RUNDOWNS')}
          className={`h-11 sm:h-12 py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'RUNDOWNS'
              ? 'bg-slate-900 text-white shadow-xs font-black'
              : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" /> Jadwal Perjalanan
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('QUERIES')}
          className={`h-11 sm:h-12 py-2.5 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'QUERIES'
              ? 'bg-orange-600 text-white shadow-xs font-black'
              : 'bg-orange-50 text-orange-900 hover:bg-orange-100 border border-orange-200'
          }`}
        >
          <Database className="w-4 h-4 shrink-0" /> Monitor Antrian Query
        </button>
      </div>

      {/* Tabs Content */}
      <div id="admin-tabs-content">
        {activeTab === 'OVERVIEW' && (
          <AdminOverviewStats
            students={students}
            classes={classes}
          />
        )}

        {activeTab === 'STUDENTS' && (
          <StudentManager
            students={students}
            classes={classes}
            isAngketClosed={isAngketClosed}
            onAddStudent={onAddStudent}
            onUpdateStudent={onUpdateStudent}
            onDeleteStudent={onDeleteStudent}
            onDeleteMultipleStudents={onDeleteMultipleStudents}
            onBulkImportStudents={onBulkImportStudents}
            onClearAllStudents={onClearAllStudents}
            onAutoAllocateRooms={onAutoAllocateRooms}
            onAutoAllocateBuses={onAutoAllocateBuses}
          />
        )}

        {activeTab === 'CLASSES' && (
          <ClassManager
            classes={classes}
            students={students}
            onAddClass={onAddClass}
            onUpdateClass={onUpdateClass}
            onDeleteClass={onDeleteClass}
          />
        )}

        {activeTab === 'WALI_KELAS' && (
          <WaliKelasManager
            classes={classes}
            students={students}
            settings={settings}
            onUpdateClass={onUpdateClass}
            onAddClass={onAddClass}
          />
        )}

        {activeTab === 'BUSES' && (
          <BusManager
            buses={buses}
            students={students}
            onUpdateStudent={onUpdateStudent}
          />
        )}

        {activeTab === 'ROOMS' && (
          <RoomManager
            rooms={rooms}
            students={students}
            onUpdateStudent={onUpdateStudent}
          />
        )}

        {activeTab === 'RUNDOWNS' && (
          <RundownManager
            rundowns={rundowns}
            onSaveRundown={onSaveRundown}
            onDeleteRundown={onDeleteRundown}
            onResetRundowns={onResetRundowns}
          />
        )}

        {activeTab === 'QUERIES' && (
          <QueryQueueMonitor />
        )}
      </div>
    </div>
  );
};
