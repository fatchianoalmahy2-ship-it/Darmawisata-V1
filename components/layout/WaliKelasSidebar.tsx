'use client';

import React from 'react';
import { AppTab } from '@/components/ui/Header';
import { AuthUser } from '@/types';
import {
  UserCheck,
  Share2,
  Bus,
  BedDouble,
  Compass,
  LogOut,
  School,
  Lock,
  ChevronRight,
  Sparkles,
  User,
} from 'lucide-react';

interface WaliKelasSidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currentUser: AuthUser;
  onLogout: () => void;
  onOpenProfileSettings?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const WaliKelasSidebar: React.FC<WaliKelasSidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenProfileSettings,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const assignedClass = currentUser.assignedClassName || 'XII TKR 1';

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    {
      id: 'WALI_KELAS' as AppTab,
      label: `Portal ${assignedClass}`,
      subtitle: 'Monitoring kelayakan & angket',
      icon: UserCheck,
      badge: 'Kelas Saya',
    },
    {
      id: 'DENAH_BUS' as AppTab,
      label: 'Denah Bus Kelas',
      subtitle: 'Nomor bus & posisi duduk',
      icon: Bus,
    },
    {
      id: 'PEMBAGIAN_KAMAR' as AppTab,
      label: 'Kamar Hotel Kelas',
      subtitle: 'Nomor kamar & teman kamar',
      icon: BedDouble,
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900 text-slate-100 w-72 shrink-0 border-r border-slate-800 shadow-xl">
      <div>
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                Wali Kelas
              </span>
              <h2 className="text-sm font-extrabold text-white tracking-tight mt-0.5">
                Portal {assignedClass}
              </h2>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-white">{currentUser.name}</span>
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold">
            SMK PGRI 2 Ponorogo
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 space-y-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
            Menu Wali Kelas
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
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate leading-snug">{item.label}</p>
                    <p className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[9px] font-extrabold uppercase bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
        {onOpenProfileSettings && (
          <button
            onClick={onOpenProfileSettings}
            className="w-full py-2.5 px-3 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-emerald-700/50 transition-colors"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Profil & Password</span>
          </button>
        )}

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
