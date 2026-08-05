'use client';

import React, { useState, useMemo } from 'react';
import { Student, DestinationType, WaveType, TShirtSize, WaiverType, AppSettings } from '@/types';
import schoolMetadata from '@/config/schoolMetadata.json';
import tshirtDesignA from '@/src/assets/images/tshirt_design_a_1785842351713.jpg';
import tshirtDesignB from '@/src/assets/images/tshirt_design_b_1785842364932.jpg';
import { NisLookupModal } from './NisLookupModal';
import { SchoolLogo } from '@/components/ui/SchoolLogo';
import {
  Search,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Shirt,
  Sparkles,
  Lock,
  Calendar,
  Compass,
  Bus,
  BedDouble,
  Info,
} from 'lucide-react';

interface AngketFormProps {
  students: Student[];
  settings?: AppSettings;
  onSaveStudent: (updatedStudent: Student) => void;
  onNavigateToSurat: (student: Student) => void;
}

export const AngketForm: React.FC<AngketFormProps> = ({
  students,
  settings,
  onSaveStudent,
  onNavigateToSurat,
}) => {
  const [inputNis, setInputNis] = useState('');
  const [seg1, setSeg1] = useState('');
  const [seg2, setSeg2] = useState('');
  const [seg3, setSeg3] = useState('');
  const [inputMode, setInputMode] = useState<'segmented' | 'manual'>('segmented');

  const seg1Ref = React.useRef<HTMLInputElement>(null);
  const seg2Ref = React.useRef<HTMLInputElement>(null);
  const seg3Ref = React.useRef<HTMLInputElement>(null);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [logoError, setLogoError] = useState(false);

  React.useEffect(() => {
    setLogoError(false);
  }, [settings?.appLogoUrl, settings?.headerLogoUrl]);

  // Form State
  const [destination, setDestination] = useState<DestinationType>('BALI');
  const [wave, setWave] = useState<WaveType>('BALI_GEL_1');
  const [tShirtSize, setTShirtSize] = useState<TShirtSize>('L');
  const [tShirtDesign, setTShirtDesign] = useState<'A' | 'B'>('A');
  const [parentName, setParentName] = useState('');
  const [parentAddress, setParentAddress] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [waiverType, setWaiverType] = useState<WaiverType>('NONE');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if Angket is Closed
  const isAngketClosed = useMemo(() => {
    if (settings?.isAngketClosed) return true;
    if (settings?.angketDeadline) {
      const deadline = new Date(settings.angketDeadline + 'T23:59:59');
      return new Date() > deadline;
    }
    return false;
  }, [settings]);

  // Formatted Deadline String
  const formattedDeadline = useMemo(() => {
    if (!settings?.angketDeadline) return '15 Agustus 2026';
    try {
      const d = new Date(settings.angketDeadline);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return settings.angketDeadline;
    }
  }, [settings]);

  // Helper for Wave Details
  const getWaveInfo = (waveId?: WaveType) => {
    const gel1Dates = settings?.baliGel1Dates || '07 – 11 November 2025';
    const gel2Dates = settings?.baliGel2Dates || '14 – 18 November 2025';
    const yogyaDates = settings?.yogyaGel1Dates || '15 – 16 November 2025';
    const baliPrice = settings?.baliPrice || 1600000;
    const yogyaPrice = settings?.yogyaPrice || 850000;

    const formatPrice = (val: number) => {
      return `Rp ${val.toLocaleString('id-ID')},-`;
    };

    if (waveId === 'BALI_GEL_1') {
      return {
        id: 'BALI_GEL_1' as WaveType,
        destination: 'BALI' as DestinationType,
        name: 'Bali Gelombang I',
        dates: gel1Dates,
        price: baliPrice,
        formattedPrice: formatPrice(baliPrice),
      };
    } else if (waveId === 'BALI_GEL_2') {
      return {
        id: 'BALI_GEL_2' as WaveType,
        destination: 'BALI' as DestinationType,
        name: 'Bali Gelombang II',
        dates: gel2Dates,
        price: baliPrice,
        formattedPrice: formatPrice(baliPrice),
      };
    } else if (waveId === 'YOGYA_GEL_1') {
      return {
        id: 'YOGYA_GEL_1' as WaveType,
        destination: 'YOGYAKARTA' as DestinationType,
        name: 'Yogyakarta Gelombang I',
        dates: yogyaDates,
        price: yogyaPrice,
        formattedPrice: formatPrice(yogyaPrice),
      };
    }

    const isBali = waveId ? (waveId as string).includes('BALI') : false;
    return {
      id: (waveId || 'BALI_GEL_1') as WaveType,
      destination: (isBali ? 'BALI' : 'YOGYAKARTA') as DestinationType,
      name: isBali ? 'Bali Gelombang I' : 'Yogyakarta Gelombang I',
      dates: isBali ? gel1Dates : yogyaDates,
      price: isBali ? baliPrice : yogyaPrice,
      formattedPrice: isBali ? formatPrice(baliPrice) : formatPrice(yogyaPrice),
    };
  };

  // Helper to normalize NIS for flexible matching (removes spaces, slashes, dots, hyphens)
  const normalizeNis = (val: string) => val.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();

  // Parse any NIS string into 3 segments
  const parseNisToSegments = (nisStr: string): { seg1: string; seg2: string; seg3: string } => {
    if (!nisStr) return { seg1: '', seg2: '', seg3: '' };

    // Split by /, ., spaces, hyphens
    const parts = nisStr.split(/[/\.\s\-]+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return { seg1: parts[0], seg2: parts[1], seg3: parts[2] };
    }

    const digits = nisStr.replace(/\D/g, '');
    if (digits.length >= 10) {
      return {
        seg1: digits.slice(0, 5),
        seg2: digits.slice(5, 9),
        seg3: digits.slice(9),
      };
    }

    return { seg1: parts[0] || digits || nisStr, seg2: parts[1] || '', seg3: parts[2] || '' };
  };

  const populateStudentData = (found: Student) => {
    setSelectedStudent(found);
    setInputNis(found.nis);

    const { seg1: s1, seg2: s2, seg3: s3 } = parseNisToSegments(found.nis);
    setSeg1(s1);
    setSeg2(s2);
    setSeg3(s3);

    const dest = found.destination || 'BALI';
    setDestination(dest);
    setWave(found.wave || (dest === 'BALI' ? 'BALI_GEL_1' : 'YOGYA_GEL_1'));
    setTShirtSize(found.tShirtSize || 'L');
    setTShirtDesign(found.tShirtDesign || 'A');
    setParentName(found.parentName || '');
    setParentAddress(found.parentAddress || '');
    setParentPhone(found.parentPhone || '');
    setStudentPhone(found.studentPhone || '');
    setMedicalHistory(found.medicalHistory || '');
    setWaiverType(found.waiverType || 'NONE');
    setAgreeTerms(true);

    // BAPAK/IBU RESTRICTION: Apabila siswa sudah pernah mengisi angket (isRegistered = true)
    // siswa tidak bisa mengedit data lagi di angket. Langsung alihkan (redirect) ke Surat Izin.
    if (found.isRegistered) {
      onNavigateToSurat(found);
    }
  };

  // Strict and Accurate NIS Search Trigger
  const triggerNisSearch = (
    s1: string,
    s2: string,
    s3: string,
    rawFallback?: string,
    isTypeChange = false
  ) => {
    setErrorMessage('');

    let searchStr = '';
    if (s1 || s2 || s3) {
      searchStr = `${s1.trim()} / ${s2.trim()} . ${s3.trim()}`;
    } else if (rawFallback) {
      searchStr = rawFallback.trim();
    }

    if (!searchStr.replace(/[^0-9a-zA-Z]/g, '')) {
      setSelectedStudent(null);
      return;
    }

    const normSearch = normalizeNis(searchStr);

    // 1. Exact raw match
    let found = students.find((s) => s.nis.trim().toLowerCase() === searchStr.trim().toLowerCase());

    // 2. Exact normalized match
    if (!found) {
      found = students.find((s) => normalizeNis(s.nis) === normSearch);
    }

    // 3. Substring match ONLY if not a type change and normalized search term is long enough (>= 4 chars)
    if (!found && !isTypeChange && normSearch.length >= 4) {
      found = students.find((s) => normalizeNis(s.nis) === normSearch || normalizeNis(s.nis).startsWith(normSearch));
    }

    if (found) {
      populateStudentData(found);
    } else {
      setSelectedStudent(null);
      // Only show error on explicit search or if they typed a long term that doesn't match
      if (!isTypeChange && normSearch.length >= 3) {
        setErrorMessage(`Siswa dengan NIS/NISN "${searchStr}" tidak ditemukan. Pastikan angka yang dimasukkan sudah sesuai data kelas.`);
      }
    }
  };

  const handleSeg1Change = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setSeg1(clean);
    if (clean.length >= 5) {
      seg2Ref.current?.focus();
    }
    triggerNisSearch(clean, seg2, seg3, undefined, true);
  };

  const handleSeg2Change = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setSeg2(clean);
    if (clean.length >= 4) {
      seg3Ref.current?.focus();
    }
    triggerNisSearch(seg1, clean, seg3, undefined, true);
  };

  const handleSeg3Change = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setSeg3(clean);
    triggerNisSearch(seg1, seg2, clean, undefined, true);
  };

  const handlePasteSegment = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;

    const parsed = parseNisToSegments(pasted);
    setSeg1(parsed.seg1);
    setSeg2(parsed.seg2);
    setSeg3(parsed.seg3);
    triggerNisSearch(parsed.seg1, parsed.seg2, parsed.seg3, pasted, false);
  };

  const handleSeg2KeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !seg2) {
      seg1Ref.current?.focus();
    }
  };

  const handleSeg3KeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !seg3) {
      seg2Ref.current?.focus();
    }
  };

  const handleSelectFromLookup = (st: Student) => {
    populateStudentData(st);
  };

  // Handle Destination Change
  const handleDestinationSelect = (selectedDest: DestinationType) => {
    setDestination(selectedDest);
    if (selectedDest === 'BALI') {
      setWave('BALI_GEL_1');
    } else {
      setWave('YOGYA_GEL_1');
    }
  };

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAngketClosed) {
      setErrorMessage('Pengisian angket telah ditutup. Anda tidak dapat mengubah data angket.');
      return;
    }

    if (!selectedStudent) {
      setErrorMessage('Silakan masukkan atau pilih NIS siswa terlebih dahulu.');
      return;
    }

    if (!parentName || !parentPhone || !parentAddress) {
      setErrorMessage('Mohon lengkapi data Orang Tua / Wali murid.');
      return;
    }

    if (!studentPhone) {
      setErrorMessage('Mohon lengkapi No. WhatsApp Aktif Siswa.');
      return;
    }

    if (!medicalHistory) {
      setErrorMessage('Mohon lengkapi Riwayat Penyakit (isi "Tidak Ada" jika sehat).');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui pernyataan izin orang tua.');
      return;
    }

    const updated: Student = {
      ...selectedStudent,
      destination,
      wave,
      tShirtSize,
      tShirtDesign,
      parentName,
      parentAddress,
      parentPhone,
      studentPhone,
      medicalHistory,
      waiverType,
      isRegistered: true,
      updatedAt: new Date().toISOString(),
    };

    onSaveStudent(updated);
    setSelectedStudent(updated);
    // Redirect directly to print document page upon completion
    onNavigateToSurat(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner Intro & Deadline Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Pengisian Angket Resmi Peminatan Tour
            </div>

            {/* Deadline Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                isAngketClosed
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {isAngketClosed ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  Angket Ditutup (Batas Akhir: {formattedDeadline})
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Batas Akhir Pengisian: {formattedDeadline}
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Angket Peminatan Darmawisata Kelas XII
            </h2>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isAngketClosed
                ? 'Pengisian angket peminatan telah ditutup secara resmi. Masukkan NIS siswa untuk mengecek Gelombang Keberangkatan, Bus, Kamar, dan Cetak Surat Izin Orang Tua.'
                : 'Masukkan NIS siswa untuk memilih tujuan tour (Bali / Yogyakarta), ukuran kaos, serta data izin orang tua. Gelombang keberangkatan akan muncul secara otomatis ketika angket resmi ditutup.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Step 1: NIS Input / Lookup */}
        <div className="space-y-4 pb-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Langkah 1: Masukkan NIS / NISN Siswa
            </label>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setInputMode('segmented')}
                className={`px-3 py-1 rounded-lg transition-all font-bold ${
                  inputMode === 'segmented'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                3 Segmen (25082 / 3258 . 009)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`px-3 py-1 rounded-lg transition-all font-bold ${
                  inputMode === 'manual'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Ketik Bebas
              </button>
            </div>
          </div>

          {inputMode === 'segmented' ? (
            <div className="flex flex-col md:flex-row gap-3">
              {/* Segmented Input Wrapper */}
              <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2 flex items-center justify-center gap-1.5 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all shadow-xs">
                {/* Segment 1 */}
                <div className="relative flex-1 max-w-[130px]">
                  <input
                    ref={seg1Ref}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="25082"
                    value={seg1}
                    onChange={(e) => handleSeg1Change(e.target.value)}
                    onPaste={handlePasteSegment}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full text-center py-2 px-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                  />
                  <span className="block text-[10px] text-center text-slate-400 font-semibold mt-0.5">Bagian 1</span>
                </div>

                {/* Symbol / */}
                <span className="text-emerald-700 font-black text-xl sm:text-2xl px-1 select-none font-mono pb-4">/</span>

                {/* Segment 2 */}
                <div className="relative flex-1 max-w-[110px]">
                  <input
                    ref={seg2Ref}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="3258"
                    value={seg2}
                    onChange={(e) => handleSeg2Change(e.target.value)}
                    onKeyDown={handleSeg2KeyDown}
                    onPaste={handlePasteSegment}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full text-center py-2 px-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                  />
                  <span className="block text-[10px] text-center text-slate-400 font-semibold mt-0.5">Bagian 2</span>
                </div>

                {/* Symbol . */}
                <span className="text-emerald-700 font-black text-2xl sm:text-3xl px-1 select-none font-mono pb-4">.</span>

                {/* Segment 3 */}
                <div className="relative flex-1 max-w-[100px]">
                  <input
                    ref={seg3Ref}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="009"
                    value={seg3}
                    onChange={(e) => handleSeg3Change(e.target.value)}
                    onKeyDown={handleSeg3KeyDown}
                    onPaste={handlePasteSegment}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full text-center py-2 px-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                  />
                  <span className="block text-[10px] text-center text-slate-400 font-semibold mt-0.5">Bagian 3</span>
                </div>

                <button
                  type="button"
                  onClick={() => triggerNisSearch(seg1, seg2, seg3)}
                  className="ml-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow-xs flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  Cek NIS
                </button>
              </div>

              {settings?.showAngketSearchButton === true && (
                <button
                  type="button"
                  onClick={() => setIsLookupOpen(true)}
                  className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
                >
                  <Search className="w-4 h-4" />
                  {students.length > 0 ? `Cari dari Daftar (${students.length} Siswa)` : 'Cari dari Daftar Siswa'}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ketik NIS/NISN lengkap..."
                  value={inputNis}
                  onChange={(e) => {
                    setInputNis(e.target.value);
                    if (e.target.value.trim().length >= 3) {
                      triggerNisSearch('', '', '', e.target.value);
                    }
                  }}
                  className="w-full pl-4 pr-20 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-base focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => triggerNisSearch('', '', '', inputNis)}
                  className="absolute right-2 top-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Cek
                </button>
              </div>

              {settings?.showAngketSearchButton === true && (
                <button
                  type="button"
                  onClick={() => setIsLookupOpen(true)}
                  className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  {students.length > 0 ? `Cari dari Daftar (${students.length} Siswa)` : 'Cari dari Daftar Siswa'}
                </button>
              )}
            </div>
          )}

          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>
              Siswa cukup memasukkan angka saja pada 3 kotak di atas. Simbol <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono font-bold">/</code> dan <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono font-bold">.</code> sudah terpasang otomatis.
            </span>
          </p>

          {/* Student Matched Box */}
          {selectedStudent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {selectedStudent.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                    <span className="font-bold text-emerald-800">
                      NIS: {selectedStudent.nis}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-slate-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Kelas: {selectedStudent.className}
                    </span>
                    <span>•</span>
                    <span>Jenis Kelamin: {selectedStudent.gender}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-200/60 px-3 py-1 rounded-full border border-emerald-300">
                Data Otomatis Terhubung
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              *Tips: Ketik NIS langsung atau klik &quot;Cari dari Daftar&quot; untuk menemukan nama siswa.
            </p>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* ANGKET CLOSED VIEW WHEN STUDENT MATCHED */}
        {selectedStudent && isAngketClosed && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Official Gelombang Result Banner */}
            <div className="p-6 bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-2xl border border-emerald-500/40 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-700/50 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-base text-white tracking-tight uppercase">
                    Hasil Gelombang Keberangkatan Resmi
                  </h3>
                </div>
                <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 font-extrabold text-xs rounded-full border border-emerald-400/40">
                  Angket Ditutup
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                    Gelombang Keberangkatan:
                  </span>
                  <h4 className="text-xl font-black text-amber-300">
                    {getWaveInfo(selectedStudent.wave).name}
                  </h4>
                  <p className="text-xs text-slate-200 font-medium">
                    📅 Tanggal: <strong>{getWaveInfo(selectedStudent.wave).dates}</strong>
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    📍 Tujuan: <strong>Tour {selectedStudent.destination || 'BALI'}</strong> ({getWaveInfo(selectedStudent.wave).formattedPrice})
                  </p>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                    Fasilitas & Penempatan:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-slate-900/60 rounded-lg flex items-center gap-2">
                      <Bus className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Armada Bus</span>
                        <strong className="text-white">
                          {selectedStudent.busNumber ? `Bus ${selectedStudent.busNumber}` : 'Diatur Panitia'}
                        </strong>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900/60 rounded-lg flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-teal-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Kamar Hotel</span>
                        <strong className="text-white">
                          {selectedStudent.roomNumber ? `Kamar ${selectedStudent.roomNumber}` : 'Diatur Panitia'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-slate-300 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ukuran Kaos Peserta: <strong>{selectedStudent.tShirtSize || 'L'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Pilihan Desain: <strong>Opsi {selectedStudent.tShirtDesign || 'A'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button to Print PDF */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-300">
                  Surat Izin Orang Tua & Surat Pernyataan sudah dapat dicetak resmi.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateToSurat(selectedStudent)}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  Cetak Surat Izin Orang Tua (PDF)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANGKET OPEN VIEW (FORM) */}
        {selectedStudent && !isAngketClosed && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
            {/* Step 2: Destination Selection (Gelombang Option Removed as per user request) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Langkah 2: Pilih Tujuan Tour
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bali Option */}
                <div
                  onClick={() => handleDestinationSelect('BALI')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                    destination === 'BALI'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      {settings?.baliBadge || '🌴 TOUR BALI (5 HARI)'}
                    </span>
                    {destination === 'BALI' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base">
                    {settings?.baliTitle || 'Pulau Dewata Bali & Sunset Jimbaran'}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {settings?.baliDesc || 'Kunjungan objek GWK Cultural Park, Pantai Melasti, Pantai Pandawa, Bedugul, Kuta Beach, Joger, Tari Barong, & Sunset Dinner.'}
                  </p>

                  <div className="pt-2 flex flex-col gap-1 text-xs border-t border-slate-200/60 pb-1">
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Gelombang I: {settings?.baliGel1Dates || '07 – 11 November 2025'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Gelombang II: {settings?.baliGel2Dates || '14 – 18 November 2025'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Biaya Investasi:</span>
                    <span className="text-sm font-black text-slate-900">
                      Rp {(settings?.baliPrice || 1600000).toLocaleString('id-ID')},-
                    </span>
                  </div>
                </div>

                {/* Yogyakarta Option */}
                <div
                  onClick={() => handleDestinationSelect('YOGYAKARTA')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                    destination === 'YOGYAKARTA'
                      ? 'border-amber-600 bg-amber-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md">
                      {settings?.yogyaBadge || '🏛️ TOUR YOGYAKARTA (2 HARI)'}
                    </span>
                    {destination === 'YOGYAKARTA' && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base">
                    {settings?.yogyaTitle || 'Kota Istimewa & Petualangan Merapi'}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {settings?.yogyaDesc || 'Wisata Cave Tubing Gua Pindul, Pantai Sepanjang Gunungkidul, Lava Tour Merapi Jeep, Malioboro, & Pusat Oleh-oleh Jogja.'}
                  </p>

                  <div className="pt-2 flex flex-col gap-1 text-xs border-t border-slate-200/60 pb-1">
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Jadwal Keberangkatan: {settings?.yogyaGel1Dates || '15 – 16 November 2025'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Biaya Investasi:</span>
                    <span className="text-sm font-black text-slate-900">
                      Rp {(settings?.yogyaPrice || 850000).toLocaleString('id-ID')},-
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Notice regarding Gelombang */}
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Informasi Gelombang Keberangkatan:</strong> Pilihan Gelombang I atau Gelombang II tidak lagi dipilih saat pengisian angket. Gelombang akan ditetapkan secara resmi oleh panitia sekolah dan akan langsung tampil begitu batas waktu angket selesai (ditutup).
                </p>
              </div>
            </div>

            {/* Step 3: T-Shirt Size Selection */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Langkah 3: Ukuran Kaos Peserta
                </label>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Shirt className="w-3.5 h-3.5 text-slate-400" /> Panduan Ukuran Kaos Resmi
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {schoolMetadata.tShirtSizes.map((sz) => {
                  const isSelected = tShirtSize === sz.size;
                  return (
                    <button
                      key={sz.size}
                      type="button"
                      onClick={() => setTShirtSize(sz.size as TShirtSize)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-black border-emerald-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold border-slate-200'
                      }`}
                    >
                      <div className="text-sm">{sz.size}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{sz.chest}</div>
                    </button>
                  );
                })}
              </div>

              {/* T-Shirt Design Selection */}
              <div className="space-y-3 pt-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {settings?.tshirtSectionTitle || "Pilihan Desain Kaos Darmawisata Sterida 2026-2027"}
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Option A */}
                  <div
                    onClick={() => setTShirtDesign('A')}
                    className={`relative p-2.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-2 sm:space-y-3 ${
                      tShirtDesign === 'A'
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="relative w-full aspect-square max-w-[130px] sm:max-w-[180px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                      <img
                        src={settings?.tshirtDesignAUrl || tshirtDesignA.src}
                        alt="Desain Kaos A"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-emerald-600 text-white font-black text-[9px] sm:text-[10px] rounded-lg shadow-sm">
                        OPSI A
                      </div>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {settings?.tshirtDesignATitle || "Desain Minimalis Modern"}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {settings?.tshirtDesignADesc || "Garis seni estetik siluet candi & kelapa khas Bali-Jogja"}
                      </p>
                    </div>
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center ${
                      tShirtDesign === 'A'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {tShirtDesign === 'A' && <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white" />}
                    </div>
                  </div>

                  {/* Option B */}
                  <div
                    onClick={() => setTShirtDesign('B')}
                    className={`relative p-2.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-2 sm:space-y-3 ${
                      tShirtDesign === 'B'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="relative w-full aspect-square max-w-[130px] sm:max-w-[180px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                      <img
                        src={settings?.tshirtDesignBUrl || tshirtDesignB.src}
                        alt="Desain Kaos B"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-indigo-600 text-white font-black text-[9px] sm:text-[10px] rounded-lg shadow-sm">
                        OPSI B
                      </div>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {settings?.tshirtDesignBTitle || "Desain Retro Adventure"}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {settings?.tshirtDesignBDesc || "Palet warna matahari terbenam dengan ilustrasi gunung & ombak"}
                      </p>
                    </div>
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center ${
                      tShirtDesign === 'B'
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {tShirtDesign === 'B' && <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Parent Info & Consent */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Langkah 4: Data Orang Tua / Wali Murid
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Orang Tua / Wali *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap Orang Tua"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Telepon / WhatsApp Orang Tua *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxxxx"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alamat rumah lengkap"
                    value={parentAddress}
                    onChange={(e) => setParentAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. WhatsApp Aktif Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Riwayat Sakit / Riwayat Penyakit (Tulis &apos;Tidak Ada&apos; jika sehat) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Asma, Maag, Alergi Dingin, atau 'Tidak Ada'"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-600 rounded-xs border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <strong>Pernyataan Izin:</strong> Dengan ini Orang Tua/Wali memberikan izin
                    sepenuhnya kepada siswa untuk mengikuti kegiatan Darmawisata SMK PGRI 2 Ponorogo
                    dan menyetujui seluruh ketentuan yang berlaku.
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                *Data akan disimpan langsung ke database Firebase/Sistem terpadu sekolah.
              </p>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Simpan Angket Peminatan
              </button>
            </div>
          </form>
        )}
      </div>

      {/* NIS Search Modal */}
      <NisLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        students={students}
        onSelectStudent={handleSelectFromLookup}
      />

      {/* Success Modal */}
      {showSuccessModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Angket Berhasil Disimpan!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Data peminatan untuk <strong>{selectedStudent.name}</strong> ({selectedStudent.className}) telah tersimpan secara resmi.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1.5 font-medium text-slate-700">
              <p>• Tujuan Tour: <strong>{selectedStudent.destination || 'BALI'}</strong></p>
              <p>• Ukuran Kaos: <strong>{selectedStudent.tShirtSize}</strong></p>
              <p>• Pilihan Desain: <strong>Opsi {selectedStudent.tShirtDesign || 'A'}</strong></p>
              <p>• Wali Murid: <strong>{selectedStudent.parentName}</strong></p>
              <p className="text-emerald-700 font-bold pt-1 border-t border-slate-200">
                * Gelombang keberangkatan akan ditampilkan otomatis begitu pengisian angket resmi ditutup pada {formattedDeadline}.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigateToSurat(selectedStudent);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                Cetak Surat Izin & Surat Pernyataan PDF
              </button>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Tutup & Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
