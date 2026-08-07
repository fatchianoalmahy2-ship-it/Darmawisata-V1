'use client';

import React, { useState, useMemo } from 'react';
import { SchoolClass, Student, AppSettings } from '@/types';
import { motion } from 'motion/react';
import { Modal } from '@/components/ui/Modal';
import { 
  UserCheck, 
  Search, 
  Edit3, 
  KeyRound, 
  Phone, 
  ExternalLink, 
  Award, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  Send,
  Lock,
  Eye,
  EyeOff,
  UserPlus
} from 'lucide-react';
import { formatWhatsAppLink, normalizeClassName } from '@/lib/utils';
import { useTableQuery } from '@/hooks/useTableQuery';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';
import { PaginationControls } from '@/components/ui/PaginationControls';

interface WaliKelasManagerProps {
  classes: SchoolClass[];
  students: Student[];
  settings: AppSettings;
  onUpdateClass: (updatedClass: SchoolClass) => void;
  onAddClass: (newClass: SchoolClass) => void;
}

export const WaliKelasManager: React.FC<WaliKelasManagerProps> = ({
  classes,
  students,
  settings,
  onUpdateClass,
  onAddClass,
}) => {
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  
  // Form state
  const [formTeacherName, setFormTeacherName] = useState('');
  const [formTeacherPhone, setFormTeacherPhone] = useState('');
  const [formTeacherPassword, setFormTeacherPassword] = useState('');
  const [formClassName, setFormClassName] = useState('');
  const [formDepartment, setFormDepartment] = useState('Teknik Otomotif');
  
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const threshold = settings?.waliKelasParticipationThreshold || 75;

  // Toggle password visibility
  const togglePasswordVisibility = (classId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };

  // Open edit modal
  const handleOpenEdit = (cls: SchoolClass) => {
    setSelectedClass(cls);
    setFormTeacherName(cls.homeroomTeacher);
    setFormTeacherPhone(cls.teacherPhone || '');
    setFormTeacherPassword(cls.teacherPassword || '');
    setFormClassName(cls.name);
    setFormDepartment(cls.department);
    setIsEditModalOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !formTeacherName) return;

    const normalizedName = normalizeClassName(formClassName);

    const updated: SchoolClass = {
      ...selectedClass,
      homeroomTeacher: formTeacherName,
      teacherPhone: formTeacherPhone,
      teacherPassword: formTeacherPassword || undefined,
      name: normalizedName,
      department: formDepartment,
    };

    onUpdateClass(updated);
    setIsEditModalOpen(false);
  };

  // Reset password to default
  const handleResetPassword = (cls: SchoolClass) => {
    if (confirm(`Reset password Wali Kelas untuk kelas ${cls.name} ke default?`)) {
      const updated: SchoolClass = {
        ...cls,
        teacherPassword: '', // empty means fallback to default 'wali123'
      };
      onUpdateClass(updated);
    }
  };

  // Generate WA share link with credentials
  const handleShareCredentials = (cls: SchoolClass) => {
    const username = `wali_${cls.name.replace(/\s+/g, '_').toLowerCase()}`;
    const password = cls.teacherPassword || 'wali123';
    
    const message = `Yth. Bapak/Ibu Wali Kelas ${cls.name} (${cls.homeroomTeacher}),\n\nBerikut adalah info akses (kredensial) login Anda ke Darmawisata ${settings.schoolName || 'SMK PGRI 2 Ponorogo'}:\n\n- Kelas: ${cls.name}\n- Username: ${username}\n- Password: ${password}\n\nSilakan gunakan akun ini untuk masuk ke dashboard, memonitor keaktifan angket siswa, dan mengunduh berkas laporan.\n\nLink Dashboard: ${typeof window !== 'undefined' ? window.location.origin : ''}\n\nTerima kasih.`;
    
    const formattedPhone = cls.teacherPhone ? cls.teacherPhone.replace(/[^0-9]/g, '') : '';
    const phoneWithCountry = formattedPhone.startsWith('0') 
      ? '62' + formattedPhone.slice(1) 
      : formattedPhone;

    if (!phoneWithCountry) {
      alert('Nomor HP Wali Kelas tidak valid atau belum diset.');
      return;
    }

    const waLink = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };

  // Calculate stats
  const totalWaliKelas = classes.length;
  
  const classStatsList = useMemo(() => {
    return classes.map(cls => {
      const classStudents = students.filter(s => s.className === cls.name);
      const registeredCount = classStudents.filter(s => s.isRegistered).length;
      const totalCount = cls.totalStudents || classStudents.length || 1;
      const percentage = parseFloat(((registeredCount / totalCount) * 100).toFixed(1));
      const isCompleted = percentage >= threshold;
      
      return {
        ...cls,
        registeredCount,
        totalCount,
        percentage,
        isCompleted
      };
    });
  }, [classes, students, threshold]);

  const completedCount = classStatsList.filter(c => c.isCompleted).length;
  const incompleteCount = totalWaliKelas - completedCount;
  const withPhoneCount = classes.filter(c => c.teacherPhone).length;

  // Unified Query Hook
  const {
    search,
    setSearch,
    filters,
    setFilters,
    handleClearFilters,
    pagination,
    processedData: filteredList,
    paginatedData,
    totalPages,
    handlePageChange,
  } = useTableQuery<any>(classStatsList, {
    searchFields: ['homeroomTeacher', 'name', 'teacherPhone'],
    initialPageSize: 6,
    filterFn: (item, activeFilters) => {
      const statusVal = activeFilters.status;
      if (!statusVal) return true;
      if (statusVal === 'COMPLETED') return item.isCompleted;
      if (statusVal === 'INCOMPLETE') return !item.isCompleted;
      return true;
    },
  });

  return (
    <div className="space-y-6" id="wali-kelas-manager-section">
      {/* Upper Information Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Management Akun Wali Kelas
          </div>
          <h2 className="text-lg font-black text-slate-900">Kontrol Akun & Kelas Diampu Wali Kelas</h2>
          <p className="text-xs text-slate-500">
            Admin memiliki hak akses penuh untuk membuat akun, mengatur kelas yang diampu, mengubah password wali kelas, memantau tuntas verifikasi, serta mengirimkan kredensial via WA.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Wali Kelas</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{totalWaliKelas}</span>
            <span className="text-xs text-slate-500 font-bold">Akun Terdaftar</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Verifikasi Tuntas (≥{threshold}%)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
            <span className="text-xs text-slate-500 font-bold">Wali Kelas</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full" 
              style={{ width: `${totalWaliKelas > 0 ? (completedCount / totalWaliKelas) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Belum Tuntas (&lt;{threshold}%)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600">{incompleteCount}</span>
            <span className="text-xs text-slate-500 font-bold">Wali Kelas</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-full" 
              style={{ width: `${totalWaliKelas > 0 ? (incompleteCount / totalWaliKelas) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Kontak WA Terdaftar</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800">{withPhoneCount}</span>
            <span className="text-xs text-slate-500 font-bold">Wali Kelas ({totalWaliKelas > 0 ? Math.round((withPhoneCount / totalWaliKelas) * 100) : 0}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-slate-700 h-full" 
              style={{ width: `${totalWaliKelas > 0 ? (withPhoneCount / totalWaliKelas) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Control Filters */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama wali kelas, kelas diampu, atau nomor HP..."
        activeFilters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        filters={[
          {
            key: 'status',
            label: 'Status Verifikasi',
            placeholder: 'Semua Status',
            options: [
              { value: 'COMPLETED', label: 'Tuntas Verifikasi' },
              { value: 'INCOMPLETE', label: 'Belum Tuntas' },
            ],
          },
        ]}
      />

      {/* Wali Kelas Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="wali-kelas-grid">
        {paginatedData.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">Tidak ada Wali Kelas yang cocok</p>
            <p className="text-xs text-slate-400">Cobalah menyesuaikan kata kunci pencarian atau filter status Anda.</p>
          </div>
        ) : (
          paginatedData.map((item) => {
            const username = `wali_${item.name.replace(/\s+/g, '_').toLowerCase()}`;
            const isPasswordCustom = !!item.teacherPassword;
            const password = item.teacherPassword || 'wali123';
            const isShow = !!showPasswordMap[item.id];

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 hover:shadow-md transition-all group relative"
              >
                {/* Header info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm leading-snug">
                        {item.homeroomTeacher}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Wali Kelas {item.name}
                      </p>
                    </div>

                    {/* Status Badge */}
                    {item.isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> TUNTAS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> BELUM TUNTAS
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs">
                    {/* Class Info */}
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-semibold">Kelas yang Diampu:</span>
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-xs border border-slate-200">
                        {item.name}
                      </span>
                    </div>

                    {/* Department Info */}
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-semibold">Kompetensi Keahlian:</span>
                      <span className="font-bold text-slate-800 text-[11px]">
                        {item.department}
                      </span>
                    </div>

                    {/* Phone Info */}
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-semibold">No. Kontak WA:</span>
                      {item.teacherPhone ? (
                        <a
                          href={formatWhatsAppLink(item.teacherPhone, `Halo Pak/Bu ${item.homeroomTeacher}`)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{item.teacherPhone}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-rose-500 font-bold italic text-[11px]">Belum Diisi</span>
                      )}
                    </div>

                    {/* Authentication details */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 mt-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">Username:</span>
                        <code className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold">
                          {username}
                        </code>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold">Password:</span>
                        <div className="flex items-center gap-1.5">
                          <code className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold">
                            {isShow ? password : '••••••••'}
                          </code>
                          <button
                            onClick={() => togglePasswordVisibility(item.id)}
                            className="p-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title={isShow ? 'Sembunyikan' : 'Tampilkan'}
                          >
                            {isShow ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 pt-0.5 border-t border-slate-200/60 flex items-center justify-between">
                        <span>Sifat Password:</span>
                        <span className={`font-black ${isPasswordCustom ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {isPasswordCustom ? 'Kustom (Admin)' : 'Default (wali123)'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-500">Partisipasi Angket:</span>
                        <span className={`${item.isCompleted ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {item.registeredCount} / {item.totalCount} Siswa ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/80">
                        <div 
                          className={`h-full transition-all duration-500 ${item.isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleResetPassword(item)}
                    disabled={!isPasswordCustom}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 cursor-pointer text-[11px] font-bold flex items-center gap-1"
                    title="Reset Password ke default (wali123)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Pass</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200 flex items-center gap-1 cursor-pointer text-[11px] font-bold"
                      title="Edit Akun & Kelas"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleShareCredentials(item)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all flex items-center gap-1 cursor-pointer text-[11px] font-bold shadow-xs"
                      title="Kirim kredensial login via WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim WA</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-2">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={totalPages}
            totalItems={filteredList.length}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
            itemName="wali kelas"
          />
        </div>
      )}

      {/* Modal Edit Account & Class */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profil & Akses Wali Kelas"
        subtitle={`Mengelola kredensial dan kelas diampu untuk ${selectedClass?.homeroomTeacher}`}
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Wali Kelas *
            </label>
            <input
              type="text"
              required
              value={formTeacherName}
              onChange={(e) => setFormTeacherName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Siti Aminah, S.Pd."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rombel / Kelas Diampu *
              </label>
              <input
                type="text"
                required
                value={formClassName}
                onChange={(e) => setFormClassName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: XII TKR 1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kejuruan / Departemen</label>
              <select
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
              >
                <option value="Teknik Otomotif">Teknik Otomotif</option>
                <option value="Tata Busana">Tata Busana</option>
                <option value="Teknik Pemesinan">Teknik Pemesinan</option>
                <option value="Teknik Komputer & Jaringan">Teknik Komputer & Jaringan</option>
                <option value="Teknik Elektronika">Teknik Elektronika</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              No. HP / WA Aktif
            </label>
            <input
              type="text"
              value={formTeacherPhone}
              onChange={(e) => setFormTeacherPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
              placeholder="0812xxxxxxxx"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Digunakan untuk pengiriman otomatis kredensial via tombol WA share.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Password Akun (Kosongkan untuk Default: wali123)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={formTeacherPassword}
                onChange={(e) => setFormTeacherPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Misal: passwordrahasia, waliXII1"
              />
            </div>
            <p className="text-[10px] text-indigo-500 mt-1 font-medium">
              *Jika diisi, wali kelas terkait login menggunakan password kustom ini. Jika dikosongkan, login kembali menggunakan password default &apos;wali123&apos;.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Simpan Perubahan Akun
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
