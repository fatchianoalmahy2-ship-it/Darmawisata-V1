'use client';

import React, { useState } from 'react';
import { AppTab } from '@/components/ui/Header';
import { AuthUser, AppSettings } from '@/types';
import { SchoolLogo } from '@/components/ui/SchoolLogo';
import {
  Compass,
  FileText,
  Building,
  School,
  X,
  UserCheck,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Info,
  MapPin,
  Phone,
} from 'lucide-react';

interface PublicSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenLoginModal: (targetTabName?: string, initialRole?: 'ADMIN' | 'WALI_KELAS' | 'PUBLIC_SISWA') => void;
  currentUser: AuthUser;
  totalStudentsCount: number;
  registeredStudentsCount: number;
  settings?: AppSettings;
}

export const PublicSidebarDrawer: React.FC<PublicSidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenLoginModal,
  totalStudentsCount,
  registeredStudentsCount,
  settings,
}) => {
  const [logoError, setLogoError] = useState(false);

  React.useEffect(() => {
    setLogoError(false);
  }, [settings?.appLogoUrl]);

  if (!isOpen) return null;

  const percentage = totalStudentsCount > 0
    ? ((registeredStudentsCount / totalStudentsCount) * 100).toFixed(0)
    : 0;

  const handleNavClick = (tab: AppTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container */}
      <aside className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            {settings?.appLogoUrl && !logoError ? (
              <img
                key={settings.appLogoUrl}
                src={settings.appLogoUrl}
                alt="App Logo"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="w-10 h-10 rounded-xl object-contain border border-slate-700 bg-white"
              />
            ) : (
              <SchoolLogo className="w-10 h-10" />
            )}
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-tight uppercase">
                {settings?.appName || 'Darmawisata'}
              </h3>
              <p className="text-[11px] text-emerald-400 font-semibold uppercase">
                {settings?.schoolName || 'SMK PGRI 2 Ponorogo'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section 1: Menu Utama Siswa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              <span>Navigasi Siswa & Publik</span>
              <span className="text-emerald-600">Publik</span>
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => handleNavClick('ANGKET')}
                className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'ANGKET'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4" />
                  <div className="text-left">
                    <p className="leading-tight">1. Angket Peminatan NIS</p>
                    <p className={`text-[10px] font-normal mt-0.5 ${activeTab === 'ANGKET' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      Isi data ukuran kaos, bus & kamar
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick('SURAT_IZIN')}
                className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'SURAT_IZIN'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" />
                  <div className="text-left">
                    <p className="leading-tight">2. Surat Izin Orang Tua</p>
                    <p className={`text-[10px] font-normal mt-0.5 ${activeTab === 'SURAT_IZIN' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      Cetak PDF resmi per siswa
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => handleNavClick('RUNDOWN')}
                className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'RUNDOWN'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4" />
                  <div className="text-left">
                    <p className="leading-tight">3. Rundown & Jadwal</p>
                    <p className={`text-[10px] font-normal mt-0.5 ${activeTab === 'RUNDOWN' ? 'text-emerald-100' : 'text-slate-500'}`}>
                      Itinerary Bali & Yogyakarta
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            </nav>
          </div>

          {/* Section 2: Stat Card */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2 text-emerald-900">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Total Pendaftar
              </span>
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black text-[11px]">
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-emerald-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-emerald-700 leading-snug">
              Sebanyak <strong>{registeredStudentsCount}</strong> dari <strong>{totalStudentsCount}</strong> siswa telah mengisi angket peminatan.
            </p>
          </div>

          {/* Section 3: Portal Akses Guru & Admin */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              <span>Akses Portal Khusus Guru & Staf</span>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-start gap-2.5 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-white text-xs">Otentikasi Staf Sekolah</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                    Akses rekapitulasi kelas, denah bus, kamar hotel, dan kontrol admin memerlukan login.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenLoginModal('Portal Wali Kelas', 'WALI_KELAS');
                  }}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-between transition-colors shadow-xs"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-200" /> Login Wali Kelas
                  </span>
                  <ChevronRight className="w-4 h-4 text-emerald-200" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenLoginModal('Admin Control Center', 'ADMIN');
                  }}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-between border border-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" /> Login Admin Panitia
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Info Sekolah */}
          <div className="space-y-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <School className="w-3.5 h-3.5 text-emerald-600" />
              <span>SMK PGRI 2 PONOROGO</span>
            </div>
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Jl. Soekarno Hatta No. 9, Ponorogo, Jawa Timur</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>(0352) 481234 — Akreditasi A</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
          <p className="font-semibold text-slate-700">Darmawisata 2025/2026</p>
          <p>Sistem Informasi Terpadu Berbasis Cloud</p>
        </div>
      </aside>
    </div>
  );
};
