'use client';

import React from 'react';
import { Student, SchoolClass, AppSettings } from '@/types';
import schoolMetadata from '@/config/schoolMetadata.json';
import { Printer, CheckCircle2, XCircle, FileText, Search } from 'lucide-react';

interface StatusAngketA4ReportProps {
  selectedClassName: string;
  classes: SchoolClass[];
  students: Student[];
  settings?: AppSettings;
}

export const StatusAngketA4Report: React.FC<StatusAngketA4ReportProps> = ({
  selectedClassName,
  classes,
  students,
  settings,
}) => {
  const [searchFilter, setSearchFilter] = React.useState('');

  const targetClasses =
    selectedClassName === 'ALL'
      ? classes
      : classes.filter((c) => c.name === selectedClassName);

  const formattedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrintWindow = () => {
    if (typeof window === 'undefined') return;
    const printContent = document.getElementById('printable-status-angket')?.innerHTML;
    if (!printContent) return;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Laporan Rekap Status Angket - SMK PGRI 2 Ponorogo</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 5mm 6mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #000000;
              font-size: 9.5px;
              line-height: 1.25;
            }
            .a4-page-block {
              width: 100%;
              max-width: 210mm;
              height: 277mm;
              max-height: 277mm;
              margin: 0 auto 10px auto;
              padding: 6mm 8mm;
              background: #ffffff;
              page-break-after: always;
              break-after: page;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-sizing: border-box;
              overflow: hidden;
            }
            .a4-page-block:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }
            .no-print {
              display: none !important;
            }
            .doc-title {
              text-align: center;
              margin-bottom: 8px;
            }
            .doc-title h3 {
              margin: 0;
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doc-title p {
              margin: 2px 0 0 0;
              font-size: 9px;
              font-weight: 700;
              color: #475569;
            }
            .meta-box {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 6px;
              border: 1px solid #000000;
              background-color: #f8fafc;
              padding: 5px 10px;
              margin-bottom: 8px;
              border-radius: 4px;
            }
            .meta-item {
              display: flex;
              flex-direction: column;
            }
            .meta-label {
              font-size: 8.5px;
              text-transform: uppercase;
              font-weight: bold;
              color: #475569;
            }
            .meta-value {
              font-size: 11px;
              font-weight: 900;
              color: #0f172a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 6px;
            }
            th, td {
              border: 1px solid #000000;
              padding: 4px 6px !important;
              text-align: left;
              font-size: 9.5px !important;
              line-height: 1.35 !important;
            }
            th {
              background-color: #e2e8f0 !important;
              font-weight: 900;
              text-transform: uppercase;
              font-size: 9px !important;
              padding: 5px 6px !important;
            }
            .text-center {
              text-align: center;
            }
            .badge-check {
              color: #065f46;
              background-color: #d1fae5 !important;
              padding: 1px 6px;
              border-radius: 10px;
              font-weight: 900;
              font-size: 9px;
              display: inline-block;
            }
            .badge-cross {
              color: #991b1b;
              background-color: #ffe4e6 !important;
              padding: 1px 6px;
              border-radius: 10px;
              font-weight: 900;
              font-size: 9px;
              display: inline-block;
            }
            .footer-sig {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-top: 4px;
              border-top: 1px solid #cbd5e1;
              margin-top: auto;
              font-size: 9.5px;
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            setTimeout(() => {
              window.focus();
              window.print();
            }, 250);
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Control Action Toolbar */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Format Resmi Cetak A4 (1 Halaman per Kelas)</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Laporan Rekap Status Pengisian Angket
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedClassName === 'ALL'
              ? `Mencetak laporan seluruh kelas (${classes.length} kelas) — 1 Halaman A4 per kelas`
              : `Mencetak laporan resmi khusus kelas ${selectedClassName}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full lg:w-auto items-center">
          {/* Search Filter for screen view (Column 1) */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 sm:top-3 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter nama / NIS..."
              className="w-full h-11 sm:h-12 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Cetak Button (Column 2) */}
          <button
            type="button"
            onClick={handlePrintWindow}
            className="w-full h-11 sm:h-12 py-2.5 px-3 bg-[#00875a] hover:bg-emerald-700 text-white font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Cetak PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Area Wrapper */}
      <div id="printable-status-angket" className="space-y-8">
        {targetClasses.map((cls) => {
          let clsStudents = students.filter((s) => s.className === cls.name);

          if (searchFilter) {
            clsStudents = clsStudents.filter((s) =>
              s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
              s.nis.toLowerCase().includes(searchFilter.toLowerCase())
            );
          }

          const registeredCount = clsStudents.filter((s) => s.isRegistered).length;
          const unregisteredCount = clsStudents.length - registeredCount;

          return (
            <div
              key={cls.id}
              className="a4-page-block bg-white rounded-2xl border border-slate-300 p-6 shadow-lg text-slate-900 font-sans max-w-[210mm] min-h-[277mm] mx-auto box-border flex flex-col justify-between overflow-visible print:max-h-[277mm] print:overflow-hidden"
            >
              <div>
                {/* Judul Laporan Tanpa Kop */}
                <div className="doc-title text-center mb-2.5">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 underline decoration-slate-900 decoration-2 underline-offset-4">
                    LAPORAN REKAP STATUS PENGISIAN ANGKET PEMINATAN DARMAWISATA
                  </h3>
                  <p className="text-[10px] text-slate-600 font-bold mt-0.5">
                    Tahun Ajaran 2026/2027 • Tanggal Cetak: {formattedDate}
                  </p>
                </div>

                {/* Metadata Header Box: Nama Wali, Kelas, Rekap Status, Rekap Ukuran Kaos */}
                {(() => {
                  const sizeCounts: Record<string, number> = {};
                  clsStudents.forEach((s) => {
                    if (s.isRegistered && s.tShirtSize) {
                      sizeCounts[s.tShirtSize] = (sizeCounts[s.tShirtSize] || 0) + 1;
                    }
                  });
                  const sizeSummary = Object.entries(sizeCounts)
                    .map(([sz, count]) => `${sz}: ${count}`)
                    .join(' | ');

                  return (
                    <div className="meta-box bg-slate-50 border border-slate-300 rounded-lg p-2.5 mb-2.5 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-bold text-slate-900">
                      <div className="meta-item">
                        <span className="meta-label text-[9px] uppercase font-bold text-slate-500 block">
                          Nama Wali Kelas:
                        </span>
                        <span className="meta-value text-xs font-black text-slate-900">
                          {cls.homeroomTeacher || 'Belum diisi'}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label text-[9px] uppercase font-bold text-slate-500 block">
                          Kelas / Jurusan:
                        </span>
                        <span className="meta-value text-xs font-black text-slate-900">
                          {cls.name} ({cls.department})
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label text-[9px] uppercase font-bold text-slate-500 block">
                          Status Pengisian:
                        </span>
                        <span className="meta-value text-xs font-black text-emerald-700">
                          {registeredCount} Sudah / {unregisteredCount} Belum
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label text-[9px] uppercase font-bold text-slate-500 block">
                          Rekap Ukuran Kaos:
                        </span>
                        <span className="meta-value text-xs font-black text-purple-900 truncate" title={sizeSummary || '-'}>
                          {sizeSummary || 'Belum ada'}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Table: No. | Nama Siswa | NIS | Status | Pilihan Darmawisata | Ukuran Kaos | Riwayat Sakit */}
                <div className="overflow-x-auto my-2">
                  <table className="w-full text-left text-xs border-collapse border border-slate-400">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 font-black border-b border-slate-400">
                        <th className="p-1.5 border border-slate-400 text-center w-8 uppercase text-[9px]">
                          No.
                        </th>
                        <th className="p-1.5 border border-slate-400 uppercase text-[9px]">
                          Nama Siswa
                        </th>
                        <th className="p-1.5 border border-slate-400 text-center w-20 uppercase text-[9px]">
                          NIS
                        </th>
                        <th className="p-1.5 border border-slate-400 text-center w-20 uppercase text-[9px]">
                          Status
                        </th>
                        <th className="p-1.5 border border-slate-400 text-center w-24 uppercase text-[9px]">
                          Pilihan Darmawisata
                        </th>
                        <th className="p-1.5 border border-slate-400 text-center w-20 uppercase text-[9px]">
                          Ukuran Kaos
                        </th>
                        <th className="p-1.5 border border-slate-400 text-left w-28 uppercase text-[9px]">
                          Riwayat Sakit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {clsStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-slate-400 font-medium">
                            Belum ada data siswa terdaftar untuk kelas ini.
                          </td>
                        </tr>
                      ) : (
                        clsStudents.map((st, idx) => {
                          const destinationLabel = !st.isRegistered
                            ? '-'
                            : st.destination === 'BALI'
                            ? 'Bali'
                            : st.destination === 'YOGYAKARTA'
                            ? 'Jogja'
                            : '-';

                          const medicalHistoryText = !st.isRegistered
                            ? '-'
                            : st.medicalHistory && st.medicalHistory.trim()
                            ? st.medicalHistory.trim()
                            : '-';

                          return (
                            <tr key={st.id} className="border-b border-slate-300 hover:bg-slate-50">
                              <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-700 w-8 text-[9.5px]">
                                {idx + 1}
                              </td>
                              <td className="p-1.5 border border-slate-300 font-extrabold text-slate-900 text-[9.5px]">
                                {st.name}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-center font-mono font-bold text-slate-600 text-[9px] w-20">
                                {st.nis || '-'}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-center font-bold w-20">
                                {st.isRegistered ? (
                                  <span className="badge-check inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700 shrink-0 inline no-print" />
                                    <span>✓ Sudah</span>
                                  </span>
                                ) : (
                                  <span className="badge-cross inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                    <XCircle className="w-2.5 h-2.5 text-rose-700 shrink-0 inline no-print" />
                                    <span>✗ Belum</span>
                                  </span>
                                )}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-800 text-[9.5px] w-24">
                                {destinationLabel === 'Bali' ? (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-sky-100 text-sky-800 border border-sky-300 inline-block">
                                    Bali
                                  </span>
                                ) : destinationLabel === 'Jogja' ? (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300 inline-block">
                                    Jogja
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-normal">-</span>
                                )}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-center font-extrabold text-slate-800 text-[9.5px] w-20">
                                {st.isRegistered && st.tShirtSize ? (
                                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-purple-100 text-purple-900 border border-purple-300 inline-block">
                                    {st.tShirtSize} {st.tShirtDesign ? `(${st.tShirtDesign})` : ''}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-normal">-</span>
                                )}
                              </td>
                              <td className="p-1.5 border border-slate-300 text-left font-medium text-[9px] w-28">
                                {medicalHistoryText !== '-' ? (
                                  <span className="text-rose-800 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200 inline-block max-w-full truncate" title={medicalHistoryText}>
                                    {medicalHistoryText}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-normal text-center block">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Summary & Tanda Tangan */}
              <div className="footer-sig pt-2 border-t border-slate-300 text-[10px] text-slate-600 flex items-end justify-between mt-2">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">
                    Ringkasan Kelas: Total = {clsStudents.length} Siswa | Sudah Mengisi = {registeredCount} | Belum Mengisi = {unregisteredCount}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Dicetak resmi melalui Sistem Informasi Darmawisata SMK PGRI 2 Ponorogo
                  </p>
                </div>

                <div className="text-center font-bold text-slate-900 min-w-[150px]">
                  <p>Ponorogo, {formattedDate}</p>
                  <p className="mt-0.5 font-semibold text-slate-600">Wali Kelas,</p>
                  <div className="h-8"></div>
                  <p className="underline font-black text-slate-900">
                    {cls.homeroomTeacher || '( .................................... )'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
