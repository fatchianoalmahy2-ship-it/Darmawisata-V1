'use client';

import React, { useState } from 'react';
import type { Student } from '@/types';
import { Modal } from '@/components/ui/Modal';
import {
  Eraser,
  CheckSquare,
  Square,
  AlertTriangle,
  Sparkles,
  Filter,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export interface ClearFieldsConfig {
  destination: boolean;
  wave: boolean;
  tshirt: boolean;
  bus: boolean;
  room: boolean;
  parents: boolean;
  studentPhone: boolean;
  medical: boolean;
  waiver: boolean;
  isRegistered: boolean;
}

interface BulkClearModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  classList: string[];
  onApplyClear: (updatedStudents: Student[], affectedCount: number) => void;
}

export const BulkClearModal: React.FC<BulkClearModalProps> = ({
  isOpen,
  onClose,
  students,
  classList,
  onApplyClear,
}) => {
  // Target Scope States
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'REGISTERED' | 'UNREGISTERED'>('ALL');

  // Fields to Clear Checklist
  const [fields, setFields] = useState<ClearFieldsConfig>({
    destination: true,
    wave: true,
    tshirt: true,
    bus: false,
    room: false,
    parents: false,
    studentPhone: false,
    medical: false,
    waiver: false,
    isRegistered: false,
  });

  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleField = (key: keyof ClearFieldsConfig) => {
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllFields = () => {
    setFields({
      destination: true,
      wave: true,
      tshirt: true,
      bus: true,
      room: true,
      parents: true,
      studentPhone: true,
      medical: true,
      waiver: true,
      isRegistered: true,
    });
  };

  const clearAllFieldSelections = () => {
    setFields({
      destination: false,
      wave: false,
      tshirt: false,
      bus: false,
      room: false,
      parents: false,
      studentPhone: false,
      medical: false,
      waiver: false,
      isRegistered: false,
    });
  };

  // Filter matching students based on target scope
  const targetStudents = students.filter((st) => {
    const matchClass = selectedClass === 'ALL' || st.className === selectedClass;
    const matchStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'REGISTERED' && st.isRegistered) ||
      (selectedStatus === 'UNREGISTERED' && !st.isRegistered);

    return matchClass && matchStatus;
  });

  const hasAnyFieldSelected = Object.values(fields).some(Boolean);

  const handleExecuteClear = () => {
    if (!hasAnyFieldSelected || targetStudents.length === 0) return;
    setIsSubmitting(true);

    const targetIds = new Set(targetStudents.map((s) => s.id));

    const updated = students.map((st) => {
      if (!targetIds.has(st.id)) return st;

      const copy: Student = { ...st };

      if (fields.destination) {
        delete copy.destination;
      }
      if (fields.wave) {
        delete copy.wave;
      }
      if (fields.tshirt) {
        delete copy.tShirtSize;
        delete copy.tShirtDesign;
      }
      if (fields.bus) {
        delete copy.busNumber;
        delete copy.seatNumber;
      }
      if (fields.room) {
        delete copy.roomNumber;
      }
      if (fields.parents) {
        delete copy.parentName;
        delete copy.parentAddress;
        delete copy.parentPhone;
      }
      if (fields.studentPhone) {
        delete copy.studentPhone;
      }
      if (fields.medical) {
        delete copy.medicalHistory;
      }
      if (fields.waiver) {
        copy.waiverType = 'NONE';
      }
      if (fields.isRegistered) {
        copy.isRegistered = false;
        delete copy.destination;
        delete copy.wave;
        delete copy.tShirtSize;
        delete copy.tShirtDesign;
      }

      return copy;
    });

    onApplyClear(updated, targetStudents.length);
    setIsSubmitting(false);
    setConfirmText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kosongkan Field Data Siswa (Bulk Clear)"
      subtitle="Pilih kolom/field tertentu yang ingin dikosongkan secara massal"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Scope Filter Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>1. Scope / Target Siswa yang Akan Dikosongkan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filter Kelas
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
                {classList.map((c) => {
                  const count = students.filter((s) => s.className === c).length;
                  return (
                    <option key={c} value={c}>
                      Kelas {c} ({count} Siswa)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Filter Status Angket
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">Semua Siswa (Sudah & Belum Mengisi)</option>
                <option value="REGISTERED">
                  Hanya Siswa Sudah Mengisi Angket (
                  {students.filter((s) => s.isRegistered).length} Siswa)
                </option>
                <option value="UNREGISTERED">
                  Hanya Siswa Belum Mengisi Angket (
                  {students.filter((s) => !s.isRegistered).length} Siswa)
                </option>
              </select>
            </div>
          </div>

          <div className="text-xs text-sky-800 font-medium bg-sky-50 border border-sky-200 px-3 py-2 rounded-xl flex items-center justify-between">
            <span>
              Target Terdampak: <strong>{targetStudents.length} siswa</strong>
            </span>
            <span className="text-[11px] text-sky-600">
              {selectedClass === 'ALL' ? 'Seluruh Kelas' : `Kelas ${selectedClass}`} •{' '}
              {selectedStatus === 'ALL'
                ? 'Semua Status'
                : selectedStatus === 'REGISTERED'
                ? 'Sudah Mengisi'
                : 'Belum Mengisi'}
            </span>
          </div>
        </div>

        {/* Fields Checklist Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Eraser className="w-4 h-4 text-rose-600" />
              <span>2. Checklist Kolom/Field yang Ingin Dikosongkan</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllFields}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 hover:underline cursor-pointer"
              >
                Pilih Semua
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={clearAllFieldSelections}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
              >
                Hapus Semua Pilih
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Field: Destination */}
            <div
              onClick={() => toggleField('destination')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                fields.destination
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {fields.destination ? (
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-extrabold">Pilihan Tujuan Tour</p>
                  <p className="text-[10px] opacity-75">Kosongkan kolom destination (Bali/Yogya)</p>
                </div>
              </div>
            </div>

            {/* Field: Wave */}
            <div
              onClick={() => toggleField('wave')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                fields.wave
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {fields.wave ? (
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-extrabold">Gelombang Keberangkatan</p>
                  <p className="text-[10px] opacity-75">Kosongkan kolom wave (Gel 1 / Gel 2)</p>
                </div>
              </div>
            </div>

            {/* Field: T-Shirt Size & Design */}
            <div
              onClick={() => toggleField('tshirt')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                fields.tshirt
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {fields.tshirt ? (
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-extrabold">Ukuran & Desain Kaos</p>
                  <p className="text-[10px] opacity-75">Kosongkan ukuran kaos (S/M/L/XL/dll)</p>
                </div>
              </div>
            </div>

            {/* Field: Bus & Seat */}
            <div
              onClick={() => toggleField('bus')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                fields.bus
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {fields.bus ? (
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-extrabold">Penugasan Bus & Nomor Kursi</p>
                  <p className="text-[10px] opacity-75">Reset nomor bus & nomor kursi</p>
                </div>
              </div>
            </div>

            {/* Field: Room */}
            <div
              onClick={() => toggleField('room')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                fields.room
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {fields.room ? (
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-extrabold">Penugasan Nomor Kamar</p>
                  <p className="text-[10px] opacity-75">Reset nomor kamar hotel</p>
                </div>
              </div>
            </div>

            {/* Field: Parent Info */}
            <div
              onClick={() => toggleField('parents')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                fields.parents
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {fields.parents ? (
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-extrabold">Data Orang Tua / Wali</p>
                  <p className="text-[10px] opacity-75">Nama, alamat, dan No. HP Orang Tua</p>
                </div>
              </div>
            </div>

            {/* Field: Student Phone */}
            <div
              onClick={() => toggleField('studentPhone')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                fields.studentPhone
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {fields.studentPhone ? (
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-extrabold">No. WA Siswa</p>
                  <p className="text-[10px] opacity-75">Kosongkan kontak nomor WhatsApp siswa</p>
                </div>
              </div>
            </div>

            {/* Field: Medical History */}
            <div
              onClick={() => toggleField('medical')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                fields.medical
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {fields.medical ? (
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-extrabold">Riwayat Penyakit</p>
                  <p className="text-[10px] opacity-75">Kosongkan catatan kesehatan & riwayat penyakit</p>
                </div>
              </div>
            </div>

            {/* Field: Waiver */}
            <div
              onClick={() => toggleField('waiver')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                fields.waiver
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {fields.waiver ? (
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-extrabold">Status Beasiswa / Diskon</p>
                  <p className="text-[10px] opacity-75">Reset status beasiswa ke Reguler (NONE)</p>
                </div>
              </div>
            </div>

            {/* Field: Registration Status */}
            <div
              onClick={() => toggleField('isRegistered')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                fields.isRegistered
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {fields.isRegistered ? (
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-extrabold text-rose-700">Reset Status Angket Siswa</p>
                  <p className="text-[10px] opacity-75">Ubah status menjadi &quot;Belum Mengisi Angket&quot;</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Footer */}
        <div className="pt-2 border-t border-slate-200 space-y-3">
          {!hasAnyFieldSelected ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Silakan centang setidaknya satu kolom yang ingin dikosongkan.</span>
            </div>
          ) : targetStudents.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Tidak ada siswa yang sesuai dengan filter scope yang dipilih.</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                Aksi ini akan menghapus data pada kolom terpilih untuk{' '}
                <strong className="text-slate-900">{targetStudents.length} siswa</strong>.
              </p>

              <div className="flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleExecuteClear}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Eraser className="w-4 h-4" />
                  <span>Kosongkan Field Terpilih ({targetStudents.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
