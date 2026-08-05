'use client';

import React, { useState } from 'react';
import { Student, Bus, WaveType } from '@/types';
import schoolMetadata from '@/config/schoolMetadata.json';
import { Bus as BusIcon, UserCheck, ShieldAlert, Sparkles, SlidersHorizontal, Printer } from 'lucide-react';

interface BusSeatMapProps {
  students: Student[];
  buses: Bus[];
  defaultBusCapacity?: number;
  onUpdateStudentSeat: (studentId: string, busNumber: number, seatNumber: number) => void;
  onOpenBusConfig: () => void;
}

export const BusSeatMap: React.FC<BusSeatMapProps> = ({
  students,
  buses,
  defaultBusCapacity = 50,
  onUpdateStudentSeat,
  onOpenBusConfig,
}) => {
  const [selectedWave, setSelectedWave] = useState<WaveType>('BALI_GEL_2');
  const [selectedBusNumber, setSelectedBusNumber] = useState<number>(1);
  const [selectedSeatForAssign, setSelectedSeatForAssign] = useState<number | null>(null);
  const [studentToAssignId, setStudentToAssignId] = useState<string>('');

  // Wave buses
  const waveBuses = buses.filter((b) => b.wave === selectedWave);
  const activeBus =
    waveBuses.find((b) => b.busNumber === selectedBusNumber) ||
    waveBuses[0] || {
      id: `bus-1`,
      busNumber: selectedBusNumber,
      wave: selectedWave,
      capacity: defaultBusCapacity,
      guide1: 'Ratna Sari, ST',
      guide2: 'Farid Fuad Zubaidah, S.Pd',
      assignedStudentIds: [],
    };

  // Find students in this bus
  const busStudents = students.filter(
    (s) => s.wave === selectedWave && s.busNumber === activeBus.busNumber
  );

  // Seat map dictionary: seatNum -> Student
  const seatStudentMap = new Map<number, Student>();
  busStudents.forEach((s) => {
    if (s.seatNumber) seatStudentMap.set(s.seatNumber, s);
  });

  // Unassigned students in this wave for modal
  const unassignedWaveStudents = students.filter(
    (s) => s.isRegistered && s.wave === selectedWave && (!s.busNumber || s.busNumber === 0)
  );

  const handleAssignSeat = () => {
    if (!selectedSeatForAssign || !studentToAssignId) return;
    onUpdateStudentSeat(studentToAssignId, activeBus.busNumber, selectedSeatForAssign);
    setSelectedSeatForAssign(null);
    setStudentToAssignId('');
  };

  // Build grid rows for 2-2 layout (Seats 3 to capacity)
  const rows: { left1: number; left2: number; right1: number; right2: number }[] = [];
  const capacity = activeBus.capacity || defaultBusCapacity;

  for (let i = 3; i <= capacity; i += 4) {
    rows.push({
      left1: i,
      left2: i + 1 <= capacity ? i + 1 : 0,
      right1: i + 2 <= capacity ? i + 2 : 0,
      right2: i + 3 <= capacity ? i + 3 : 0,
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Wave & Bus Selector Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
            <BusIcon className="w-3.5 h-3.5" /> Denah Kursi Bus Pariwisata Seat 2-2
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Visualisasi Tempat Duduk Armada Bus ({capacity} Seat)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem denah duduk interaktif sesuai format resmi sekolah.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 w-full lg:w-auto">
          {/* Wave Selector */}
          <select
            value={selectedWave}
            onChange={(e) => {
              setSelectedWave(e.target.value as WaveType);
              setSelectedBusNumber(1);
            }}
            className="px-3.5 py-2 bg-slate-100 font-bold text-xs rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {schoolMetadata.waves.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Bus Number Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => setSelectedBusNumber(num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  selectedBusNumber === num
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bus {num}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenBusConfig}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Atur Kapasitas
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            Cetak Denah Bus
          </button>
        </div>
      </div>

      {/* Main Bus Diagram & Passenger List Grid */}
      <div id="printable-bus" className="printable-area grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bus Physical Seat Layout Diagram (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          {/* Bus Header */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 font-black text-xs flex items-center justify-center">
                B{activeBus.busNumber}
              </div>
              <div>
                <h4 className="font-extrabold text-sm">BUS PARIWISATA {activeBus.busNumber}</h4>
                <p className="text-[10px] text-slate-300">Format Reclining Seat 2-2 AC TV Karaoke</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              {busStudents.length} / {capacity} Terisi
            </span>
          </div>

          {/* Bus Diagram Body Container */}
          <div className="bg-slate-50 border-2 border-slate-300 rounded-3xl p-4 space-y-4 relative">
            {/* Front Driver Area & Front Door */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black rounded-md uppercase">
                🚪 Pintu Depan
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">STEER / SUPIR</span>
                <div className="w-10 h-10 rounded-full border-4 border-slate-700 bg-slate-800 text-white font-black text-xs flex items-center justify-center shadow-inner">
                  ⚙️
                </div>
              </div>
            </div>

            {/* Reserved Seats 1 & 2 for Tour Guides / Teachers */}
            <div className="grid grid-cols-5 gap-2 pb-3 border-b border-dashed border-slate-300">
              <div className="col-span-2 p-2 bg-purple-100 border border-purple-300 text-purple-900 rounded-xl text-center">
                <span className="text-[10px] font-extrabold uppercase block">Kursi 1 (Pendamping 1)</span>
                <span className="text-xs font-bold">{activeBus.guide1 || 'Guru Pendamping'}</span>
              </div>
              <div className="col-span-1 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                LORONG
              </div>
              <div className="col-span-2 p-2 bg-purple-100 border border-purple-300 text-purple-900 rounded-xl text-center">
                <span className="text-[10px] font-extrabold uppercase block">Kursi 2 (Pendamping 2)</span>
                <span className="text-xs font-bold">{activeBus.guide2 || 'Guru Pendamping'}</span>
              </div>
            </div>

            {/* Seat Grid Rows 2-2 */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {rows.map((r, idx) => {
                const sL1 = seatStudentMap.get(r.left1);
                const sL2 = r.left2 ? seatStudentMap.get(r.left2) : null;
                const sR1 = r.right1 ? seatStudentMap.get(r.right1) : null;
                const sR2 = r.right2 ? seatStudentMap.get(r.right2) : null;

                const renderSeatBtn = (seatNum: number, student?: Student | null) => {
                  if (seatNum === 0) return <div className="flex-1 min-h-[68px]"></div>;
                  const isOccupied = !!student;
                  const isMale = student?.gender === 'LAKI-LAKI';

                  return (
                    <button
                      key={seatNum}
                      type="button"
                      onClick={() => setSelectedSeatForAssign(seatNum)}
                      className={`flex-1 min-h-[68px] p-1.5 rounded-xl border text-center transition-all flex flex-col justify-between items-center ${
                        isOccupied
                          ? isMale
                            ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold hover:bg-sky-100'
                            : 'bg-rose-50 border-rose-300 text-rose-900 font-bold hover:bg-rose-100'
                          : 'bg-white border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-400 font-semibold'
                      }`}
                      title={student ? `${student.name} (${student.className})` : `Kursi ${seatNum} - Kosong`}
                    >
                      <div className="text-[10px] opacity-70 font-black">#{seatNum}</div>
                      <div className="text-[11px] leading-tight font-bold my-0.5 break-words line-clamp-2 px-0.5 w-full text-center">
                        {student ? student.name : 'KOSONG'}
                      </div>
                      <div className="text-[9px] font-semibold opacity-80">
                        {student ? student.className : '-'}
                      </div>
                    </button>
                  );
                };

                return (
                  <div key={idx} className="flex items-center gap-2">
                    {/* Left Pair */}
                    <div className="flex-1 flex gap-1.5">
                      {renderSeatBtn(r.left1, sL1)}
                      {renderSeatBtn(r.left2, sL2)}
                    </div>

                    {/* Aisle / Lorong */}
                    <div className="w-6 text-center text-[9px] font-black text-slate-300 uppercase">
                      ||
                    </div>

                    {/* Right Pair */}
                    <div className="flex-1 flex gap-1.5">
                      {renderSeatBtn(r.right1, sR1)}
                      {renderSeatBtn(r.right2, sR2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back Door & Toilet Marker */}
            <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase">
              <span>🚽 TOILET / BELAKANG</span>
              <span>🚪 PINTU BELAKANG</span>
            </div>
          </div>
        </div>

        {/* Right Column: Passenger Table for this Bus (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Daftar Penumpang BUS {activeBus.busNumber} ({selectedWave})
              </h3>
              <p className="text-xs text-slate-500">
                Terdata {busStudents.length} siswa bertempat duduk di bus ini.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Kursi</th>
                  <th className="py-3 px-4">NIS</th>
                  <th className="py-3 px-4">Nama Penumpang</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Kaos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {busStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      Belum ada siswa yang ditetapkan di Bus {activeBus.busNumber}.
                    </td>
                  </tr>
                ) : (
                  busStudents
                    .sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0))
                    .map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 text-center font-black text-slate-900 bg-slate-50">
                          #{st.seatNumber || '-'}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{st.nis}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{st.name}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-700">{st.className}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.gender === 'LAKI-LAKI'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {st.gender}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{st.tShirtSize || '-'}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Seat Assignment Modal */}
      {selectedSeatForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">
              Kelola Tempat Duduk Kursi #{selectedSeatForAssign} (Bus {activeBus.busNumber})
            </h3>

            {seatStudentMap.get(selectedSeatForAssign) ? (
              <div className="p-3 bg-slate-50 border rounded-xl text-xs space-y-1">
                <p className="text-slate-500 font-semibold">Penghuni Saat Ini:</p>
                <p className="text-sm font-bold text-slate-900">
                  {seatStudentMap.get(selectedSeatForAssign)?.name}
                </p>
                <p className="text-xs text-slate-600">
                  {seatStudentMap.get(selectedSeatForAssign)?.className} • NIS: {seatStudentMap.get(selectedSeatForAssign)?.nis}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Kursi #{selectedSeatForAssign} saat ini masih kosong.
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Siswa untuk Duduk di Kursi ini:
              </label>
              <select
                value={studentToAssignId}
                onChange={(e) => setStudentToAssignId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900"
              >
                <option value="">-- Pilih Siswa Belum Punya Bus --</option>
                {unassignedWaveStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.className}) - NIS: {st.nis}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAssignSeat}
                disabled={!studentToAssignId}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Simpan Penempatan Kursi
              </button>
              <button
                onClick={() => setSelectedSeatForAssign(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
