'use client';

import React, { useState } from 'react';
import { AuthUser, AppSettings } from '@/types';
import { AppTab } from '@/components/ui/Header';
import { PublicSidebarDrawer } from '@/components/layout/PublicSidebarDrawer';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { WaliKelasSidebar } from '@/components/layout/WaliKelasSidebar';
import { SchoolLogo } from '@/components/ui/SchoolLogo';
import {
  Compass,
  FileText,
  Building,
  Menu,
  School,
  LogIn,
  ShieldCheck,
  UserCheck,
  LogOut,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentUser: AuthUser;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenProfileSettings?: () => void;
  onOpenLoginModal: (targetTabName?: string, initialRole?: 'ADMIN' | 'WALI_KELAS' | 'PUBLIC_SISWA') => void;
  totalStudentsCount: number;
  registeredStudentsCount: number;
  settings?: AppSettings;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenSettings,
  onOpenProfileSettings,
  onOpenLoginModal,
  totalStudentsCount,
  registeredStudentsCount,
  settings,
}) => {
  const [isPublicDrawerOpen, setIsPublicDrawerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  React.useEffect(() => {
    setLogoError(false);
  }, [settings?.appLogoUrl]);

  const percentage = totalStudentsCount > 0
    ? ((registeredStudentsCount / totalStudentsCount) * 100).toFixed(0)
    : 0;

  const isPublic = currentUser.role === 'PUBLIC_SISWA';
  const isAdmin = currentUser.role === 'ADMIN';
  const isWaliKelas = currentUser.role === 'WALI_KELAS';

  // Helper title for active tab
  const getTabTitle = () => {
    switch (activeTab) {
      case 'ANGKET':
        return 'Angket Peminatan NIS';
      case 'WALI_KELAS':
        return isWaliKelas ? `Portal Wali Kelas ${currentUser.assignedClassName || ''}` : 'Dashboard Monitoring Wali Kelas';
      case 'DENAH_BUS':
        return 'Manajemen Denah Bus & Tempat Duduk';
      case 'PEMBAGIAN_KAMAR':
        return 'Pembagian Kamar Hotel';
      case 'REKAP_HARIAN':
        return 'Rekapitulasi Laporan WA & PDF';
      case 'SURAT_IZIN':
        return 'Surat Izin Resmi Orang Tua';
      case 'RUNDOWN':
        return 'Rundown & Itinerary Acara';
      case 'ADMIN':
        return 'Master Data 1000+ Siswa';
      default:
        return 'SIM Darmawisata';
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 1. PUBLIC / SISWA LANDING PAGE LAYOUT                                      */
  /* -------------------------------------------------------------------------- */
  if (isPublic) {
    return (
      <div className="min-h-screen bg-slate-100/80 text-slate-900 font-sans flex flex-col">
        {/* Top Announcement Bar */}
        <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between gap-2 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2 font-medium truncate">
            <School className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{settings?.schoolName || 'SMK PGRI 2 PONOROGO'}</span>
            <span className="hidden sm:inline text-slate-400">— Terakreditasi A</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-full text-[11px] border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{registeredStudentsCount} / {totalStudentsCount} Siswa Terdaftar ({percentage}%)</span>
            </div>
          </div>
        </div>

        {/* Header Main Navigation Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* Logo Brand */}
            <div className="flex items-center gap-3">
              {settings?.appLogoUrl && !logoError ? (
                <img
                  key={settings.appLogoUrl}
                  src={settings.appLogoUrl}
                  alt="App Logo"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="w-11 h-11 rounded-xl object-contain border border-slate-200 bg-white"
                />
              ) : (
                <SchoolLogo className="w-11 h-11" />
              )}
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none uppercase">
                  {settings?.appName || 'SIM DARMAWISATA'}
                </h1>
                <p className="text-[11px] font-bold text-emerald-600 mt-0.5 uppercase tracking-wide">
                  {settings?.schoolName || 'SMK PGRI 2 PONOROGO'}
                </p>
              </div>
            </div>

            {/* Desktop Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('ANGKET')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ANGKET'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>1. Angket NIS</span>
              </button>

              <button
                onClick={() => setActiveTab('SURAT_IZIN')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'SURAT_IZIN'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>2. Surat Izin Orang Tua</span>
              </button>

              <button
                onClick={() => setActiveTab('RUNDOWN')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'RUNDOWN'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>3. Rundown Acara</span>
              </button>
            </nav>

            {/* Sidebar Drawer Toggle Button */}
            <button
              onClick={() => setIsPublicDrawerOpen(true)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-300 transition-all"
              title="Buka Sidebar Navigasi & Login"
            >
              <Menu className="w-5 h-5 text-emerald-600" />
              <span className="hidden sm:inline font-extrabold text-xs">Menu & Sidebar Login</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Public Sidebar Drawer Overlay */}
        <div className="no-print">
          <PublicSidebarDrawer
            isOpen={isPublicDrawerOpen}
            onClose={() => setIsPublicDrawerOpen(false)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenLoginModal={onOpenLoginModal}
            currentUser={currentUser}
            totalStudentsCount={totalStudentsCount}
            registeredStudentsCount={registeredStudentsCount}
            settings={settings}
          />
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 2. ADMIN & WALI KELAS CONTROL CENTER LAYOUT                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans flex flex-col lg:flex-row">
      {/* Sidebar Component Depending on Role */}
      <div className="no-print">
        {isAdmin ? (
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            onLogout={onLogout}
            onOpenSettings={onOpenSettings}
            onOpenProfileSettings={onOpenProfileSettings}
            totalStudentsCount={totalStudentsCount}
            registeredStudentsCount={registeredStudentsCount}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        ) : (
          <WaliKelasSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            onLogout={onLogout}
            onOpenProfileSettings={onOpenProfileSettings}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-4 sm:px-6 py-3 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300"
              title="Buka Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {isAdmin ? 'Super Admin Workspace' : `Wali Kelas Workspace`}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-500">{getTabTitle()}</span>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {getTabTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenProfileSettings && (
              <button
                onClick={onOpenProfileSettings}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                title="Kelola Profil & Password Akun"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Profil & Password</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={onOpenSettings}
                className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>Pengaturan</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors"
              title="Keluar / Switch Role"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
