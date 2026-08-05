'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { SchoolClass, Student, AppSettings } from '@/types';
import { RecapGeneratorService } from '@/services/recapGenerator';
import {
  Send,
  Copy,
  CheckCircle2,
  Settings,
  Sparkles,
  MessageSquare,
  Clock,
  ExternalLink,
  Users,
  Building2,
  Zap,
} from 'lucide-react';

interface AutoRecapDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: SchoolClass[];
  students: Student[];
  settings?: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onOpenSettings?: () => void;
}

export const AutoRecapDispatchModal: React.FC<AutoRecapDispatchModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  settings,
  onSaveSettings,
  onOpenSettings,
}) => {
  const [dispatchTarget, setDispatchTarget] = useState<'ALL' | string>('ALL'); // 'ALL' or className
  const [copied, setCopied] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen) return null;

  const targetClassObj =
    dispatchTarget !== 'ALL'
      ? classes.find((c) => c.name === dispatchTarget) || classes[0]
      : null;

  const targetStudents =
    dispatchTarget === 'ALL'
      ? students
      : students.filter((s) => s.className === dispatchTarget);

  const generatedText =
    dispatchTarget === 'ALL'
      ? RecapGeneratorService.generateWhatsAppAllUnregisteredSummary(classes, students, settings)
      : targetClassObj
      ? RecapGeneratorService.generateWhatsAppUnregisteredReminder(targetClassObj, targetStudents, settings)
      : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encodedText = encodeURIComponent(generatedText);
    const targetPhone = settings?.autoRecapTargetPhone?.trim();

    let waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    if (targetPhone) {
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    }

    window.open(waUrl, '_blank');

    // Update dispatch status
    const nowStr = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    if (settings) {
      onSaveSettings({
        ...settings,
        lastAutoRecapSentAt: nowStr,
        lastAutoRecapSentStatus: 'SEWAKTU_MANUAL',
      });
    }

    setIsDispatched(true);
    setTimeout(() => setIsDispatched(false), 3000);
  };

  const handleSimulateAutoDispatch = () => {
    const nowStr = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    if (settings) {
      onSaveSettings({
        ...settings,
        lastAutoRecapSentAt: nowStr,
        lastAutoRecapSentStatus: 'BERHASIL',
      });
    }

    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 1800);
  };

  const totalUnregistered = students.filter((s) => !s.isRegistered).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ Center Dispatch & Automation Rekap WhatsApp"
      subtitle="Kirim rekap harian siswa belum mengisi angket sewaktu-waktu atau atur jadwal otomatis Pukul 16.00 WIB"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Banner Status Jadwal Otomatis */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-emerald-950 text-sm flex items-center gap-1.5">
                <span>Jadwal Auto-Send: {settings?.autoRecapTime || '16:00'} WIB</span>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-black">
                  {settings?.autoRecapEnabled !== false ? '🟢 AKTIF' : '🔴 NON-AKTIF'}
                </span>
              </p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Target: <strong>{settings?.autoRecapTargetGroup || 'Grup Panitia Darmawisata'}</strong> • Status:{' '}
                {settings?.lastAutoRecapSentAt
                  ? `Terakhir dikirim pada ${settings.lastAutoRecapSentAt}`
                  : 'Belum pernah dikirim'}
              </p>
            </div>
          </div>

          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-700" />
              <span>Edit Format & Jadwal</span>
            </button>
          )}
        </div>

        {/* Selection Target Dispatch */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            Pilih Target Penerima Rekap WA:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setDispatchTarget('ALL')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                dispatchTarget === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <Building2 className={`w-5 h-5 shrink-0 ${dispatchTarget === 'ALL' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <p className="font-extrabold text-xs">Grup Panitia Utama (Seluruh Sekolah)</p>
                <p className={`text-[10px] mt-0.5 ${dispatchTarget === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Laporan rekap rincian {classes.length} kelas ({totalUnregistered} siswa belum)
                </p>
              </div>
            </button>

            <div className="flex flex-col justify-center">
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={dispatchTarget === 'ALL' ? '' : dispatchTarget}
                  onChange={(e) => setDispatchTarget(e.target.value || 'ALL')}
                  className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">🏫 Pilih Grup Wali Kelas / Per Kelas...</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      Kelas {c.name} ({c.homeroomTeacher || 'Wali Kelas'})
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 pl-1">
                Kirim pesan khusus reminder untuk siswa di kelas terpilih.
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic WhatsApp Live Preview Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Preview Format Pesan WhatsApp:
            </label>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto border border-slate-800 shadow-inner">
            {generatedText}
          </div>
        </div>

        {/* Dispatched Toast Alert */}
        {isDispatched && (
          <div className="p-3 bg-emerald-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Rekapitulasi WhatsApp berhasil diproses & log waktu pengiriman diperbarui!</span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSimulateAutoDispatch}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-slate-200 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              title="Simulasi Trigger Gateway Pukul 16:00"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulasi Gateway 16:00</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Kirim via WhatsApp (Sekarang)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
