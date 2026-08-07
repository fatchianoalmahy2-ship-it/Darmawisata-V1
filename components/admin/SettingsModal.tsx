'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { SchoolLogo } from '@/components/ui/SchoolLogo';
import { AppSettings } from '@/types';
import schoolMetadata from '@/config/schoolMetadata.json';
import { SupabaseSqlModal } from '@/components/admin/SupabaseSqlModal';
import {
  Settings,
  Save,
  RotateCcw,
  AlertTriangle,
  Calendar,
  Compass,
  Clock,
  MessageSquare,
  Sparkles,
  Bot,
  Tag,
  Copy,
  Upload,
  Image as ImageIcon,
  Trash2,
  Database,
  Terminal,
  FileCode,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [prevSettings, setPrevSettings] = useState(settings);
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [activeMainTab, setActiveMainTab] = useState<'PARAM_ALOKASI' | 'BATAS_ANGKET' | 'GELOMBANG_DESTINASI' | 'WA_TEMPLATE' | 'BRANDING_SURAT'>('PARAM_ALOKASI');
  const [activeTemplateTab, setActiveTemplateTab] = useState<'PANITIA' | 'WALI_KELAS'>('PANITIA');
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setFormData({ ...settings });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file logo terlalu besar. Maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          appLogoUrl: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHeaderLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file logo header terlalu besar. Maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          headerLogoUrl: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTshirtDesignAUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file desain A terlalu besar. Maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          tshirtDesignAUrl: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTshirtDesignBUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file desain B terlalu besar. Maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          tshirtDesignBUrl: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetTemplate = () => {
    const defaultMeta = schoolMetadata.defaultSettings;
    if (activeTemplateTab === 'PANITIA') {
      setFormData((prev) => ({
        ...prev,
        templateUnregisteredSummary: defaultMeta.templateUnregisteredSummary,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        templateClassReminder: defaultMeta.templateClassReminder,
      }));
    }
  };

  const insertTag = (tag: string) => {
    if (activeTemplateTab === 'PANITIA') {
      setFormData((prev) => ({
        ...prev,
        templateUnregisteredSummary: (prev.templateUnregisteredSummary || '') + ` ${tag} `,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        templateClassReminder: (prev.templateClassReminder || '') + ` ${tag} `,
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Sistem & Master Parameter"
      subtitle="Kelola kapasitas, batas angket, serta format rekap & otomatisasi WhatsApp 16:00 WIB"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Navigation Sub-Tabs Bar (Smartphone Mobile Dropdown & Desktop Tab Bar) */}
        <div className="block sm:hidden bg-slate-100 p-2 rounded-2xl border border-slate-200">
          <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
            Pilih Sub Menu Pengaturan:
          </label>
          <select
            value={activeMainTab}
            onChange={(e) => setActiveMainTab(e.target.value as any)}
            className="w-full px-3 py-2 bg-white text-slate-900 font-extrabold text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="PARAM_ALOKASI">⚙️ Kapasitas & Rules Alokasi</option>
            <option value="BATAS_ANGKET">📅 Batas Angket & Status</option>
            <option value="GELOMBANG_DESTINASI">🧭 Gelombang & Tour</option>
            <option value="WA_TEMPLATE">🤖 WA & Template Rekap</option>
            <option value="BRANDING_SURAT">🖼️ Branding & Kop Surat</option>
          </select>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveMainTab('PARAM_ALOKASI')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'PARAM_ALOKASI'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Kapasitas & Alokasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('BATAS_ANGKET')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'BATAS_ANGKET'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Batas Angket</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('GELOMBANG_DESTINASI')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'GELOMBANG_DESTINASI'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Gelombang & Tour</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('WA_TEMPLATE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'WA_TEMPLATE'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>WA & Template</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('BRANDING_SURAT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'BRANDING_SURAT'
                ? 'bg-emerald-600 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Branding & Kop Surat</span>
          </button>
        </div>
        {/* TAB 1: Kapasitas & Rules Alokasi */}
        {activeMainTab === 'PARAM_ALOKASI' && (
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-600" /> Parameter Kapasitas & Rules Alokasi Otomatis
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                Dinamis & Otomatis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kapasitas Kursi Bus
                </label>
                <input
                  type="number"
                  min={30}
                  max={60}
                  required
                  value={formData.defaultBusCapacity}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultBusCapacity: parseInt(e.target.value) || 50 })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Standar: 50 Kursi per Armada</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kapasitas Isi Kamar Hotel
                </label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  required
                  value={formData.defaultRoomCapacity}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultRoomCapacity: parseInt(e.target.value) || 3 })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Standar: 3 atau 4 Bed per Kamar</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Syarat Wali Kelas (%)
                </label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  required
                  value={formData.waliKelasParticipationThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waliKelasParticipationThreshold: parseInt(e.target.value) || 75,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Standar: 75% Siswa Terdaftar</span>
              </div>
            </div>

            {/* Dynamic Allocation Criteria Editor Box */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                  ✏️ <span className="underline decoration-emerald-500 decoration-2">Editor Kriteria & Aturan Algoritma Alokasi (Dapat Disesuaikan):</span>
                </p>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                  Editable Rules
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span>🚌 Kriteria & Aturan Alokasi Bus:</span>
                  </label>
                  <textarea
                    rows={4}
                    value={
                      formData.busAllocationRules !== undefined
                        ? formData.busAllocationRules
                        : '1. Pengelompokan Bus berdasarkan Gelombang pilihan & Rombongan Kelas (sekelas diusahakan 1 bus).\n2. Kursi #1 & #2 otomatis dialokasikan untuk Guru Pendamping/Tour Guide.'
                    }
                    onChange={(e) => setFormData({ ...formData, busAllocationRules: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                    placeholder="Tuliskan aturan alokasi bus..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <span>🏨 Kriteria & Aturan Alokasi Kamar:</span>
                  </label>
                  <textarea
                    rows={4}
                    value={
                      formData.roomAllocationRules !== undefined
                        ? formData.roomAllocationRules
                        : '1. Pemisahan Kamar wajib berdasarkan Gender (Laki-laki/Perempuan) & Rombel Kelas per Gelombang.\n2. Alokasi kamar dapat disesuaikan ulang secara manual bila ada permintaan khusus.'
                    }
                    onChange={(e) => setFormData({ ...formData, roomAllocationRules: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                    placeholder="Tuliskan aturan alokasi kamar..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Batas Angket */}
        {activeMainTab === 'BATAS_ANGKET' && (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" /> Pengaturan Batas Waktu & Penutupan Angket
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Batas Akhir Pengisian Angket *
                </label>
                <input
                  type="date"
                  required
                  value={formData.angketDeadline || '2026-08-15'}
                  onChange={(e) => setFormData({ ...formData, angketDeadline: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                />
                <span className="text-[10px] text-slate-500">
                  Pengisian angket akan otomatis ditutup setelah tanggal ini.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Pengisian Angket Saat Ini
                </label>
                <select
                  value={formData.isAngketClosed ? 'CLOSED' : 'OPEN'}
                  onChange={(e) =>
                    setFormData({ ...formData, isAngketClosed: e.target.value === 'CLOSED' })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs cursor-pointer"
                >
                  <option value="OPEN">🟢 Buka (Mengikuti Tanggal Batas Akhir)</option>
                  <option value="CLOSED">🔴 Tutup Sekarang (Gelombang Langsung Tampil)</option>
                </select>
                <span className="text-[10px] text-slate-500">
                  Saat ditutup, Gelombang keberangkatan peserta akan langsung ditampilkan.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tombol &quot;Cari dari Daftar&quot;
                </label>
                <select
                  value={formData.showAngketSearchButton === true ? 'SHOW' : 'HIDE'}
                  onChange={(e) =>
                    setFormData({ ...formData, showAngketSearchButton: e.target.value === 'SHOW' })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-xs cursor-pointer"
                >
                  <option value="SHOW">👁️ Tampilkan Tombol Cari</option>
                  <option value="HIDE">🙈 Sembunyikan Tombol Cari</option>
                </select>
                <span className="text-[10px] text-slate-500">
                  Sembunyikan/tampilkan tombol pencarian daftar nama siswa di Angket Peminatan.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Gelombang & Destinasi */}
        {activeMainTab === 'GELOMBANG_DESTINASI' && (
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-600" /> Pengaturan Gelombang Tour, Kota, & Tanggal Pemberangkatan
            </h4>

            <div className="space-y-4">
              {/* Bali Config */}
              <div className="p-3 bg-white border border-amber-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    🌴 DESTINASI: BALI
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Harga Investasi Bali (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.baliPrice || 1600000}
                      onChange={(e) =>
                        setFormData({ ...formData, baliPrice: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Tanggal Gelombang I
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.baliGel1Dates || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, baliGel1Dates: e.target.value })
                      }
                      placeholder="Contoh: 07 – 11 November 2025"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Tanggal Gelombang II
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.baliGel2Dates || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, baliGel2Dates: e.target.value })
                      }
                      placeholder="Contoh: 14 – 18 November 2025"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Yogyakarta Config */}
              <div className="p-3 bg-white border border-amber-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    🏛️ DESTINASI: YOGYAKARTA
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Harga Investasi Yogyakarta (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.yogyaPrice || 850000}
                      onChange={(e) =>
                        setFormData({ ...formData, yogyaPrice: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Tanggal Gelombang I
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.yogyaGel1Dates || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, yogyaGel1Dates: e.target.value })
                      }
                      placeholder="Contoh: 15 – 16 November 2025"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WA & Template Editor */}
        {activeMainTab === 'WA_TEMPLATE' && (
          <div className="p-4 bg-slate-900 text-white border border-slate-800 rounded-2xl space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" /> Otomatisasi & Editor Template Rekap WhatsApp
              </h4>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                Solusi B: WA Gateway & Dispatcher
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Toggle Enable */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <label className="block text-[11px] font-extrabold text-slate-300 mb-1">
                  Status Auto-Send Rekap
                </label>
                <select
                  value={formData.autoRecapEnabled !== false ? 'ENABLED' : 'DISABLED'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      autoRecapEnabled: e.target.value === 'ENABLED',
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-950 text-emerald-400 font-extrabold text-xs rounded-lg border border-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="ENABLED">🟢 AKTIF (Tiap Hari 16:00 WIB)</option>
                  <option value="DISABLED">🔴 NON-AKTIF (Hanya Manual)</option>
                </select>
              </div>

              {/* Jam Otomatis */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <label className="block text-[11px] font-extrabold text-slate-300 mb-1">
                  Jam Pengiriman Otomatis
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.autoRecapTime || '16:00'}
                    onChange={(e) => setFormData({ ...formData, autoRecapTime: e.target.value })}
                    placeholder="16:00"
                    className="w-full pl-8 pr-2 py-1.5 bg-slate-950 text-white font-mono font-bold text-xs rounded-lg border border-slate-700"
                  />
                </div>
              </div>

              {/* Nama Grup Target */}
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <label className="block text-[11px] font-extrabold text-slate-300 mb-1">
                  Nama / No. Target WA Panitia
                </label>
                <input
                  type="text"
                  value={formData.autoRecapTargetGroup || 'Grup Panitia Darmawisata'}
                  onChange={(e) => setFormData({ ...formData, autoRecapTargetGroup: e.target.value })}
                  placeholder="Nama Grup Panitia / 08123xxx"
                  className="w-full px-2.5 py-1.5 bg-slate-950 text-white font-bold text-xs rounded-lg border border-slate-700"
                />
              </div>
            </div>

            {/* TEMPLATE EDITOR SECTION */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTemplateTab('PANITIA')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTemplateTab === 'PANITIA'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    📢 Template Rekap Sekolah (Panitia)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTemplateTab('WALI_KELAS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTemplateTab === 'WALI_KELAS'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🏫 Template Reminder (Wali Kelas)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  title="Reset template ke format bawaan"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Ke Default
                </button>
              </div>

              {/* Helper Tag Buttons */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-400" /> Klik Tag Variabel di bawah ini untuk menyisipkan data otomatis:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeTemplateTab === 'PANITIA' ? (
                    <>
                      {['{SEKOLAH}', '{TANGGAL}', '{TOTAL_SISWA}', '{SUDAH_MENGISI}', '{BELUM_MENGISI}', '{PERSENTASE}', '{RINCIAN_PER_KELAS}'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => insertTag(t)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[10px] rounded-md border border-slate-700 transition-colors cursor-pointer"
                        >
                          + {t}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['{SEKOLAH}', '{KELAS}', '{WALI_KELAS}', '{TANGGAL}', '{TOTAL_SISWA}', '{SUDAH_MENGISI}', '{BELUM_MENGISI}', '{PERSENTASE}', '{DAFTAR_NAMA_BELUM}'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => insertTag(t)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[10px] rounded-md border border-slate-700 transition-colors cursor-pointer"
                        >
                          + {t}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Textarea Template Editor */}
              <div>
                <textarea
                  rows={8}
                  value={
                    activeTemplateTab === 'PANITIA'
                      ? formData.templateUnregisteredSummary || ''
                      : formData.templateClassReminder || ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeTemplateTab === 'PANITIA') {
                      setFormData({ ...formData, templateUnregisteredSummary: val });
                    } else {
                      setFormData({ ...formData, templateClassReminder: val });
                    }
                  }}
                  className="w-full p-3 bg-slate-950 text-emerald-300 font-mono text-xs rounded-xl border border-slate-700 focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-inner"
                  placeholder="Ketik atau edit format teks rekap WhatsApp..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Branding, Logo, & Redaksi Surat */}
        {activeMainTab === 'BRANDING_SURAT' && (
          <div className="space-y-4">
            {/* App Branding & Logo Section */}
            <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-sky-600" /> Management Nama & Logo Resmi Sekolah / Aplikasi
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Aplikasi / SIM
              </label>
              <input
                type="text"
                value={formData.appName || 'SIM DARMAWISATA'}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                placeholder="Contoh: SIM DARMAWISATA"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-500">Tampil pada header & brand navbar.</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Logo Resmi Sekolah / SIM (Unggah atau Link URL)
              </label>

              <div className="flex items-center gap-3">
                {/* Live Preview Box */}
                <div className="w-14 h-14 bg-white border border-slate-300 rounded-xl flex items-center justify-center p-1 shrink-0 shadow-xs relative overflow-hidden group">
                  {formData.appLogoUrl ? (
                    <img
                      src={formData.appLogoUrl}
                      alt="Preview Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <SchoolLogo className="w-full h-full object-contain" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah File Logo</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.appLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, appLogoUrl: '' })}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                        title="Hapus Logo & Gunakan Logo Default"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={formData.appLogoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, appLogoUrl: e.target.value })}
                    placeholder="Atau tempel URL / data:image..."
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700 truncate"
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Format: PNG, JPG, WebP, SVG (Maks. 3 MB). Jika dikosongkan, logo default sekolah akan aktif.
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Logo Header Kop Surat Section */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-amber-600" /> Logo Khusus Header Kop Surat (Sebelah Kiri)
          </h4>
          <p className="text-[11px] text-slate-600">
            Unggah file gambar untuk ditempatkan pada posisi <strong>Sebelah Kiri Kop Surat Resmi</strong> (Surat Izin & Surat JTM). File gambar ini tersimpan otomatis di Firebase Firestore.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Live Preview Box */}
            <div className="w-16 h-16 bg-white border border-slate-300 rounded-xl flex items-center justify-center p-1.5 shrink-0 shadow-xs relative overflow-hidden group">
              {formData.headerLogoUrl || formData.appLogoUrl ? (
                <img
                  src={formData.headerLogoUrl || formData.appLogoUrl}
                  alt="Preview Logo Header"
                  className="w-full h-full object-contain"
                />
              ) : (
                <SchoolLogo className="w-full h-full object-contain" />
              )}
            </div>

            <div className="flex-1 space-y-2 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Gambar Header (Kop Surat)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    onChange={handleHeaderLogoFileUpload}
                    className="hidden"
                  />
                </label>

                {formData.headerLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, headerLogoUrl: '' })}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                    title="Hapus Logo Header & Gunakan Fallback"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset / Hapus Logo Header</span>
                  </button>
                )}
              </div>

              <input
                type="text"
                value={formData.headerLogoUrl || ''}
                onChange={(e) => setFormData({ ...formData, headerLogoUrl: e.target.value })}
                placeholder="Atau tempel URL gambar / data:image..."
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700 truncate"
              />
              <span className="text-[10px] text-slate-500 block">
                Gunakan file gambar PNG/JPG transparan (Maks. 3 MB) agar tampilan Kop Surat presisi dan tajam.
              </span>
            </div>
          </div>
        </div>

        {/* T-Shirt Designs Customization Section */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Kustomisasi Desain Kaos Darmawisata
          </h4>

          {/* Section Title Customization */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Seksi Kaos (di Angket)
            </label>
            <input
              type="text"
              value={formData.tshirtSectionTitle || ''}
              onChange={(e) => setFormData({ ...formData, tshirtSectionTitle: e.target.value })}
              placeholder="Pilihan Desain Kaos Darmawisata Sterida 2026-2027"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Design A */}
            <div className="space-y-2 p-3 bg-white border border-slate-100 rounded-xl">
              <label className="block text-xs font-bold text-slate-800">
                Desain Kaos Opsi A
              </label>
              
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-1 shrink-0 relative overflow-hidden">
                  {formData.tshirtDesignAUrl ? (
                    <img
                      src={formData.tshirtDesignAUrl}
                      alt="Preview Desain A"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center justify-center text-[9px] font-bold text-center">
                      <ImageIcon className="w-5 h-5 text-slate-300 mb-0.5" />
                      <span>Default A</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Gambar A</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleTshirtDesignAUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.tshirtDesignAUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tshirtDesignAUrl: '' })}
                        className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.tshirtDesignAUrl || ''}
                    onChange={(e) => setFormData({ ...formData, tshirtDesignAUrl: e.target.value })}
                    placeholder="Atau tempel URL gambar..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-700 truncate"
                  />
                </div>
              </div>

              {/* Text Fields Design A */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-50">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Judul Opsi A</label>
                  <input
                    type="text"
                    value={formData.tshirtDesignATitle || ''}
                    onChange={(e) => setFormData({ ...formData, tshirtDesignATitle: e.target.value })}
                    placeholder="Desain Minimalis Modern"
                    className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Deskripsi Opsi A</label>
                  <input
                    type="text"
                    value={formData.tshirtDesignADesc || ''}
                    onChange={(e) => setFormData({ ...formData, tshirtDesignADesc: e.target.value })}
                    placeholder="Garis seni estetik siluet candi & kelapa khas Bali-Jogja"
                    className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Design B */}
            <div className="space-y-2 p-3 bg-white border border-slate-100 rounded-xl">
              <label className="block text-xs font-bold text-slate-800">
                Desain Kaos Opsi B
              </label>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-1 shrink-0 relative overflow-hidden">
                  {formData.tshirtDesignBUrl ? (
                    <img
                      src={formData.tshirtDesignBUrl}
                      alt="Preview Desain B"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center justify-center text-[9px] font-bold text-center">
                      <ImageIcon className="w-5 h-5 text-slate-300 mb-0.5" />
                      <span>Default B</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Gambar B</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleTshirtDesignBUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.tshirtDesignBUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tshirtDesignBUrl: '' })}
                        className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.tshirtDesignBUrl || ''}
                    onChange={(e) => setFormData({ ...formData, tshirtDesignBUrl: e.target.value })}
                    placeholder="Atau tempel URL gambar..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-700 truncate"
                  />
                </div>
              </div>

              {/* Text Fields Design B */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-50">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Judul Opsi B</label>
                  <input
                    type="text"
                    value={formData.tshirtDesignBTitle || ''}
                    onChange={(e) => setFormData({ ...formData, tshirtDesignBTitle: e.target.value })}
                    placeholder="Desain Retro Adventure"
                    className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Deskripsi Opsi B</label>
                  <input
                    type="text"
                    value={formData.tshirtDesignBDesc || ''}
                    onChange={(e) => setFormData({ ...formData, tshirtDesignBDesc: e.target.value })}
                    placeholder="Palet warna matahari terbenam dengan ilustrasi gunung & ombak"
                    className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block">
            Kustomisasi gambar, judul, dan deskripsi kaos darmawisata yang dapat dipilih oleh peserta didik pada lembar angket.
          </span>
        </div>

        {/* Tour Packages Customization Section */}
        <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-sky-600" /> Kustomisasi Informasi Paket Wisata (Tour)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tour Bali */}
            <div className="space-y-2 p-3 bg-white border border-slate-100 rounded-xl">
              <label className="block text-xs font-bold text-slate-800">
                Paket Tour Bali
              </label>
              
              <div className="space-y-1.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Label Badge</label>
                  <input
                    type="text"
                    value={formData.baliBadge || ''}
                    onChange={(e) => setFormData({ ...formData, baliBadge: e.target.value })}
                    placeholder="TOUR BALI (5 HARI)"
                    className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Judul Paket Tour</label>
                  <input
                    type="text"
                    value={formData.baliTitle || ''}
                    onChange={(e) => setFormData({ ...formData, baliTitle: e.target.value })}
                    placeholder="Pulau Dewata Bali & Sunset Jimbaran"
                    className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Deskripsi / Kegiatan</label>
                  <textarea
                    rows={3}
                    value={formData.baliDesc || ''}
                    onChange={(e) => setFormData({ ...formData, baliDesc: e.target.value })}
                    placeholder="Kunjungan objek GWK Cultural Park, Pantai Melasti, Pantai Pandawa, Bedugul, Kuta Beach, Joger, Tari Barong, & Sunset Dinner."
                    className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Tour Yogyakarta */}
            <div className="space-y-2 p-3 bg-white border border-slate-100 rounded-xl">
              <label className="block text-xs font-bold text-slate-800">
                Paket Tour Yogyakarta
              </label>

              <div className="space-y-1.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Label Badge</label>
                  <input
                    type="text"
                    value={formData.yogyaBadge || ''}
                    onChange={(e) => setFormData({ ...formData, yogyaBadge: e.target.value })}
                    placeholder="TOUR YOGYAKARTA (2 HARI)"
                    className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Judul Paket Tour</label>
                  <input
                    type="text"
                    value={formData.yogyaTitle || ''}
                    onChange={(e) => setFormData({ ...formData, yogyaTitle: e.target.value })}
                    placeholder="Kota Istimewa & Petualangan Merapi"
                    className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Deskripsi / Kegiatan</label>
                  <textarea
                    rows={3}
                    value={formData.yogyaDesc || ''}
                    onChange={(e) => setFormData({ ...formData, yogyaDesc: e.target.value })}
                    placeholder="Wisata Cave Tubing Gua Pindul, Pantai Sepanjang Gunungkidul, Lava Tour Merapi Jeep, Malioboro, & Pusat Oleh-oleh Jogja."
                    className="w-full px-2 py-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block">
            Kustomisasi label badge, judul, dan penjelasan/rincian kunjungan untuk masing-masing paket wisata pada angket pemilihan.
          </span>
        </div>

        {/* Surat Izin Redaksi Text Section */}
        <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-indigo-600" /> Redaksi & Kalimat Surat Izin Orang Tua
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kalimat Penjelas Penyelenggara (Paragraf Tengah)
              </label>
              <textarea
                rows={2}
                value={
                  formData.suratIzinOpeningText ||
                  `Yang diselenggarakan oleh ${formData.schoolName || 'SMK PGRI 2 PONOROGO'}, bekerja sama dengan ${formData.travelAgency || 'Biro Fiesta Tour and Travel Kabupaten Ponorogo'}.`
                }
                onChange={(e) => setFormData({ ...formData, suratIzinOpeningText: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kalimat Penutup Surat Izin
              </label>
              <textarea
                rows={2}
                value={
                  formData.suratIzinClosingText ||
                  'Demikian surat izin ini saya buat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya.'
                }
                onChange={(e) => setFormData({ ...formData, suratIzinClosingText: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* School Info Section */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Informasi Instansi & Biro Travel
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Sekolah / Instansi
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.headmasterName}
                onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mitra Biro Travel
              </label>
              <input
                type="text"
                value={formData.travelAgency}
                onChange={(e) => setFormData({ ...formData, travelAgency: e.target.value })}
                className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Supabase SQL Schema Generator Section */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                Script SQL Schema Supabase
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Master Schema
                </span>
              </h5>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Generate skema DDL & RLS Supabase untuk siswa, kelas, setting & rundown dengan index cepat.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSqlModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
          >
            <FileCode className="w-4 h-4" />
            <span>Buat SQL Supabase</span>
          </button>
        </div>

        {/* Danger Zone: Reset Data */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h5 className="font-bold text-xs text-rose-900">Kosongkan/Reset Data Supabase</h5>
              <p className="text-[11px] text-rose-700">
                Mengosongkan cache lokal dan menyegarkan koneksi langsung dari database Supabase.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Yakin ingin mengosongkan cache dan menyegarkan ulang dari Supabase?')) {
                onResetData();
                onClose();
              }
            }}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Data
          </button>
        </div>
      </div>
    )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" /> Simpan Pengaturan
          </button>
        </div>
      </form>

      {/* Supabase SQL Generator Modal */}
      <SupabaseSqlModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />
    </Modal>
  );
};
