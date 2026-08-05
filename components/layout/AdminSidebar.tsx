'use client';

import React from 'react';
import { AppTab } from '@/components/ui/Header';
import { AuthUser } from '@/types';
import {
  SlidersHorizontal,
  Bus,
  BedDouble,
  UserCheck,
  Share2,
  Settings,
  LogOut,
  ShieldCheck,
  Compass,
  FileText,
  School,
  Database,
  ChevronRight,
  RefreshCw,
  Sparkles,
  User,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentUser: AuthUser;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenProfileSettings?: () => void;
  totalStudentsCount: number;
  registeredStudentsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenSettings,
  onOpenProfileSettings,
  totalStudentsCount,
  registeredStudentsCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const percentage = totalStudentsCount > 0
    ? ((registeredStudentsCount / totalStudentsCount) * 100).toFixed(0)
    : 0;

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      id: 'ADMIN' as AppTab,
      label: 'Master Data Siswa',
      subtitle: 'Pengelolaan 1000+ data siswa',
      icon: SlidersHorizontal,
      badge: 'Utama',
    },
    {
      id: 'DENAH_BUS' as AppTab,
      label: 'Manajemen Denah Bus',
      subtitle: 'Auto-Seat & susunan kursi',
      icon: Bus,
    },
    {
      id: 'PEMBAGIAN_KAMAR' as AppTab,
      label: 'Pembagian Kamar Hotel',
      subtitle: 'Auto-Room & alokasi gender',
      icon: BedDouble,
    },
    {
      id: 'WALI_KELAS' as AppTab,
      label: 'Monitoring Wali Kelas',
      subtitle: 'Status kelayakan 32 kelas',
      icon: UserCheck,
    },
    {
      id: 'REKAP_HARIAN' as AppTab,
      label: 'Rekapitulasi WA & PDF',
      subtitle: 'Laporan harian otomatis',
      icon: Share2,
    },
    {
      id: 'SURAT_IZIN' as AppTab,
      label: 'Pratinjau Surat Izin',
      subtitle: 'Generasi PDF resmi ortu',
      icon: FileText,
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900 text-slate-100 w-72 shrink-0 border-r border-slate-800 shadow-xl">
      {/* Top Header */}
      <div>
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
                Super Admin
              </span>
              <h2 className="text-sm font-extrabold text-white tracking-tight mt-0.5">
                Admin Control Center
              </h2>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-white">{currentUser.name}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Database Connected"></span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Progress Angket:</span>
            <span className="font-bold text-emerald-400">{registeredStudentsCount} / {totalStudentsCount} ({percentage}%)</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
            Menu Kontrol Admin
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate leading-snug">{item.label}</p>
                    <p className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[9px] font-black uppercase bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer & Switch Role */}
      <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
        {onOpenProfileSettings && (
          <button
            onClick={onOpenProfileSettings}
            className="w-full py-2.5 px-3 bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-blue-700/50 transition-colors"
          >
            <User className="w-4 h-4 text-blue-400" />
            <span>Profil & Password</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Pengaturan Parameter</span>
        </button>

        <button
          onClick={() => handleSelectTab('ANGKET')}
          className="w-full py-2 px-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-700/60 transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>Lihat Tampilan Siswa</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-red-800/50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Switch Role)</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Sticky */}
      <div className="hidden lg:block h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
