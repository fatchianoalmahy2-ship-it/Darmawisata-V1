'use client';

import React, { useState } from 'react';
import { SchoolClass, Student } from '@/types';
import { motion } from 'motion/react';
import { Modal } from '@/components/ui/Modal';
import { normalizeClassName, sortClassesAlphabetically } from '@/lib/utils';
import { 
  FolderPlus, 
  Edit3, 
  Trash2, 
  Search, 
  Users, 
  Phone, 
  User, 
  Award,
  CheckCircle2
} from 'lucide-react';

interface ClassManagerProps {
  classes: SchoolClass[];
  students: Student[];
  onAddClass: (newClass: SchoolClass) => void;
  onUpdateClass: (updatedClass: SchoolClass) => void;
  onDeleteClass: (classId: string) => void;
}

export const ClassManager: React.FC<ClassManagerProps> = ({
  classes,
  students,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [deletingClass, setDeletingClass] = useState<SchoolClass | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formTeacher, setFormTeacher] = useState('');
  const [formPhone, setFormPhone] = useState('');

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormName('');
    setFormDepartment('Teknik Otomotif');
    setFormTeacher('');
    setFormPhone('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    setFormName(cls.name);
    setFormDepartment(cls.department);
    setFormTeacher(cls.homeroomTeacher);
    setFormPhone(cls.teacherPhone || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formTeacher) return;

    const normalizedName = normalizeClassName(formName);

    if (editingClass) {
      const updated: SchoolClass = {
        ...editingClass,
        name: normalizedName,
        department: formDepartment,
        homeroomTeacher: formTeacher,
        teacherPhone: formPhone,
      };
      onUpdateClass(updated);
    } else {
      const newCls: SchoolClass = {
        id: `class-${Date.now()}`,
        name: normalizedName,
        department: formDepartment,
        homeroomTeacher: formTeacher,
        teacherPhone: formPhone,
        totalStudents: 0,
      };
      onAddClass(newCls);
    }
    setIsModalOpen(false);
  };

  const sortedAndFilteredClasses = sortClassesAlphabetically(
    classes.filter((c) => {
      return (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.homeroomTeacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
  );

  return (
    <div className="space-y-6">
      {/* Upper Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 mb-1">
            <Award className="w-3.5 h-3.5" /> Management Wali Kelas & Rombel
          </div>
          <h2 className="text-lg font-black text-slate-900">Kelola Data Rombongan Belajar (Rombel)</h2>
          <p className="text-xs text-slate-500">
            Atur nama kelas, departemen kejuruan, dan wali kelas pendamping yang bertanggung jawab atas proses verifikasi angket.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <FolderPlus className="w-4 h-4 text-amber-400" /> Tambah Rombel Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kelas, wali kelas, atau kejuruan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAndFilteredClasses.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">Tidak ada rombel ditemukan</p>
            <p className="text-xs text-slate-400">Silakan tambahkan rombel baru atau sesuaikan pencarian Anda.</p>
          </div>
        ) : (
          sortedAndFilteredClasses.map((cls) => {
            const actualCount = students.filter((s) => s.className === cls.name).length;
            const registeredCount = students.filter((s) => s.className === cls.name && s.isRegistered).length;
            
            return (
              <motion.div
                key={cls.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-lg tracking-tight">
                      {cls.name}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {cls.department}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wali Kelas</p>
                        <p className="font-extrabold text-slate-800">{cls.homeroomTeacher}</p>
                      </div>
                    </div>

                    {cls.teacherPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No. Kontak WA</p>
                          <p className="font-bold text-slate-700">{cls.teacherPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-500 font-bold text-xs">
                    <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      {registeredCount} / {actualCount} Siswa Terdaftar
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Kelas"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingClass(cls)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal Add/Edit Class */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Rombel Kelas' : 'Tambah Rombel Baru'}
        subtitle="Kelola data kelas dan penanggung jawab wali kelas pendamping"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Rombel / Kelas *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: XII TAB 1, XII TKR A"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kejuruan / Departemen</label>
            <select
              value={formDepartment}
              onChange={(e) => setFormDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
            >
              <option value="Teknik Otomotif">Teknik Otomotif (TKR/TSM)</option>
              <option value="Tata Busana">Tata Busana (TAB)</option>
              <option value="Teknik Pemesinan">Teknik Pemesinan (TPM)</option>
              <option value="Teknik Komputer & Jaringan">Teknik Komputer & Jaringan (TKJ)</option>
              <option value="Teknik Elektronika">Teknik Elektronika</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Guru Wali Kelas *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Siti Aminah, S.Pd."
              value={formTeacher}
              onChange={(e) => setFormTeacher(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              No. HP / WA Wali Kelas
            </label>
            <input
              type="text"
              placeholder="0812xxxxxxxx"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Simpan Rombel
            </button>
          </div>
        </form>
      </Modal>

      {/* Custom Non-blocking Delete Class Confirmation Modal */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Hapus Rombel Kelas</h3>
                <p className="text-xs text-slate-500 font-medium">Konfirmasi Penghapusan Kelas</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Apakah Anda yakin ingin menghapus Rombel Kelas <strong className="text-slate-900 font-black">{deletingClass.name}</strong>? Menghapus kelas tidak akan menghapus data siswa yang terdaftar.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingClass(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteClass(deletingClass.id);
                  setDeletingClass(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Kelas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
