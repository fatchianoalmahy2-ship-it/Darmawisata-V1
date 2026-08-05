'use client';

import React, { useState } from 'react';
import { Student, Room, WaveType, GenderType } from '@/types';
import schoolMetadata from '@/config/schoolMetadata.json';
import { RoomAllocatorEngine } from '@/services/roomAllocator';
import { BedDouble, Users, Sparkles, Filter, SlidersHorizontal, CheckCircle2, Printer } from 'lucide-react';

interface RoomGridProps {
  students: Student[];
  rooms: Room[];
  defaultRoomCapacity?: number;
  onAutoAllocateRooms: () => void;
  onOpenRoomConfig: () => void;
}

export const RoomGrid: React.FC<RoomGridProps> = ({
  students,
  rooms,
  defaultRoomCapacity = 3,
  onAutoAllocateRooms,
  onOpenRoomConfig,
}) => {
  const [selectedWave, setSelectedWave] = useState<WaveType>('BALI_GEL_2');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');

  // Derive rooms dynamically from students
  const derivedRooms = RoomAllocatorEngine.deriveRoomsFromStudents(
    students.filter((s) => s.wave === selectedWave),
    defaultRoomCapacity
  );

  const filteredRooms = derivedRooms.filter((r) => {
    if (selectedGender === 'ALL') return true;
    return r.gender === selectedGender;
  });

  const registeredWaveStudents = students.filter(
    (s) => s.isRegistered && s.wave === selectedWave
  );
  const unassignedCount = registeredWaveStudents.filter((s) => !s.roomNumber).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Control Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 mb-1">
            <BedDouble className="w-3.5 h-3.5" /> Pembagian Kamar Hotel Otomatis
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Kamar Hotel (Kapasitas {defaultRoomCapacity} Siswa/Kamar)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kamar terpisah secara otomatis berdasarkan Jenis Kelamin (Laki-laki / Perempuan) & Rekan Sekelas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
          <button
            onClick={onAutoAllocateRooms}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Jalankan Pembagian Kamar Otomatis
          </button>

          <button
            onClick={onOpenRoomConfig}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Atur Kapasitas Kamar
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            Cetak Kamar
          </button>
        </div>
      </div>

      {/* Filter Bar & Unassigned Warning */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Filter Gelombang:</span>
            <select
              value={selectedWave}
              onChange={(e) => setSelectedWave(e.target.value as WaveType)}
              className="px-3 py-1.5 bg-slate-50 font-bold text-xs rounded-xl border border-slate-200 text-slate-800"
            >
              {schoolMetadata.waves.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Gender:</span>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 font-bold text-xs rounded-xl border border-slate-200 text-slate-800"
            >
              <option value="ALL">Semua Gender</option>
              <option value="LAKI-LAKI">Laki-Laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </div>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 text-xs">
          <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
            Total {derivedRooms.length} Kamar Terbentuk
          </span>
          {unassignedCount > 0 && (
            <span className="bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-200 animate-pulse">
              ⚠️ {unassignedCount} Siswa Belum Dapat Kamar
            </span>
          )}
        </div>
      </div>

      {/* Room Grid Cards */}
      <div id="printable-room" className="printable-area grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
            <BedDouble className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700">Belum Ada Kamar Terbentuk</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Klik tombol &quot;Jalankan Pembagian Kamar Otomatis&quot; di atas untuk membagikan siswa ke dalam kamar hotel secara otomatis.
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const roomStudents = students.filter(
              (s) => s.wave === selectedWave && s.roomNumber === room.roomNumber
            );
            const isMale = room.gender === 'LAKI-LAKI';

            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-500 transition-all flex flex-col justify-between space-y-3"
              >
                {/* Room Card Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                      K{room.roomNumber}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        KAMAR #{room.roomNumber}
                      </h4>
                      <p className="text-[10px] text-slate-500">{room.wave}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isMale
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isMale ? '👨 Laki-Laki' : '👩 Perempuan'}
                  </span>
                </div>

                {/* Student Occupants List */}
                <div className="space-y-1.5 flex-1">
                  {roomStudents.map((st, idx) => (
                    <div
                      key={st.id}
                      className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">{st.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {st.className} • NIS: {st.nis}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                    </div>
                  ))}

                  {/* Empty Bed Slots */}
                  {Array.from({ length: defaultRoomCapacity - roomStudents.length }).map(
                    (_, idx) => (
                      <div
                        key={idx}
                        className="p-2 border border-dashed border-slate-200 rounded-xl text-[10px] text-slate-400 text-center font-medium"
                      >
                        Bed Slot #{roomStudents.length + idx + 1} (Kosong)
                      </div>
                    )
                  )}
                </div>

                {/* Footer Count */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Kapasitas: {roomStudents.length}/{defaultRoomCapacity} Bed</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terisi
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
