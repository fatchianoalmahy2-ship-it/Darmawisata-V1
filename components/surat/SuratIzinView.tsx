'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Student, AppSettings, AuthUser } from '@/types';
import schoolMetadata from '@/config/schoolMetadata.json';
import { DocumentGeneratorService } from '@/services/documentGenerator';
import { FileText, Printer, Download, ExternalLink, Layers, User, ZoomIn, ZoomOut, Maximize2, AlertCircle, CheckCircle2, Upload, ImageIcon, Search } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { NisLookupModal } from '../angket/NisLookupModal';

interface SuratIzinViewProps {
  students: Student[];
  initialStudent?: Student | null;
  settings?: AppSettings;
  onSaveSettings?: (newSettings: AppSettings) => void;
  currentUser?: AuthUser;
}

export const SuratIzinView: React.FC<SuratIzinViewProps> = ({
  students,
  initialStudent,
  settings,
  onSaveSettings,
  currentUser,
}) => {
  const docContainerRef = useRef<HTMLDivElement>(null);
  const [printScope, setPrintScope] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [selectedClassBatch, setSelectedClassBatch] = useState<string>('ALL');

  const handleHeaderLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file logo header terlalu besar. Maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && settings && onSaveSettings) {
        onSaveSettings({
          ...settings,
          headerLogoUrl: event.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Role checks
  const isPublic = !currentUser || currentUser.role === 'PUBLIC_SISWA';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isWaliKelas = currentUser?.role === 'WALI_KELAS';

  const [isNisModalOpen, setIsNisModalOpen] = useState(false);

  // Default preview scale set to 50% as requested by user
  const [zoomScale, setZoomScale] = useState<number>(50);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (initialStudent?.id) return initialStudent.id;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected_print_student_id');
      if (saved && students.some((st) => st.id === saved)) {
        return saved;
      }
    }
    return students[0]?.id || '';
  });

  const [activeDocTab, setActiveDocTab] = useState<'IZIN' | 'TIDAK_MAMPU'>('IZIN');

  // Always synchronize & reset to Surat Izin when initialStudent is provided (e.g. navigating from Angket)
  useEffect(() => {
    if (initialStudent?.id) {
      setSelectedStudentId(initialStudent.id);
      setActiveDocTab('IZIN');
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected_print_student_id', initialStudent.id);
        localStorage.setItem('selected_print_doc_tab', 'IZIN');
      }
    }
  }, [initialStudent?.id]);

  // Smooth scroll directly to the top of document preview when opening or changing selection
  useEffect(() => {
    const timer = setTimeout(() => {
      if (docContainerRef.current) {
        docContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [initialStudent?.id, selectedStudentId, activeDocTab]);

  const [isInIframe, setIsInIframe] = useState(false);

  // Detect iframe environment asynchronously
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFrame = window.self !== window.top;
      setTimeout(() => {
        setIsInIframe(isFrame);
      }, 0);
    }
  }, []);

  // Filter selectable students based on role
  const selectableStudents = useMemo(() => {
    if (isWaliKelas && currentUser?.assignedClassName) {
      const filtered = students.filter((s) => s.className === currentUser.assignedClassName);
      return filtered.length > 0 ? filtered : students;
    }
    return students;
  }, [students, isWaliKelas, currentUser?.assignedClassName]);

  const classList = Array.from(
    new Set(selectableStudents.map((s) => s.className))
  ).sort();

  // Persist student change
  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_print_student_id', id);
    }
  };

  // Persist tab change
  const handleTabChange = (tab: 'IZIN' | 'TIDAK_MAMPU') => {
    setActiveDocTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_print_doc_tab', tab);
    }
  };

  // Resolve active student: merge initialStudent if it matches selected ID to guarantee latest form entries
  const rawStudent =
    selectableStudents.find((s) => s.id === selectedStudentId) ||
    students.find((s) => s.id === selectedStudentId);

  const student =
    initialStudent && initialStudent.id === selectedStudentId
      ? { ...rawStudent, ...initialStudent }
      : rawStudent || initialStudent || students[0];

  // Target list for batch rendering (Batch locked for public users)
  const effectivePrintScope = isPublic ? 'SINGLE' : printScope;

  const targetBatchStudents =
    effectivePrintScope === 'SINGLE'
      ? student
        ? [student]
        : []
      : selectedClassBatch === 'ALL'
      ? selectableStudents
      : selectableStudents.filter((s) => s.className === selectedClassBatch);

  // Fast Instant Printable Window (Renders clean DOM preview without image processing overhead)
  const handlePrintWindow = () => {
    if (typeof window !== 'undefined') {
      const printContent = document.getElementById('printable-surat-content')?.innerHTML;
      if (!printContent) return;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="id">
            <head>
              <meta charset="utf-8" />
              <title>Surat Resmi - ${settings?.schoolName || schoolMetadata.school.name}</title>
              <style>
                @page {
                  size: A4 portrait;
                  margin: 6mm 22mm 10mm 22mm;
                }
                * {
                  box-sizing: border-box;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body {
                  margin: 0;
                  padding: 0;
                  background: #ffffff;
                  color: #000000;
                  font-family: 'Times New Roman', Times, Serif, Georgia, serif;
                }
                .printable-area {
                  width: 210mm;
                  margin: 0 auto;
                  box-sizing: border-box;
                  font-size: 13px;
                  line-height: 1.6;
                  color: #000000;
                  background-color: #ffffff;
                }
                .document-page {
                  page-break-after: always;
                  break-after: page;
                  padding: 4mm 20mm 10mm 20mm;
                  min-height: 275mm;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                }
                .document-page:last-child {
                  page-break-after: avoid;
                  break-after: avoid;
                }
                .signature-block {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
                .space-y-6 > * + * { margin-top: 1.5rem; }
                .space-y-4 > * + * { margin-top: 1rem; }
                .space-y-3.5 > * + * { margin-top: 0.875rem; }
                .space-y-3 > * + * { margin-top: 0.75rem; }
                .space-y-2 > * + * { margin-top: 0.5rem; }
                .space-y-1.5 > * + * { margin-top: 0.375rem; }
                .space-y-1 > * + * { margin-top: 0.25rem; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-left { text-align: left; }
                .font-bold { font-weight: bold; }
                .font-semibold { font-weight: 600; }
                .font-black { font-weight: 900; }
                .uppercase { text-transform: uppercase; }
                .underline { text-decoration: underline; }
                .pl-6 { padding-left: 1.5rem; }
                .pl-4 { padding-left: 1rem; }
                .pt-2 { padding-top: 0.5rem; }
                .pt-3 { padding-top: 0.75rem; }
                .pt-4 { padding-top: 1rem; }
                .pt-8 { padding-top: 2rem; }
                .pt-10 { padding-top: 2.5rem; }
                .pb-4 { padding-bottom: 1rem; }
                .pb-3 { padding-bottom: 0.75rem; }
                .grid { display: grid; }
                .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
                .col-span-4 { grid-column: span 4 / span 4; }
                .col-span-5 { grid-column: span 5 / span 5; }
                .col-span-7 { grid-column: span 7 / span 7; }
                .col-span-8 { grid-column: span 8 / span 8; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-between { justify-content: space-between; }
                .justify-end { justify-content: flex-end; }
                .gap-1 { gap: 0.25rem; }
                .gap-2 { gap: 0.5rem; }
                .gap-3 { gap: 0.75rem; }
                .gap-4 { gap: 1rem; }
                .border-b { border-bottom: 1px solid #000000; }
                .border-b-2 { border-bottom: 2px solid #000000; }
                .border-b-4 { border-bottom: 4px solid #000000; }
                .border-double { border-style: double; }
                .border { border: 1px solid #000000; }
                .rounded { border-radius: 4px; }
                .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
                .py-0.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
                .text-xs { font-size: 12px; }
                .text-sm { font-size: 13px; }
                .text-base { font-size: 15px; }
                .text-xl { font-size: 20px; }
                .text-2xl { font-size: 24px; }
                .text-red-600 { color: #dc2626 !important; }
                .font-serif { font-family: 'Times New Roman', Times, serif; }
                .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
                .list-decimal { list-style-type: decimal; }
                .list-inside { list-style-position: inside; }
                .shrink-0 { flex-shrink: 0; }
                .h-20 { height: 5rem; }
                
                @media print {
                  body { margin: 0; padding: 0; background: #ffffff; }
                  .printable-area { width: 100% !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              <div class="printable-area">
                ${printContent}
              </div>
              <script>
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }, 100);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    }
  };

  // Instant HTML download fallback
  const handleDownloadHTML = () => {
    const printContent = document.getElementById('printable-surat-content')?.innerHTML;
    if (!printContent) return;

    const fullDoc = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Surat_${activeDocTab}_${student?.className || 'Siswa'}.html</title>
  <style>
    @page { size: A4 portrait; margin: 6mm 22mm 10mm 22mm; }
    body { font-family: 'Times New Roman', Times, serif; margin: 20px; color: #000; }
    .document-page { page-break-after: always; break-after: page; max-width: 210mm; margin: 0 auto 30px auto; padding: 6mm 20mm 10mm 20mm; border: 1px solid #ccc; background: #fff; }
    .signature-block { page-break-inside: avoid; break-inside: avoid; }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .uppercase { text-transform: uppercase; }
    .underline { text-decoration: underline; }
    .text-red-600 { color: #dc2626 !important; }
    .border-b-4 { border-bottom: 4px double #000; }
    .grid { display: grid; }
    .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
    .col-span-4 { grid-column: span 4 / span 4; }
    .col-span-5 { grid-column: span 5 / span 5; }
    .col-span-7 { grid-column: span 7 / span 7; }
    .col-span-8 { grid-column: span 8 / span 8; }
    .flex { display: flex; }
    .justify-end { justify-content: flex-end; }
  </style>
</head>
<body>
  ${printContent}
</body>
</html>`;

    const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Surat_${activeDocTab}_${
      printScope === 'SINGLE' ? student?.name.replace(/\s+/g, '_') : selectedClassBatch
    }.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenStandalone = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  // Helper to check if a student needs JTM document (Only if choosing BALI)
  const isBaliDestination = (dest?: string) => {
    if (!dest) return true; // Default fallback Bali
    return dest.toUpperCase().includes('BALI');
  };

  return (
    <div ref={docContainerRef} className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Control Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-1">
              <FileText className="w-3.5 h-3.5 text-amber-600" /> Generator Surat Resmi Sekolah
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Cetak Surat Izin Orang Tua & Surat Jalur Tidak Mampu (JTM)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dokumen resmi KOP Surat Resmi {settings?.schoolName || 'SMK PGRI 2 PONOROGO'}.
            </p>
          </div>

          {/* Single vs Batch Selector Toggle & Logo Upload (Admin / Wali Kelas only) */}
          {!isPublic && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onSaveSettings && (
                <label className="cursor-pointer px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-2xs shrink-0">
                  <Upload className="w-3.5 h-3.5 text-amber-700" />
                  <span>Upload Logo Header</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    onChange={handleHeaderLogoUpload}
                    className="hidden"
                  />
                </label>
              )}

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPrintScope('SINGLE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    effectivePrintScope === 'SINGLE'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Cetak 1 Siswa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintScope('BATCH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    effectivePrintScope === 'BATCH'
                      ? 'bg-sky-600 text-white shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cetak Massal (Batch)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Selector Panel */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
          {isPublic ? (
            /* Protected Public View: Show specific selected student details + NIS Search trigger */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full bg-slate-900 text-white p-3.5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Surat Izin Untuk Siswa:
                  </div>
                  <div className="text-sm font-extrabold tracking-tight">
                    {student?.name || 'Belum Memilih Siswa'} ({student?.className || '-'})
                  </div>
                  <div className="text-[11px] text-slate-300">
                    NIS: {student?.nis || '-'} | Destinasi: {student?.destination || 'Bali'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNisModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari NIS / Ganti Siswa</span>
              </button>
            </div>
          ) : effectivePrintScope === 'SINGLE' ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Pilih Siswa ({selectableStudents.length} Siswa):
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full sm:w-80 md:w-96 px-3.5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
              >
                {selectableStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.className}) - NIS: {st.nis} - Tujuan: {st.destination || 'Bali'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Filter Kelas (Batch Cetak):
              </label>
              <select
                value={selectedClassBatch}
                onChange={(e) => setSelectedClassBatch(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 bg-sky-900 text-white font-bold text-xs rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="ALL">Semua Kelas ({selectableStudents.length} Siswa)</option>
                {classList.map((cls) => {
                  const count = selectableStudents.filter((s) => s.className === cls).length;
                  return (
                    <option key={cls} value={cls}>
                      Kelas {cls} ({count} Siswa)
                    </option>
                  );
                })}
              </select>
              <span className="text-xs font-medium text-slate-500">
                Mencetak <strong>{targetBatchStudents.length} surat</strong> sekaligus.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Document Tab Switcher & Zoom Slider Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => handleTabChange('IZIN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDocTab === 'IZIN'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Surat Izin Orang Tua
          </button>

          <button
            onClick={() => handleTabChange('TIDAK_MAMPU')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDocTab === 'TIDAK_MAMPU'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Surat Pernyataan Jalur Tidak Mampu (JTM)
          </button>
        </div>

        {/* Zoom Controls with Default 50% */}
        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.max(30, prev - 10))}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Perkecil Preview"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-slate-700 w-10 text-center select-none">
            {zoomScale}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale((prev) => Math.min(150, prev + 10))}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Perbesar Preview"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomScale(50)}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors ml-0.5 text-[10px] font-bold"
            title="Reset Skala Default 50%"
          >
            50%
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isInIframe && (
            <button
              type="button"
              onClick={handleOpenStandalone}
              className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tab Baru</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadHTML}
            className="h-9 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Unduh HTML</span>
          </button>

          <button
            type="button"
            onClick={handlePrintWindow}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>
              {printScope === 'BATCH'
                ? `Cetak Batch (${targetBatchStudents.length})`
                : 'Cetak Dokumen (A4)'}
            </span>
          </button>
        </div>
      </div>

      {/* JTM Yogyakarta Information Notice if selected student chooses Yogyakarta */}
      {activeDocTab === 'TIDAK_MAMPU' && printScope === 'SINGLE' && !isBaliDestination(student?.destination) && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-sky-900 no-print shadow-xs">
          <AlertCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-sky-950">
              Siswa Memilih Yogyakarta – Tidak Perlu Cetak Surat Pernyataan JTM
            </h4>
            <p className="leading-relaxed">
              Siswa <strong>{student?.name}</strong> memilih destinasi <strong>{student?.destination || 'Yogyakarta'}</strong>. Surat Pernyataan Jalur Tidak Mampu (JTM) <strong>hanya wajib dicetak untuk siswa yang memilih destinasi BALI</strong> untuk menyatakan kesanggupan membayar dan melunasi biaya study tour ke Bali dengan biaya penuh 100%.
            </p>
          </div>
        </div>
      )}

      {/* Scalable Paper Container Wrapper */}
      <div className="w-full overflow-x-auto bg-slate-200/80 p-4 sm:p-8 rounded-2xl border border-slate-300 min-h-[500px] flex justify-center">
        <div
          style={{
            transform: `scale(${zoomScale / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-in-out',
          }}
          className="shrink-0"
        >
          <div
            id="printable-surat-content"
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl pt-[6mm] px-[20mm] pb-[10mm] border border-slate-300 font-serif leading-relaxed text-[13px] box-border space-y-8"
          >
            {targetBatchStudents.map((st, sIndex) => {
              const izinData = DocumentGeneratorService.getSuratIzinData(st, settings);
              const tidakMampuData = DocumentGeneratorService.getSuratTidakMampuData(st, settings);
              const studentIsBali = isBaliDestination(st.destination);

              return (
                <div key={st.id || sIndex} className="document-page space-y-5">
                  {/* Kop Surat Header (Precisely matching official image) */}
                  <div className="border-b-4 border-double border-slate-900 pb-2">
                    <div className="flex items-center gap-4">
                      {/* Left: Official Header Logo Image or SVG Fallback */}
                      <div className="w-28 h-28 shrink-0 flex items-center justify-center">
                        {settings?.headerLogoUrl || settings?.appLogoUrl ? (
                          <img
                            src={settings.headerLogoUrl || settings.appLogoUrl}
                            alt="Logo Kop Surat"
                            className="w-28 h-28 object-contain"
                          />
                        ) : (
                          <SchoolLogo className="w-28 h-28 object-contain" />
                        )}
                      </div>

                      {/* Center: School Metadata Headers */}
                      <div className="flex-1 text-center space-y-0.5 font-serif">
                        <h4 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-tight text-slate-900 leading-tight">
                          PERWAKILAN YAYASAN PEMBINA LEMBAGA PENDIDIKAN
                        </h4>
                        <h4 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-tight text-slate-900 leading-tight">
                          PERSATUAN GURU REPUBLIK INDONESIA (YPLP-PGRI)
                        </h4>
                        <h4 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-tight text-slate-900 leading-tight">
                          KABUPATEN PONOROGO - JAWA TIMUR
                        </h4>
                        
                        {/* School Name in Bright Red */}
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-red-600 uppercase my-0.5 leading-none">
                          SMK PGRI 2 PONOROGO
                        </h1>
                        
                        <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider leading-tight">
                          TERAKREDITASI A
                        </p>
                        <p className="text-[10px] text-slate-900 leading-tight">
                          Alamat : Jl. Soekarno - Hatta, Kertosari, Babadan, Ponorogo. Telp. 0352-461821/Fax. 0352-462659
                        </p>
                        <p className="text-[10px] text-slate-900 leading-tight">
                          Website: smkpgri2ponorogo.com &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; E-mail: smkpgri2ponorogo@yahoo.com
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Content 1: SURAT IZIN ORANG TUA */}
                  {activeDocTab === 'IZIN' && izinData && (
                    <div className="space-y-5 pt-2">
                      {/* Document Title */}
                      <div className="text-center pb-1">
                        <h3 className="text-base font-black tracking-wider uppercase underline">
                          SURAT IZIN ORANG TUA
                        </h3>
                      </div>

                      {/* Statement Content */}
                      <div className="space-y-3.5 text-xs text-slate-900 font-serif leading-relaxed">
                        <p>Yang bertanda tangan dibawah ini :</p>
                        <div className="pl-6 space-y-1.5 font-medium">
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold">Nama Orang Tua / Wali</span>
                            <span className="col-span-8">: {izinData.parentName}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold">Alamat</span>
                            <span className="col-span-8">: {izinData.parentAddress}</span>
                          </div>
                        </div>

                        <p className="pt-2">Dengan ini memberikan izin kepada :</p>
                        <div className="pl-6 space-y-1.5 font-medium">
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold">Nama Peserta Didik</span>
                            <span className="col-span-8">: <strong>{izinData.studentName}</strong></span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold">NIS (Nomor Induk Siswa)</span>
                            <span className="col-span-8">: <strong>{izinData.nis}</strong></span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold">Kelas</span>
                            <span className="col-span-8">: <strong>{izinData.className}</strong></span>
                          </div>
                          <div className="grid grid-cols-12 gap-1">
                            <span className="col-span-4 font-semibold">Mengikuti Darmawisata ke</span>
                            <span className="col-span-8">: <strong>{izinData.destination}</strong></span>
                          </div>
                        </div>

                        {/* Dynamic Wave List without checkboxes */}
                        <div className="pl-6 pt-2 space-y-1.5">
                          <p className="font-semibold">yang akan dilaksanakan pada :</p>
                          <ol className="list-decimal list-inside pl-4 space-y-1 font-serif text-xs font-medium text-slate-900">
                            {izinData.wavesList.map((w, idx) => (
                              <li key={idx}>
                                <span>{w.name} : <strong>( {w.dates} )</strong></span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <p className="pt-3">
                          {settings?.suratIzinOpeningText || `Yang diselenggarakan oleh ${settings?.schoolName || schoolMetadata.school.name}, bekerja sama dengan ${settings?.travelAgency || schoolMetadata.school.travelAgency}.`}
                        </p>
                        <p>
                          {settings?.suratIzinClosingText || 'Demikian surat izin ini saya buat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya.'}
                        </p>
                      </div>

                      {/* Signature Area */}
                      <div className="signature-block pt-10 flex justify-end text-xs font-serif">
                        <div className="text-center w-64 space-y-1">
                          <p>Ponorogo, {settings?.baliGel1Dates ? settings.baliGel1Dates.split(' ').slice(-2).join(' ') : 'November 2025'}</p>
                          <p className="font-bold">Orang Tua / Wali</p>
                          <div className="h-20"></div>
                          <p className="font-bold underline">
                            ( {izinData.parentName !== '_____________________________________________' ? izinData.parentName : '................................................'} )
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Content 2: SURAT PERNYATAAN JALUR TIDAK MAMPU (JTM) */}
                  {activeDocTab === 'TIDAK_MAMPU' && (
                    <>
                      {!studentIsBali ? (
                        <div className="py-12 px-6 text-center space-y-3 bg-slate-50 border border-slate-200 rounded-2xl font-sans">
                          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                          <h3 className="text-base font-bold text-slate-900">
                            Bebas Kewajiban Cetak Surat Pernyataan JTM
                          </h3>
                          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                            Siswa <strong>{st.name}</strong> memilih destinasi <strong>{st.destination || 'Yogyakarta'}</strong>. Surat Pernyataan Jalur Tidak Mampu (JTM) hanya berlaku dan wajib dicetak bagi siswa yang memilih destinasi <strong>BALI</strong>.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-5 pt-2">
                          {/* Document Title */}
                          <div className="text-center pb-1">
                            <h3 className="text-base font-black tracking-widest uppercase underline">
                              SURAT PERNYATAAN JALUR TIDAK MAMPU (JTM)
                            </h3>
                          </div>

                          {/* Content */}
                          <div className="space-y-3.5 text-xs font-serif leading-relaxed text-slate-900">
                            <p className="font-bold">Yang bertanda tangan dibawah ini saya :</p>
                            <div className="pl-4 space-y-1.5">
                              <div className="grid grid-cols-12 gap-1">
                                <span className="col-span-5 font-medium">1. Nama (Orang tua/Wali)</span>
                                <span className="col-span-7">: {tidakMampuData.parentName}</span>
                              </div>
                              <div className="grid grid-cols-12 gap-1">
                                <span className="col-span-5 font-medium">2. Alamat Lengkap</span>
                                <span className="col-span-7">: {tidakMampuData.parentAddress}</span>
                              </div>
                            </div>

                            <p className="font-bold pt-2">Adalah Orang Tua / Wali Murid dari :</p>
                            <div className="pl-4 space-y-1.5">
                              <div className="grid grid-cols-12 gap-1">
                                <span className="col-span-5 font-medium">1. Nama (Siswa / Siswi)</span>
                                <span className="col-span-7">: <strong>{tidakMampuData.studentName}</strong></span>
                              </div>
                              <div className="grid grid-cols-12 gap-1">
                                <span className="col-span-5 font-medium">2. NIS</span>
                                <span className="col-span-7">: <strong>{tidakMampuData.nis}</strong></span>
                              </div>
                              <div className="grid grid-cols-12 gap-1">
                                <span className="col-span-5 font-medium">3. Kelas</span>
                                <span className="col-span-7">: <strong>{tidakMampuData.className}</strong></span>
                              </div>
                              <div className="grid grid-cols-12 gap-1">
                                <span className="col-span-5 font-medium">4. Kategori / Jalur</span>
                                <span className="col-span-7">: <strong>Jalur Tidak Mampu (JTM)</strong></span>
                              </div>
                            </div>

                            <p className="font-bold pt-3 uppercase">
                              Dengan ini MENYATAKAN DENGAN SESUNGGUHNYA bahwa :
                            </p>

                            <ol className="list-decimal list-inside space-y-2 pl-2 font-medium">
                              <li>
                                Saya mengetahui, memahami dan menyetujui anak saya untuk ikut <strong>STUDY TOUR KE BALI</strong>.
                              </li>
                              <li>
                                Saya sanggup membayar dan melunasi biaya study tour ke Bali dengan biaya penuh 100%, sebagaimana ketentuan dari sekolah terkait biaya kegiatan study tour.
                              </li>
                              <li>
                                Apabila saya tidak melaksanakan ketentuan poin 2 di atas, maka saya siap menerima sanksi sesuai dengan ketentuan sekolah.
                              </li>
                            </ol>

                            <p className="pt-2">
                              Demikian Surat Pernyataan ini saya buat dengan sebenarnya dan tanpa ada tekanan atau paksaan dari pihak manapun.
                            </p>
                          </div>

                          {/* Signature Area */}
                          <div className="signature-block pt-10 flex justify-end text-xs font-serif">
                            <div className="text-center w-64 space-y-1">
                              <p>Ponorogo, . . . . . . . . . . . . . . . .</p>
                              <p className="font-bold leading-normal">Yang membuat Pernyataan,<br />Orang Tua / Wali Murid</p>
                              <div className="h-20"></div>
                              <p className="font-bold underline">
                                ( {tidakMampuData.parentName !== '_____________________________________________' ? tidakMampuData.parentName : '................................................'} )
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <NisLookupModal
        isOpen={isNisModalOpen}
        onClose={() => setIsNisModalOpen(false)}
        students={selectableStudents}
        onSelectStudent={(selected) => handleStudentChange(selected.id)}
      />
    </div>
  );
};
