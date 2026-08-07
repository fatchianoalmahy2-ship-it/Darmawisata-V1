'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Student } from '@/types';
import { normalizeClassName } from '@/lib/utils';
import { Search, UserCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { getStudentsByClass } from '@/services/supabaseService';

interface NisLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: any[];
  onSelectStudent: (student: Student) => void;
}

export const NisLookupModal: React.FC<NisLookupModalProps> = ({
  isOpen,
  onClose,
  classes,
  onSelectStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('');
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const classesList = Array.from(new Set((classes || []).map((c) => normalizeClassName(c.name))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  useEffect(() => {
    if (isOpen && !selectedClassFilter && classesList.length > 0) {
      setSelectedClassFilter(classesList[0]);
    }
  }, [isOpen, classesList, selectedClassFilter]);

  useEffect(() => {
    async function loadStudents() {
      if (!selectedClassFilter || !isOpen) return;
      setIsLoading(true);
      try {
        const students = await getStudentsByClass(selectedClassFilter);
        setClassStudents(students);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStudents();
  }, [selectedClassFilter, isOpen]);

  const normalizeNis = (val: string) => val.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();

  const filteredStudents = classStudents.filter((s) => {
    if (!searchTerm) return true;
    const rawTerm = searchTerm.trim().toLowerCase();
    const normTerm = normalizeNis(searchTerm);
    const matchesName = s.name.toLowerCase().includes(rawTerm);
    const matchesNisRaw = s.nis.toLowerCase().includes(rawTerm);
    const matchesNisNorm = normTerm.length > 0 && normalizeNis(s.nis).includes(normTerm);
    return matchesName || matchesNisRaw || matchesNisNorm;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cari NIS / Nama Siswa"
      subtitle="Pilih kelas terlebih dahulu, lalu ketik nama atau NIS."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Search & Class Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full sm:w-48 shrink-0"
          >
            <option value="" disabled>Pilih Kelas</option>
            {classesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau NIS di kelas ini..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Student List Grid */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
              <p className="text-sm font-medium">Memuat data siswa kelas {selectedClassFilter}...</p>
            </div>
          ) : !selectedClassFilter ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Silakan pilih kelas terlebih dahulu.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm font-medium text-slate-500">
                Tidak ada siswa yang cocok dengan pencarian &quot;{searchTerm}&quot;
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => {
                  onSelectStudent(student);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors">
                    {student.nis}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                      {student.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {student.className}
                      </span>
                      <span>•</span>
                      <span>{student.gender}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {student.isRegistered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100/60 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Mengisi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                      Belum Mengisi
                    </span>
                  )}
                  <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
