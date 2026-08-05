'use client';

import React, { useState } from 'react';
import type { Student, GenderType, DestinationType, WaveType, TShirtSize, WaiverType, SchoolClass } from '@/types';
import { WaveBadge, GenderBadge } from '@/components/ui/Badge';
import { formatWhatsAppLink } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { BulkImportModal } from './BulkImportModal';
import { BulkClearModal } from './BulkClearModal';
import { BulkUpdateModal } from './BulkUpdateModal';
import { useTableQuery } from '@/hooks/useTableQuery';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { StandardTable, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/StandardTable';
import { ExcelService } from '@/services/excelService';
import {
  UserPlus,
  Edit,
  Trash2,
  Sparkles,
  BedDouble,
  Bus as BusIcon,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  Eraser,
  CheckSquare,
  Square,
  SlidersHorizontal,
  X,
  FileText,
  Printer,
  Edit3,
} from 'lucide-react';

interface StudentManagerProps {
  students: Student[];
  classes: SchoolClass[];
  isAngketClosed?: boolean;
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeleteMultipleStudents?: (studentIds: string[]) => void;
  onBulkImportStudents: (importedStudents: Student[], importedClasses?: SchoolClass[]) => void;
  onClearAllStudents: () => void;
  onAutoAllocateRooms: () => void;
  onAutoAllocateBuses: () => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  classes,
  isAngketClosed = false,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteMultipleStudents,
  onBulkImportStudents,
  onClearAllStudents,
  onAutoAllocateRooms,
  onAutoAllocateBuses,
}) => {
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isBulkClearOpen, setIsBulkClearOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [clearInputText, setClearInputText] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Multi-select & Column Visibility States
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isColMenuOpen, setIsColMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    nis: true,
    gender: true,
    wave: true,
    tshirt: true,
    busRoom: true,
    contact: true,
  });

  // Form Fields
  const [formNis, setFormNis] = useState('');
  const [formName, setFormName] = useState('');
  const [formClass, setFormClass] = useState('XII TAB 1');
  const [formGender, setFormGender] = useState<GenderType>('LAKI-LAKI');
  const [formDestination, setFormDestination] = useState<string>('');
  const [formWave, setFormWave] = useState<string>('');
  const [formSize, setFormSize] = useState<string>('');
  const [formIsRegistered, setFormIsRegistered] = useState<boolean>(false);
  const [formParent, setFormParent] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStudentPhone, setFormStudentPhone] = useState('');
  const [formMedicalHistory, setFormMedicalHistory] = useState('');
  const [formWaiver, setFormWaiver] = useState<WaiverType>('NONE');

  // Custom Override States
  const [formBusNumber, setFormBusNumber] = useState<number | undefined>(undefined);
  const [formSeatNumber, setFormSeatNumber] = useState<number | undefined>(undefined);
  const [formRoomNumber, setFormRoomNumber] = useState<number | undefined>(undefined);

  const classesList = Array.from(new Set(students.map((s) => s.className))).sort();

  // Unified Query Hook
  const {
    search,
    setSearch,
    filters,
    setFilters,
    handleClearFilters,
    pagination,
    setPagination,
    processedData,
    paginatedData,
    totalPages,
    handlePageChange,
  } = useTableQuery<Student>(students, {
    searchFields: ['name', 'nis'],
    initialPageSize: 10,
    filterFn: (item, activeFilters) => {
      const classVal = activeFilters.className;
      const waveVal = activeFilters.wave;

      if (classVal && item.className !== classVal) return false;
      if (waveVal && item.wave !== waveVal) return false;

      return true;
    },
  });

  // Selection Logic
  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllPaginatedSelected =
    paginatedData.length > 0 &&
    paginatedData.every((st) => selectedStudentIds.includes(st.id));

  const handleToggleSelectAllPaginated = () => {
    if (isAllPaginatedSelected) {
      const pageIds = new Set(paginatedData.map((st) => st.id));
      setSelectedStudentIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const newIds = new Set([...selectedStudentIds, ...paginatedData.map((st) => st.id)]);
      setSelectedStudentIds(Array.from(newIds));
    }
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Selected Students List
  const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));

  // Form Handlers
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormNis('');
    setFormName('');
    setFormClass(classesList[0] || 'XII TAB 1');
    setFormGender('LAKI-LAKI');
    setFormDestination('');
    setFormWave('');
    setFormSize('');
    setFormIsRegistered(false);
    setFormParent('');
    setFormPhone('');
    setFormStudentPhone('');
    setFormMedicalHistory('');
    setFormWaiver('NONE');
    setFormBusNumber(undefined);
    setFormSeatNumber(undefined);
    setFormRoomNumber(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (st: Student) => {
    setEditingStudent(st);
    setFormNis(st.nis);
    setFormName(st.name);
    setFormClass(st.className);
    setFormGender(st.gender);
    setFormDestination(st.destination || '');
    setFormWave(st.wave || '');
    setFormSize(st.tShirtSize || '');
    setFormIsRegistered(Boolean(st.isRegistered));
    setFormParent(st.parentName || '');
    setFormPhone(st.parentPhone || '');
    setFormStudentPhone(st.studentPhone || '');
    setFormMedicalHistory(st.medicalHistory || '');
    setFormWaiver(st.waiverType || 'NONE');
    setFormBusNumber(st.busNumber);
    setFormSeatNumber(st.seatNumber);
    setFormRoomNumber(st.roomNumber);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNis || !formName) return;

    const hasFilledData = formIsRegistered || Boolean(formDestination || formWave || formSize);

    const studentPayload: Student = {
      ...(editingStudent || { id: `std-${Date.now()}` }),
      nis: formNis,
      name: formName,
      className: formClass,
      gender: formGender,
      destination: formDestination ? (formDestination as DestinationType) : undefined,
      wave: formWave ? (formWave as WaveType) : undefined,
      tShirtSize: formSize ? (formSize as TShirtSize) : undefined,
      parentName: formParent || undefined,
      parentPhone: formPhone || undefined,
      studentPhone: formStudentPhone || undefined,
      medicalHistory: formMedicalHistory || undefined,
      waiverType: formWaiver,
      busNumber: formBusNumber,
      seatNumber: formSeatNumber,
      roomNumber: formRoomNumber,
      isRegistered: hasFilledData,
    };

    if (editingStudent) {
      onUpdateStudent(studentPayload);
    } else {
      onAddStudent(studentPayload);
    }
    setIsModalOpen(false);
  };

  const handleExcelExport = () => {
    const exportTarget = selectedStudentIds.length > 0 ? selectedStudents : processedData;
    ExcelService.exportMasterData(exportTarget);
  };

  const handleApplyBulkUpdate = (updatedList: Student[]) => {
    const updatedMap = new Map(updatedList.map((s) => [s.id, s]));
    const merged = students.map((st) => updatedMap.get(st.id) || st);
    onBulkImportStudents(merged);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Primary Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Manajemen Master Siswa
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Data Peserta Darmawisata
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total terdaftar: <strong>{students.length} siswa</strong> dalam{' '}
            <strong>{classesList.length} kelas</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="h-11 sm:h-12 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Tambah Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkImportOpen(true)}
            className="h-11 sm:h-12 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
            title="Import File Excel Format .xlsx / .xls"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Import Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkClearOpen(true)}
            className="h-11 sm:h-12 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
            title="Kosongkan Kolom/Field Tertentu dengan Multiple Checklist"
          >
            <Eraser className="w-4 h-4 shrink-0" />
            <span>Kosongkan Field</span>
          </button>

          <button
            type="button"
            onClick={() => setIsClearConfirmOpen(true)}
            className="h-11 sm:h-12 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-xs"
            title="Hapus Semua Record Siswa"
          >
            <Trash2 className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Hapus Semua</span>
          </button>
        </div>
      </div>

      {/* Reusable Search, Filter, Column Config, and Action Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-grow">
            <SearchFilterBar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Cari berdasarkan NIS atau Nama siswa..."
              onPrint={() => typeof window !== 'undefined' && window.print()}
              onExportExcel={handleExcelExport}
              activeFilters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              filters={[
                {
                  key: 'className',
                  label: 'Kelas',
                  placeholder: 'Semua Kelas',
                  options: classesList.map((c) => ({ value: c, label: c })),
                },
                {
                  key: 'wave',
                  label: 'Gelombang',
                  placeholder: 'Semua Gelombang',
                  options: [
                    { value: 'BALI_GEL_1', label: 'Bali Gelombang 1' },
                    { value: 'BALI_GEL_2', label: 'Bali Gelombang 2' },
                    { value: 'YOGYA_GEL_1', label: 'Yogyakarta Gelombang 1' },
                  ],
                },
              ]}
            />
          </div>

          {/* Column Toggle Dropdown */}
          <div className="relative shrink-0 no-print">
            <button
              type="button"
              onClick={() => setIsColMenuOpen((p) => !p)}
              className="h-11 px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Kolom Tabel</span>
            </button>

            {isColMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-slate-800">Tampilkan Kolom</span>
                  <button
                    onClick={() => setIsColMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={visibleColumns.nis}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, nis: e.target.checked }))
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>NIS</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={visibleColumns.gender}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, gender: e.target.checked }))
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Jenis Kelamin (L/P)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={visibleColumns.wave}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, wave: e.target.checked }))
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Gelombang</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={visibleColumns.tshirt}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, tshirt: e.target.checked }))
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Ukuran Kaos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={visibleColumns.busRoom}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, busRoom: e.target.checked }))
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Bus / Kamar</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                    <input
                      type="checkbox"
                      checked={visibleColumns.contact}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, contact: e.target.checked }))
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>Kontak & Catatan Medis</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Bar when rows are selected */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {selectedStudentIds.length}
            </span>
            <div>
              <p className="text-xs font-extrabold text-white">Siswa Dicentang / Dipilih</p>
              <p className="text-[11px] text-slate-400">
                Aksi massal berlaku untuk {selectedStudentIds.length} siswa yang Anda pilih
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkUpdateOpen(true)}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ubah Massal</span>
            </button>

            <button
              type="button"
              onClick={handleExcelExport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel Terpilih</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm(`Apakah Anda yakin ingin menghapus ${selectedStudentIds.length} data siswa terpilih? Aksi ini akan menghapus pembagian bus dan kamar mereka.`)) {
                  if (onDeleteMultipleStudents) {
                    onDeleteMultipleStudents(selectedStudentIds);
                  } else {
                    selectedStudentIds.forEach(id => onDeleteStudent(id));
                  }
                  setSelectedStudentIds([]);
                }
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih</span>
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Batal Select
            </button>
          </div>
        </div>
      )}

      {/* Student Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs printable-area">
        <div className="p-4 border-b border-slate-100 hidden print:block">
          <h3 className="font-extrabold text-lg text-slate-900">MASTER DATA SISWA PESERTA DARMAWISATA</h3>
          <p className="text-xs text-slate-600">TOTAL DATA: {processedData.length} SISWA</p>
        </div>

        <div className="overflow-x-auto relative">
          <StandardTable>
            <TableHeader className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs border-b border-slate-200">
              <TableRow>
                <TableCell isHeader className="w-10 text-center no-print">
                  <input
                    type="checkbox"
                    checked={isAllPaginatedSelected}
                    onChange={handleToggleSelectAllPaginated}
                    className="rounded text-emerald-600 cursor-pointer"
                    title="Pilih semua di halaman ini"
                  />
                </TableCell>
                <TableCell isHeader className="w-12 text-center">No</TableCell>
                {visibleColumns.nis && <TableCell isHeader>NIS</TableCell>}
                <TableCell isHeader>Nama Siswa</TableCell>
                <TableCell isHeader>Kelas</TableCell>
                {visibleColumns.gender && <TableCell isHeader>L/P</TableCell>}
                {visibleColumns.wave && <TableCell isHeader>Gelombang</TableCell>}
                {visibleColumns.tshirt && <TableCell isHeader>Kaos</TableCell>}
                {visibleColumns.busRoom && <TableCell isHeader>Bus / Kamar</TableCell>}
                {visibleColumns.contact && <TableCell isHeader>Kontak & Riwayat</TableCell>}
                <TableCell isHeader className="text-center no-print">Aksi</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada siswa yang sesuai dengan filter pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((st, idx) => {
                  const sequentialNumber = (pagination.currentPage - 1) * pagination.pageSize + idx + 1;
                  const isSelected = selectedStudentIds.includes(st.id);

                  return (
                    <TableRow key={st.id} className={isSelected ? 'bg-sky-50/70' : ''}>
                      <TableCell className="text-center no-print">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectStudent(st.id)}
                          className="rounded text-emerald-600 cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-bold text-slate-400 text-center">{sequentialNumber}</TableCell>
                      {visibleColumns.nis && (
                        <TableCell className="font-extrabold text-slate-900">{st.nis}</TableCell>
                      )}
                      <TableCell className="font-bold text-slate-800">{st.name}</TableCell>
                      <TableCell className="font-bold text-slate-700">{st.className}</TableCell>
                      {visibleColumns.gender && (
                        <TableCell>
                          <GenderBadge gender={st.gender} />
                        </TableCell>
                      )}
                      {visibleColumns.wave && (
                        <TableCell>
                          {st.wave ? (
                            <WaveBadge wave={st.wave} />
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Belum Mengisi
                            </span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.tshirt && (
                        <TableCell className="py-3 px-4 font-bold text-slate-900">
                          {st.tShirtSize ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                              {st.tShirtSize}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal italic text-xs">-</span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.busRoom && (
                        <TableCell className="py-3 px-4 font-medium text-slate-700">
                          {isAngketClosed ? (
                            `B${st.busNumber || '-'} / K${st.roomNumber || '-'}`
                          ) : (
                            <span className="text-slate-400 font-medium italic">-</span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.contact && (
                        <TableCell className="py-3 px-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap gap-1">
                              {st.studentPhone ? (
                                <a
                                  href={formatWhatsAppLink(st.studentPhone, `Halo ${st.name}, mohon konfirmasi data Darmawisata Anda.`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 font-bold text-[10px] transition-colors"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  <span>Siswa</span>
                                </a>
                              ) : null}

                              {st.parentPhone ? (
                                <a
                                  href={formatWhatsAppLink(st.parentPhone, `Halo Orang Tua dari ${st.name}, mohon konfirmasi data Darmawisata anak Anda.`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 hover:bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200 font-bold text-[10px] transition-colors"
                                >
                                  <span>Ortu</span>
                                </a>
                              ) : null}

                              {!st.studentPhone && !st.parentPhone ? (
                                <span className="text-slate-400 text-[10px] font-medium italic">Belum mengisi WA</span>
                              ) : null}
                            </div>

                            {st.medicalHistory && st.medicalHistory.trim().toUpperCase() !== 'TIDAK ADA' && st.medicalHistory.trim() !== '-' && (
                              <div className="text-[10px] text-rose-600 font-extrabold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 w-fit">
                                <span className="w-1 h-1 bg-rose-500 rounded-full animate-ping"></span>
                                <span className="truncate max-w-[120px]" title={st.medicalHistory}>Sakit: {st.medicalHistory}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="py-3 px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(st)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Siswa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Hapus data siswa ${st.name}?`)) {
                                onDeleteStudent(st.id);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </StandardTable>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={totalPages}
            pageSize={pagination.pageSize}
            totalItems={processedData.length}
            onPageChange={handlePageChange}
            onPageSizeChange={(size) => setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }))}
          />
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
        subtitle={editingStudent ? `Ubah data ${editingStudent.name}` : 'Masukkan data siswa peserta darmawisata'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NIS (Nomor Induk)</label>
              <input
                type="text"
                required
                value={formNis}
                onChange={(e) => setFormNis(e.target.value)}
                placeholder="Contoh: 12345"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={formGender}
                onChange={(e) => setFormGender(e.target.value as GenderType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="LAKI-LAKI">LAKI-LAKI</option>
                <option value="PEREMPUAN">PEREMPUAN</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Ahmad Fauzi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas</label>
            <select
              value={formClass}
              onChange={(e) => setFormClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {classesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tujuan Tour</label>
              <select
                value={formDestination}
                onChange={(e) => setFormDestination(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Belum Memilih --</option>
                <option value="BALI">BALI</option>
                <option value="YOGYAKARTA">YOGYAKARTA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Angket</label>
              <select
                value={formIsRegistered ? 'REGISTERED' : 'UNREGISTERED'}
                onChange={(e) => setFormIsRegistered(e.target.value === 'REGISTERED')}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                  formIsRegistered ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="UNREGISTERED">Belum Mengisi Angket</option>
                <option value="REGISTERED">Sudah Mengisi Angket</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gelombang Keberangkatan</label>
              <select
                value={formWave}
                onChange={(e) => setFormWave(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Belum Ditetapkan --</option>
                <option value="BALI_GEL_1">Bali Gel I (07-11 Nov)</option>
                <option value="BALI_GEL_2">Bali Gel II (14-18 Nov)</option>
                <option value="YOGYA_GEL_1">Yogya Gel I (15-16 Nov)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ukuran Kaos</label>
              <select
                value={formSize}
                onChange={(e) => setFormSize(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Belum Memilih --</option>
                {['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map((s) => (
                  <option key={s} value={s}>
                    Ukuran {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
              <input
                type="text"
                value={formParent}
                onChange={(e) => setFormParent(e.target.value)}
                placeholder="Nama Orang Tua"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jalur / Beasiswa</label>
              <select
                value={formWaiver}
                onChange={(e) => setFormWaiver(e.target.value as WaiverType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="NONE">Reguler (Normal)</option>
                <option value="25%">Diskon 25% (Jalur Tidak Mampu)</option>
                <option value="50%">Diskon 50% (Jalur Tidak Mampu)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">No. WA Orang Tua</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">No. WA Siswa</label>
              <input
                type="text"
                value={formStudentPhone}
                onChange={(e) => setFormStudentPhone(e.target.value)}
                placeholder="Contoh: 081987654321"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Riwayat Kesehatan / Penyakit</label>
            <input
              type="text"
              value={formMedicalHistory}
              onChange={(e) => setFormMedicalHistory(e.target.value)}
              placeholder="Contoh: Asma, Alergi Udara Dingin (Atau isi 'TIDAK ADA')"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Override Assignments Area */}
          <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
              Penugasan Kamar & Bus (Manual Override)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">No. Bus</label>
                <input
                  type="number"
                  value={formBusNumber ?? ''}
                  onChange={(e) => setFormBusNumber(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Bus #"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">No. Kursi</label>
                <input
                  type="number"
                  value={formSeatNumber ?? ''}
                  onChange={(e) => setFormSeatNumber(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Kursi #"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">No. Kamar</label>
                <input
                  type="number"
                  value={formRoomNumber ?? ''}
                  onChange={(e) => setFormRoomNumber(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Kamar #"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Data</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportSuccess={onBulkImportStudents}
        existingClasses={classesList}
      />

      {/* Bulk Clear Specific Fields Modal */}
      <BulkClearModal
        isOpen={isBulkClearOpen}
        onClose={() => setIsBulkClearOpen(false)}
        students={students}
        classList={classesList}
        onApplyClear={(updatedStudents) => {
          onBulkImportStudents(updatedStudents);
        }}
      />

      {/* Bulk Update Modal */}
      <BulkUpdateModal
        isOpen={isBulkUpdateOpen}
        onClose={() => setIsBulkUpdateOpen(false)}
        selectedStudents={selectedStudents}
        onApplyUpdate={handleApplyBulkUpdate}
      />

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={isClearConfirmOpen}
        onClose={() => {
          setIsClearConfirmOpen(false);
          setClearInputText('');
        }}
        title="Hapus Seluruh Data Master Siswa?"
        subtitle="Aksi ini sangat berbahaya dan tidak dapat dibatalkan!"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong>Peringatan Keamanan:</strong> Menghapus seluruh data siswa akan
              membersihkan seluruh record peserta, pembagian bus, dan alokasi kamar hotel.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ketik &quot;HAPUS&quot; untuk mengonfirmasi:
            </label>
            <input
              type="text"
              value={clearInputText}
              onChange={(e) => setClearInputText(e.target.value)}
              placeholder="Ketik HAPUS di sini..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:outline-hidden focus:ring-2 focus:ring-rose-500 uppercase"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsClearConfirmOpen(false);
                setClearInputText('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={clearInputText.trim().toUpperCase() !== 'HAPUS'}
              onClick={() => {
                onClearAllStudents();
                setIsClearConfirmOpen(false);
                setClearInputText('');
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Ya, Hapus Semua Data</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
