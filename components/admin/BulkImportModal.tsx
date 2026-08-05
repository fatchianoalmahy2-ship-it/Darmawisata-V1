'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Student, GenderType, WaveType, TShirtSize, WaiverType, SchoolClass } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { normalizeClassName, sortClassesAlphabetically } from '@/lib/utils';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link2,
  Download,
  Copy,
  Layers,
  ArrowRight,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedStudents: Student[], importedClasses?: SchoolClass[]) => void;
  existingClasses: string[];
}

type ImportMode = 'GOOGLE_SHEETS' | 'EXCEL_FILE' | 'PASTE_TEXT';

interface ParsedClassData {
  className: string;
  homeroomTeacher: string;
  students: Student[];
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingClasses,
}) => {
  const [activeMode, setActiveMode] = useState<ImportMode>('GOOGLE_SHEETS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mode A: Google Sheets URL / ID
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');

  // Parsed Multi-Sheet Result
  const [parsedClassesData, setParsedClassesData] = useState<ParsedClassData[]>([]);

  // Mode B1: Flat CSV Column Mapping Fallback
  const [file, setFile] = useState<File | null>(null);
  const [isFlatTableMode, setIsFlatTableMode] = useState(false);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [colNis, setColNis] = useState('');
  const [colName, setColName] = useState('');
  const [colClass, setColClass] = useState('');
  const [colGender, setColGender] = useState('');
  const [colSize, setColSize] = useState('');
  const [colWave, setColWave] = useState('');

  // Mode B2: Paste Text
  const [pasteClassName, setPasteClassName] = useState('XII TKR 1');
  const [pasteTeacherName, setPasteTeacherName] = useState('');
  const [pasteRawText, setPasteRawText] = useState('');

  // Utility to check if a sheet should be ignored (non-class sheets like Rekap, Summary, etc.)
  const isIgnoredSheet = (name: string): boolean => {
    const s = name.trim().toUpperCase();
    const ignoredPatterns = [
      'WALI KELAS',
      'WALI',
      'DATA WALI',
      'DAFTAR WALI',
      'REKAP',
      'REKAPITULASI',
      'SUMMARY',
      'COVER',
      'PETUNJUK',
      'INFORMASI',
      'GURU',
      'DAFTAR GURU',
      'KETERANGAN',
      'INDEX',
      'LOG',
      'STATISTIK',
      'PANITIA',
    ];
    return ignoredPatterns.some((pattern) => s === pattern || s.includes(pattern));
  };

  // Utility to parse single SheetJS Worksheet according to rules:
  // Sheet Name = Class Name
  // Cell L2 (Row index 1, Col index 11) = Wali Kelas Name
  // Range B7:B45 (Row indices 6..44, Col index 1) = Student Names
  // Range C7:C45 (Row indices 6..44, Col index 2) = NISN
  const parseWorkbookSheet = (ws: XLSX.WorkSheet, sheetName: string): ParsedClassData => {
    const normalizedClassName = normalizeClassName(sheetName);
    const matrix = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });

    // 1. Extract Wali Kelas from cell L2 or header rows
    let rawTeacher = '';
    if (ws['L2'] && ws['L2'].v) {
      rawTeacher = String(ws['L2'].v).trim();
    } else if (ws['l2'] && ws['l2'].v) {
      rawTeacher = String(ws['l2'].v).trim();
    } else if (matrix[1] && matrix[1][11]) {
      rawTeacher = String(matrix[1][11]).trim();
    } else {
      // Look in first 6 rows for Wali Kelas pattern
      for (let i = 0; i < Math.min(matrix.length, 6); i++) {
        const rowStr = (matrix[i] || []).map((c) => String(c)).join(' ');
        const match = rowStr.match(/(?:wali\s*kelas|guru)\s*:\s*([A-Za-z\s\.\,]+)/i);
        if (match && match[1]) {
          rawTeacher = match[1].trim();
          break;
        }
      }
    }

    const homeroomTeacher = rawTeacher
      .replace(/^wali\s*kelas\s*:\s*/i, '')
      .replace(/^nama\s*wali\s*kelas\s*:\s*/i, '')
      .replace(/^guru\s*:\s*/i, '')
      .trim();

    const students: Student[] = [];

    // Helper to filter out header/footer/meta rows
    const isForbiddenName = (str: string): boolean => {
      if (!str || str.trim().length < 2) return true;
      const upper = str.toUpperCase().trim();

      const forbidden = [
        'NAMA SISWA',
        'DAFTAR SISWA',
        'WALI KELAS',
        'REKAP',
        'REKAPITULASI',
        'JURUSAN',
        'NO',
        'NIS',
        'NISN',
        'JENIS KELAMIN',
        'TOTAL',
        'TANDA TANGAN',
        'KETERANGAN',
        'PERIODE',
        'HEADER',
        'SMK PGRI',
        'SMK',
        'DAFTAR',
        'PEMINATAN',
        'ANGKET',
        'DARMAWISATA',
        'PILIHAN',
        'UKURAN KAOS',
        'UKURAN',
        'GELOMBANG',
        'TTD',
        'L/P',
        'L / P',
        'GENDER',
        'MENGETAHUI',
        'KEPALA SEKOLAH',
        'JUMLAH',
        'PEREMPUAN',
        'LAKI-LAKI',
        'CATATAN',
        'HARI/TANGGAL',
        'LEMBAR',
        'HALAMAN',
      ];

      if (
        forbidden.some(
          (f) =>
            upper === f ||
            upper.includes('NAMA SISWA') ||
            upper.includes('DAFTAR SISWA') ||
            upper.includes('WALI KELAS') ||
            upper.includes('SMK PGRI')
        )
      ) {
        return true;
      }

      // If string is purely numbers or standard row indices
      if (/^\d+$/.test(upper) || /^\d+[\.\)]?$/.test(upper) || upper.startsWith('KELAS')) {
        return true;
      }

      return false;
    };

    // STRATEGY 1: Standard Range B7 to B45 (Excel Row 7 to 45 = Row index 6 to 44)
    const maxRowIndex = Math.min(matrix.length - 1, 44);
    for (let r = 6; r <= maxRowIndex; r++) {
      const row = matrix[r];
      if (!row) continue;

      // Col B (Index 1) = Student Name
      const rawName = row[1] !== undefined && row[1] !== null ? String(row[1]).trim() : '';
      if (isForbiddenName(rawName)) continue;

      // Col C (Index 2) = NISN, Col A (Index 0) = NIS/No
      const rawNisn = row[2] !== undefined && row[2] !== null ? String(row[2]).trim() : '';
      const rawNis = row[0] !== undefined && row[0] !== null ? String(row[0]).trim() : '';

      let nis = '';
      if (rawNisn && !isForbiddenName(rawNisn) && (/^\d{4,12}$/.test(rawNisn) || rawNisn.length >= 4)) {
        nis = rawNisn;
      } else if (rawNis && !isForbiddenName(rawNis) && (/^\d{4,12}$/.test(rawNis) || /^NIS/i.test(rawNis))) {
        nis = rawNis;
      } else {
        const cleanClass = sheetName.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        const num = r - 5; // Standard row index is 6, so first student is 1
        nis = `${cleanClass}-${num.toString().padStart(3, '0')}`;
      }

      // Gender (Col D = Index 3 or Col E = Index 4)
      const rawGender = (row[3] || row[4] || '').toString().toUpperCase().trim();
      let gender: GenderType = 'LAKI-LAKI';
      if (rawGender.includes('P') || rawGender.includes('PEREMPUAN') || rawGender.includes('FEMALE')) {
        gender = 'PEREMPUAN';
      }

      // T-Shirt size
      const validSizes: TShirtSize[] = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
      let tShirtSize: TShirtSize | undefined = undefined;
      for (let c = 3; c <= 6; c++) {
        const val = (row[c] || '').toString().toUpperCase().trim();
        if (validSizes.includes(val as TShirtSize)) {
          tShirtSize = val as TShirtSize;
          break;
        }
      }

      students.push({
        id: `imp-${Date.now()}-${sheetName.replace(/\s+/g, '')}-${r}-${Math.random().toString(36).substr(2, 4)}`,
        nis,
        name: rawName,
        className: normalizedClassName,
        gender,
        tShirtSize,
        destination: undefined,
        wave: undefined,
        waiverType: 'NONE' as WaiverType,
        isRegistered: false, // Start as unregistered so they appear in angket incomplete list!
        updatedAt: new Date().toISOString(),
      });
    }

    // STRATEGY 2: Fallback scan if range B7:B45 was empty or non-standard format
    if (students.length === 0) {
      for (let r = 0; r < matrix.length; r++) {
        const row = matrix[r];
        if (!row || row.length === 0) continue;

        let rawName = '';
        let nameColIdx = -1;

        for (let c = 0; c < Math.min(row.length, 4); c++) {
          const val = row[c] !== undefined && row[c] !== null ? String(row[c]).trim() : '';
          if (!isForbiddenName(val) && val.length >= 3 && isNaN(Number(val)) && !/^\d+/.test(val)) {
            rawName = val;
            nameColIdx = c;
            break;
          }
        }

        if (!rawName || nameColIdx === -1) continue;

        let rawNis = '';
        for (let c = 0; c < row.length; c++) {
          if (c === nameColIdx) continue;
          const val = row[c] !== undefined && row[c] !== null ? String(row[c]).trim() : '';
          if (val && !isForbiddenName(val) && /^\d{4,12}$/.test(val)) {
            rawNis = val;
            break;
          }
        }
        if (!rawNis) {
          const cleanClass = normalizedClassName.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
          rawNis = `${cleanClass}-${(r + 1).toString().padStart(3, '0')}`;
        }

        let gender: GenderType = 'LAKI-LAKI';
        for (let c = 0; c < row.length; c++) {
          const val = (row[c] || '').toString().toUpperCase().trim();
          if (val === 'P' || val === 'PEREMPUAN') {
            gender = 'PEREMPUAN';
            break;
          }
        }

        students.push({
          id: `imp-${Date.now()}-${normalizedClassName.replace(/\s+/g, '')}-${r}-${Math.random().toString(36).substr(2, 4)}`,
          nis: rawNis,
          name: rawName,
          className: normalizedClassName,
          gender,
          tShirtSize: undefined,
          destination: undefined,
          wave: undefined,
          waiverType: 'NONE' as WaiverType,
          isRegistered: false,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return {
      className: normalizedClassName,
      homeroomTeacher,
      students,
    };
  };

  // Process XLSX Workbook Object
  const processXlsxWorkbook = (wb: XLSX.WorkBook) => {
    const results: ParsedClassData[] = [];

    wb.SheetNames.forEach((sheetName) => {
      // Ignore sheets like "Wali Kelas", "Rekap", etc.
      if (isIgnoredSheet(sheetName)) {
        return;
      }

      const ws = wb.Sheets[sheetName];
      const parsed = parseWorkbookSheet(ws, sheetName.trim());
      if (parsed.students.length > 0) {
        results.push(parsed);
      }
    });

    if (results.length > 0) {
      setParsedClassesData(results);
      setErrorMsg('');
      const totalSiswa = results.reduce((acc, c) => acc + c.students.length, 0);
      setSuccessMsg(`Berhasil membaca ${results.length} sheet kelas dengan total ${totalSiswa} siswa!`);
    } else {
      setErrorMsg(
        'Tidak ditemukan data siswa pada sheet kelas Excel ini. Pastikan format sheet sesuai standar.'
      );
    }
  };

  // OPSI A: Fetch Google Spreadsheet
  const handleFetchGoogleSheets = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setParsedClassesData([]);

    if (!googleSheetsUrl.trim()) {
      setErrorMsg('Masukkan URL atau ID Google Spreadsheet terlebih dahulu.');
      return;
    }

    // Extract Spreadsheet ID
    let spreadsheetId = googleSheetsUrl.trim();
    const match = spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      spreadsheetId = match[1];
    }

    setIsProcessing(true);

    try {
      // Export URL format for XLSX
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;

      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error(`Gagal mengunduh Google Spreadsheet (HTTP ${response.status}). Pastikan dokumen di-set 'Siapa saja yang memiliki link dapat melihat' (Public View).`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      processXlsxWorkbook(wb);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Gagal mengambil data dari Google Sheets. Pastikan akses spreadsheet sudah bersifat Publik (Anyone with the link can view).'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // OPSI B1: File Upload (.xlsx / .xls / .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setSuccessMsg('');
    setParsedClassesData([]);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const fileName = selectedFile.name.toLowerCase();

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          processXlsxWorkbook(wb);
        } catch (err: any) {
          setErrorMsg(`Gagal memproses file Excel: ${err?.message || 'Error format'}`);
        }
      };
      reader.readAsBinaryString(selectedFile);
    } else if (fileName.endsWith('.csv')) {
      // CSV File mapping fallback
      setIsFlatTableMode(true);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const rawRows = results.data as Record<string, any>[];
            const detectedHeaders = Object.keys(rawRows[0] || {});
            setHeaders(detectedHeaders);
            setParsedRows(rawRows);

            // Auto detect
            detectedHeaders.forEach((c) => {
              const lower = c.toLowerCase().trim();
              if (!colNis && (lower.includes('nis') || lower.includes('id'))) setColNis(c);
              if (!colName && (lower.includes('nama') || lower.includes('name'))) setColName(c);
              if (!colClass && (lower.includes('kelas') || lower.includes('class'))) setColClass(c);
            });
          }
        },
      });
    } else {
      setErrorMsg('Format file harus berupa Excel (.xlsx, .xls) atau CSV (.csv)');
    }
  };

  // OPSI B2: Process Paste Text Range B7:B45
  const handleProcessPasteText = () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!pasteRawText.trim()) {
      setErrorMsg('Masukkan teks salinan daftar nama siswa terlebih dahulu.');
      return;
    }

    const lines = pasteRawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const students: Student[] = [];

    lines.forEach((line, index) => {
      // Remove leading index numbers if pasted like "1. Ahmad", "01. Budi", "1 Budi"
      const cleanName = line.replace(/^[0-9]+[\.\)\s-]+\s*/, '').trim();

      if (
        cleanName &&
        !cleanName.toUpperCase().includes('NAMA SISWA') &&
        !cleanName.toUpperCase().includes('DAFTAR SISWA')
      ) {
        students.push({
          id: `imp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
          nis: `NIS-${pasteClassName.replace(/\s+/g, '')}-${index + 1}`,
          name: cleanName,
          className: pasteClassName.trim(),
          gender: 'LAKI-LAKI',
          tShirtSize: undefined,
          destination: undefined,
          wave: undefined,
          waiverType: 'NONE' as WaiverType,
          isRegistered: false,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    if (students.length === 0) {
      setErrorMsg('Tidak dapat menemukan baris nama siswa yang valid dari teks.');
      return;
    }

    const classData: ParsedClassData = {
      className: pasteClassName.trim(),
      homeroomTeacher: pasteTeacherName.trim(),
      students,
    };

    setParsedClassesData([classData]);
    setSuccessMsg(`Berhasil memproses ${students.length} nama siswa dari teks salinan!`);
  };

  // Confirm Import to Firebase
  const handleConfirmImport = () => {
    setIsProcessing(true);

    try {
      let allStudents: Student[] = [];
      let allSchoolClasses: SchoolClass[] = [];

      if (parsedClassesData.length > 0) {
        parsedClassesData.forEach((cd, idx) => {
          allStudents = [...allStudents, ...cd.students];

          allSchoolClasses.push({
            id: `cls-${Date.now()}-${idx}-${cd.className.replace(/\s+/g, '-').toLowerCase()}`,
            name: cd.className,
            department: cd.className.split(' ')[1] || 'UMUM',
            totalStudents: cd.students.length,
            homeroomTeacher: cd.homeroomTeacher || `Wali Kelas ${cd.className}`,
          });
        });
      } else if (isFlatTableMode && parsedRows.length > 0 && colNis && colName) {
        allStudents = parsedRows.map((row, index) => {
          const rawNis = String(row[colNis] || `NIS-${Date.now()}-${index}`).trim();
          const rawName = String(row[colName] || 'Siswa Import').trim();
          const rawClass =
            colClass && row[colClass] ? String(row[colClass]).trim() : existingClasses[0] || 'XII TKR 1';

          return {
            id: `imp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
            nis: rawNis,
            name: rawName,
            className: rawClass,
            gender: 'LAKI-LAKI',
            tShirtSize: undefined,
            destination: undefined,
            wave: undefined,
            waiverType: 'NONE' as WaiverType,
            isRegistered: false,
            updatedAt: new Date().toISOString(),
          };
        });
      }

      if (allStudents.length === 0) {
        setErrorMsg('Tidak ada data siswa yang valid untuk diimpor.');
        setIsProcessing(false);
        return;
      }

      onImportSuccess(allStudents, allSchoolClasses);
      setIsProcessing(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Terjadi kesalahan saat memproses data: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const totalSiswaParsed = parsedClassesData.reduce((acc, c) => acc + c.students.length, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Bulk Data Siswa (Google Sheets / Excel)"
      subtitle="Memasukkan data ratusan siswa & Wali Kelas (Cell L2 & Range B7:B45) secara otomatis"
      maxWidth="4xl"
    >
      <div className="space-y-4 text-xs">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-1 bg-slate-50 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveMode('GOOGLE_SHEETS');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'GOOGLE_SHEETS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Link2 className="w-4 h-4 shrink-0" />
            <span>Opsi A: Google Sheets Link</span>
            <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0">
              PRIORITAS
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('EXCEL_FILE');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'EXCEL_FILE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Opsi B: Unggah File Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('PASTE_TEXT');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'PASTE_TEXT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Copy className="w-4 h-4 shrink-0" />
            <span>Opsi B2: Paste Salin Kolom B7:B45</span>
          </button>
        </div>

        {/* MODE A: GOOGLE SHEETS */}
        {activeMode === 'GOOGLE_SHEETS' && (
          <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Tarik Data Langsung dari Google Spreadsheet
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Sistem akan otomatis membaca setiap <strong>Nama Sheet = Nama Kelas</strong>, membaca{' '}
                  <strong>Cell L2 = Nama Wali Kelas</strong>, dan mengekstrak daftar nama siswa pada{' '}
                  <strong>Cell B7 sampai B45</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-800">
                Link atau ID Google Spreadsheet:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={googleSheetsUrl}
                  onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit#gid=0"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
                <button
                  type="button"
                  disabled={isProcessing || !googleSheetsUrl.trim()}
                  onClick={handleFetchGoogleSheets}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold rounded-xl text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm"
                >
                  {isProcessing ? (
                    <span>Sedang Mengambil...</span>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Tarik Data Sheets
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 bg-white/80 border border-emerald-200 rounded-xl text-[11px] text-slate-700 space-y-1">
              <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" /> Ketentuan Google Sheets:
              </div>
              <ul className="list-disc pl-4 space-y-0.5 font-medium text-slate-600">
                <li>
                  Pastikan spreadsheet diatur ke <strong>&quot;Siapa saja yang memiliki link dapat melihat&quot;</strong> (Public Access).
                </li>
                <li>
                  <strong>Sheet Name</strong> = Nama Kelas (contoh: <code>XII TKR 1</code>, <code>XII TAB 2</code>).
                </li>
                <li>
                  <strong>Cell L2</strong> = Nama Wali Kelas.
                </li>
                <li>
                  <strong>Cell B7 s/d B45</strong> = Daftar Nama Siswa | <strong>Cell C7 s/d C45</strong> = NISN Siswa.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* MODE B: EXCEL FILE UPLOAD */}
        {activeMode === 'EXCEL_FILE' && (
          <div className="space-y-3">
            <div className="p-6 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl text-center space-y-2 hover:bg-emerald-50 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {file ? file.name : 'Klik atau seret berkas Excel (.xlsx / .xls) Multi-Sheet di sini'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Setiap sheet otomatis dibaca sebagai kelas. Membaca Cell L2 (Wali Kelas) & Cell B7:B45 (Nama Siswa).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MODE B2: PASTE TEXT */}
        {activeMode === 'PASTE_TEXT' && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kelas:</label>
                <input
                  type="text"
                  value={pasteClassName}
                  onChange={(e) => setPasteClassName(e.target.value)}
                  placeholder="Contoh: XII TKR 1"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Wali Kelas (Cell L2):
                </label>
                <input
                  type="text"
                  value={pasteTeacherName}
                  onChange={(e) => setPasteTeacherName(e.target.value)}
                  placeholder="Contoh: Drs. Bambang Sugianto, M.Pd"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tempel (Paste) Salinan Nama Siswa dari Cell B7 s/d B45:
              </label>
              <textarea
                rows={6}
                value={pasteRawText}
                onChange={(e) => setPasteRawText(e.target.value)}
                placeholder="Ahmad Fauzi&#10;Budi Santoso&#10;Citra Lestari&#10;..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-900"
              />
            </div>

            <button
              type="button"
              onClick={handleProcessPasteText}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" /> Diproses Teks
            </button>
          </div>
        )}

        {/* FEEDBACK MESSAGES */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* PARSED MULTI-SHEET DATA PREVIEW */}
        {parsedClassesData.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" /> Hasil Pratinjau ({parsedClassesData.length} Sheet Kelas Ditemukan)
              </h4>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Total: {totalSiswaParsed} Siswa
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {parsedClassesData.map((cd, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 font-extrabold text-xs">
                      📁 Kelas: <span className="text-emerald-700 font-black">{cd.className}</span>
                    </span>
                    <span className="text-[11px] text-slate-600 bg-white border px-2 py-0.5 rounded-md">
                      👨‍🏫 Wali Kelas (L2):{' '}
                      <strong>{cd.homeroomTeacher || '(Belum diisi)'}</strong>
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    Siswa terdeteksi ({cd.students.length}):{' '}
                    <span className="font-semibold text-slate-800">
                      {cd.students
                        .slice(0, 4)
                        .map((s) => s.name)
                        .join(', ')}
                      {cd.students.length > 4 ? '...' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={
              (parsedClassesData.length === 0 && (!isFlatTableMode || !colNis || !colName)) ||
              isProcessing
            }
            onClick={handleConfirmImport}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            {isProcessing ? (
              <span>Mengimpor ke Firebase...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Import {totalSiswaParsed || parsedRows.length} Siswa ke Firebase
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
