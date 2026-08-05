'use client';

import React from 'react';
import { AuthUser } from '@/types';
import {
  Compass,
  UserCheck,
  Building,
  Bus,
  BedDouble,
  FileText,
  Settings,
  School,
  Share2,
  Lock,
  LogOut,
  ShieldCheck,
  LogIn,
  SlidersHorizontal,
  User,
} from 'lucide-react';

export type AppTab =
  | 'ANGKET'
  | 'WALI_KELAS'
  | 'DENAH_BUS'
  | 'PEMBAGIAN_KAMAR'
  | 'REKAP_HARIAN'
  | 'SURAT_IZIN'
  | 'RUNDOWN'
  | 'ADMIN';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenSettings: () => void;
  onOpenProfileSettings?: () => void;
  totalStudentsCount: number;
  registeredStudentsCount: number;
  currentUser: AuthUser;
  onOpenLoginModal: (targetTabName?: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenProfileSettings,
  totalStudentsCount,
  registeredStudentsCount,
  currentUser,
  onOpenLoginModal,
  onLogout,
}) => {
  const percentage = totalStudentsCount > 0
    ? ((registeredStudentsCount / totalStudentsCount) * 100).toFixed(0)
    : 0;

  const isAdmin = currentUser.role === 'ADMIN';
  const isWaliKelas = currentUser.role === 'WALI_KELAS';
  const isPublic = currentUser.role === 'PUBLIC_SISWA';

  // Helper to handle tab click with permission check
  const handleTabClick = (tab: AppTab, minRoleRequired: 'PUBLIC' | 'WALI_KELAS' | 'ADMIN', label: string) => {
    if (minRoleRequired === 'PUBLIC') {
      setActiveTab(tab);
      return;
    }

    if (minRoleRequired === 'WALI_KELAS') {
      if (isWaliKelas || isAdmin) {
        setActiveTab(tab);
      } else {
        onOpenLoginModal(label);
      }
      return;
    }

    if (minRoleRequired === 'ADMIN') {
      if (isAdmin) {
        setActiveTab(tab);
      } else {
        onOpenLoginModal(label);
      }
      return;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <School className="w-4 h-4 text-emerald-400" />
          <span>SMK PGRI 2 PONOROGO — Terakreditasi A</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">
            SIM Darmawisata 2025/2026
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          {/* User Role Badge */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {isAdmin ? (
              <span className="flex items-center gap-1 text-blue-400 font-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panitia
              </span>
            ) : isWaliKelas ? (
              <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                <UserCheck className="w-3.5 h-3.5" />
                Wali Kelas {currentUser.assignedClassName || ''}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Compass className="w-3.5 h-3.5" />
                Mode Siswa / Publik
              </span>
            )}
          </div>

          {/* Registration Stats */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">{registeredStudentsCount}</span> /{' '}
            <span>{totalStudentsCount} Siswa ({percentage}%)</span>
          </div>

          {/* Login / Role Switch / Logout Actions */}
          {isPublic ? (
            <button
              onClick={() => onOpenLoginModal()}
              className="flex items-center gap-1 text-white bg-emerald-600 hover:bg-emerald-500 font-bold px-3 py-1 rounded-lg transition-colors shadow-xs"
              title="Login Wali Kelas / Admin"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Masuk Portal</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              {onOpenProfileSettings && (
                <button
                  onClick={onOpenProfileSettings}
                  className="flex items-center gap-1 text-emerald-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                  title="Atur Profil & Password Akun"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline font-bold">Profil & Password</span>
                </button>
              )}
              <button
                onClick={() => onOpenLoginModal()}
                className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors text-xs"
                title="Ganti Role Login"
              >
                Ganti Role
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-red-300 hover:text-white bg-slate-800 hover:bg-red-900/60 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors text-xs"
                title="Keluar"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

          {/* Admin Settings Button */}
          {isAdmin && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700"
              title="Pengaturan Sistem & Parameter"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pengaturan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* School Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/20">
            PGRI2
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              SIM DARMAWISATA
            </h1>
            <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wide">
              SMK PGRI 2 PONOROGO — BALI & YOGYAKARTA
            </p>
          </div>
        </div>

        {/* Tab Navigation Pill Buttons */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* TAB 1: Angket NIS (Public) */}
          <button
            onClick={() => handleTabClick('ANGKET', 'PUBLIC', 'Angket NIS')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ANGKET'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Angket NIS</span>
          </button>

          {/* TAB 2: Menu Wali Kelas (Wali Kelas / Admin) */}
          <button
            onClick={() => handleTabClick('WALI_KELAS', 'WALI_KELAS', 'Menu Wali Kelas')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'WALI_KELAS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>2. Menu Wali Kelas</span>
            {isPublic && <span title="Memerlukan Login Wali Kelas"><Lock className="w-3 h-3 text-amber-500 shrink-0" /></span>}
          </button>

          {/* TAB 3: Rekap WA/PDF (Wali Kelas / Admin) */}
          <button
            onClick={() => handleTabClick('REKAP_HARIAN', 'WALI_KELAS', 'Rekap WA / PDF')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'REKAP_HARIAN'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>3. Rekap WA/PDF</span>
            {isPublic && <span title="Memerlukan Login"><Lock className="w-3 h-3 text-amber-500 shrink-0" /></span>}
          </button>

          {/* TAB 4: Denah Bus (Wali Kelas / Admin) */}
          <button
            onClick={() => handleTabClick('DENAH_BUS', 'WALI_KELAS', 'Denah Bus')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'DENAH_BUS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>4. Denah Bus</span>
            {isPublic && <span title="Memerlukan Login"><Lock className="w-3 h-3 text-amber-500 shrink-0" /></span>}
          </button>

          {/* TAB 5: Kamar Otomatis (Wali Kelas / Admin) */}
          <button
            onClick={() => handleTabClick('PEMBAGIAN_KAMAR', 'WALI_KELAS', 'Pembagian Kamar')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'PEMBAGIAN_KAMAR'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>5. Kamar Hotel</span>
            {isPublic && <span title="Memerlukan Login"><Lock className="w-3 h-3 text-amber-500 shrink-0" /></span>}
          </button>

          {/* TAB 6: Surat Resmi (Public) */}
          <button
            onClick={() => handleTabClick('SURAT_IZIN', 'PUBLIC', 'Surat Resmi')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'SURAT_IZIN'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>6. Surat Resmi</span>
          </button>

          {/* TAB 7: Rundown (Public) */}
          <button
            onClick={() => handleTabClick('RUNDOWN', 'PUBLIC', 'Rundown Acara')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'RUNDOWN'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Rundown</span>
          </button>

          {/* TAB 8: Admin Management (Admin Only) */}
          <button
            onClick={() => handleTabClick('ADMIN', 'ADMIN', 'Admin Panitia')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ADMIN'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100 bg-slate-50 border border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Admin Data</span>
            {!isAdmin && <span title="Khusus Admin Panitia"><Lock className="w-3 h-3 text-slate-400 shrink-0" /></span>}
          </button>
        </nav>
      </div>
    </header>
  );
};
