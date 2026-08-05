'use client';

import React, { useState } from 'react';
import { AuthUser, SchoolClass, UserRole } from '@/types';
import { AuthService } from '@/services/authService';
import {
  ShieldCheck,
  UserCheck,
  Compass,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  School,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: SchoolClass[];
  onLoginSuccess: (user: AuthUser) => void;
  targetTabName?: string;
  initialRole?: 'ADMIN' | 'WALI_KELAS' | 'PUBLIC_SISWA';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  classes,
  onLoginSuccess,
  targetTabName,
  initialRole,
}) => {
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'WALI_KELAS' | 'PUBLIC_SISWA'>('WALI_KELAS');

  // Automatically update active tab when modal opens or initialRole/targetTabName changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialRole) {
        setActiveTab(initialRole);
      } else if (targetTabName) {
        const lower = targetTabName.toLowerCase();
        if (lower.includes('admin')) {
          setActiveTab('ADMIN');
        } else if (lower.includes('wali')) {
          setActiveTab('WALI_KELAS');
        } else if (lower.includes('siswa') || lower.includes('publik')) {
          setActiveTab('PUBLIC_SISWA');
        }
      }
    }
  }, [isOpen, initialRole, targetTabName]);

  // Admin form
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Wali Kelas form
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.name || 'XII TKR 1');
  const [waliPassword, setWaliPassword] = useState('');
  const [showWaliPass, setShowWaliPass] = useState(false);

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentClassObj = classes.find((c) => c.name === selectedClass) || classes[0];

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = AuthService.loginAdmin(adminUsername, adminPassword);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
      onClose();
    } else {
      setErrorMessage(result.message || 'Login Admin gagal.');
    }
  };

  const handleWaliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const teacherName = currentClassObj?.homeroomTeacher || `Wali Kelas ${selectedClass}`;
    const result = AuthService.loginWaliKelas(
      selectedClass,
      waliPassword,
      teacherName,
      currentClassObj?.teacherPassword
    );
    if (result.success && result.user) {
      onLoginSuccess(result.user);
      onClose();
    } else {
      setErrorMessage(result.message || 'Login Wali Kelas gagal.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    setErrorMessage(null);
    let user: AuthUser;
    if (role === 'WALI_KELAS') {
      const teacherName = currentClassObj?.homeroomTeacher || `Wali Kelas ${selectedClass}`;
      user = AuthService.quickLogin('WALI_KELAS', selectedClass, teacherName);
    } else if (role === 'ADMIN') {
      user = AuthService.quickLogin('ADMIN');
    } else {
      user = AuthService.quickLogin('PUBLIC_SISWA');
    }
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-900 flex items-center justify-center font-black">
              {activeTab === 'ADMIN' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : activeTab === 'WALI_KELAS' ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <School className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {activeTab === 'ADMIN'
                  ? 'Akses Khusus Panitia'
                  : activeTab === 'WALI_KELAS'
                  ? 'Akses Khusus Wali Kelas'
                  : 'Autentikasi Hak Akses'}
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-white">
                {activeTab === 'ADMIN'
                  ? 'Login Control Center Admin'
                  : activeTab === 'WALI_KELAS'
                  ? 'Login Portal Wali Kelas'
                  : 'Login SIM Darmawisata'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {targetTabName ? (
              <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                Menu &apos;{targetTabName}&apos; memerlukan hak akses terverifikasi. Silakan login di bawah ini.
              </span>
            ) : activeTab === 'ADMIN' ? (
              'Masuk dengan username & password admin panitia untuk mengelola Master Data & Pengaturan.'
            ) : activeTab === 'WALI_KELAS' ? (
              'Pilih kelas Anda dan masukkan password wali kelas untuk memantau angket, bus, dan kamar siswa.'
            ) : (
              'Silakan pilih role Anda untuk mengakses portal data SMK PGRI 2 Ponorogo sesuai wewenang.'
            )}
          </p>
        </div>

        {/* Role Tabs Selector */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('WALI_KELAS');
              setErrorMessage(null);
            }}
            className={`py-3 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'WALI_KELAS'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200 font-black'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Wali Kelas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setErrorMessage(null);
            }}
            className={`py-3 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-black'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Panitia Admin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('PUBLIC_SISWA');
              setErrorMessage(null);
            }}
            className={`py-3 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'PUBLIC_SISWA'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200 font-black'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <Compass className="w-4 h-4 text-slate-600" />
            <span>Siswa / Publik</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: WALI KELAS */}
          {activeTab === 'WALI_KELAS' && (
            <form onSubmit={handleWaliSubmit} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl text-xs space-y-1 text-emerald-900">
                <p className="font-extrabold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> Akses Khusus Wali Kelas
                </p>
                <p className="text-emerald-700">
                  Login ini hanya menampilkan data siswa dari kelas yang Anda ampu demi menjaga privasi dan tupoksi masing-masing wali kelas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Kelas Yang Diampu (32 Kelas):
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name} — {cls.homeroomTeacher || cls.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Wali Kelas:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showWaliPass ? 'text' : 'password'}
                    value={waliPassword}
                    onChange={(e) => setWaliPassword(e.target.value)}
                    placeholder="Masukkan password (Default: wali123)"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWaliPass(!showWaliPass)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showWaliPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  *Gunakan password wali kelas yang telah didaftarkan panitia (Default: <strong>wali123</strong>).
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span>Masuk Sebagai Wali Kelas {selectedClass}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ADMIN */}
          {activeTab === 'ADMIN' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-2xl text-xs space-y-1 text-blue-900">
                <p className="font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> Akses Panitia Utama (Super Admin)
                </p>
                <p className="text-blue-700">
                  Dapat mengelola seluruh data 1000+ siswa, pengaturan bus/kamar, serta ekspor rekap seluruh kelas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username Admin:
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Admin:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan password admin"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  *Gunakan username & password admin panitia (Default: <strong>admin</strong> / <strong>admin123</strong>)
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Masuk Sebagai Admin Utama</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PUBLIC / SISWA */}
          {activeTab === 'PUBLIC_SISWA' && (
            <div className="space-y-4">
              <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl text-xs space-y-2 text-slate-700">
                <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" /> Mode Publik & Siswa (Tamu)
                </p>
                <p className="leading-relaxed">
                  Di mode ini, siswa dapat memasukkan <strong>NIS</strong> untuk mengisi angket peminatan, mengunduh Surat Izin Orang Tua resmi, serta melihat Rundown Acara Darmawisata.
                </p>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <p>✔ Dapat diakses tanpa login/password.</p>
                  <p>✖ Tidak dapat melihat data rahasia seluruh kelas atau mengubah denah duduk/kamar.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleQuickLogin('PUBLIC_SISWA')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Lanjutkan Sebagai Mode Siswa / Publik</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
