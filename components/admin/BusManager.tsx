'use client';

import React, { useState } from 'react';
import { Bus, Student, WaveType } from '@/types';
import { motion } from 'motion/react';
import { WaveBadge } from '@/components/ui/Badge';
import { 
  Bus as BusIcon, 
  User, 
  Users, 
  Trash2, 
  Plus, 
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import { useTableQuery } from '@/hooks/useTableQuery';
import { SearchFilterBar } from '@/components/ui/SearchFilterBar';

interface BusManagerProps {
  buses: Bus[];
  students: Student[];
  onUpdateStudent: (student: Student) => void;
}

export const BusManager: React.FC<BusManagerProps> = ({
  buses,
  students,
  onUpdateStudent,
}) => {
  const [assigningStudentId, setAssigningStudentId] = useState('');
  const [assigningBusNum, setAssigningBusNum] = useState<number | null>(null);
  const [assigningSeatNum, setAssigningSeatNum] = useState<number>(3);
  const [searchStudentTerm, setSearchStudentTerm] = useState('');

  // Find students who are registered and eligible for assignment
  const unassignedStudents = students.filter(
    (s) => s.isRegistered && !s.busNumber
  );

  // Unified Table Query for buses list
  const {
    search,
    setSearch,
    filters,
    setFilters,
    handleClearFilters,
    processedData: filteredBuses,
  } = useTableQuery<Bus>(buses, {
    searchFields: ['busNumber'],
    filterFn: (bus, activeFilters) => {
      const { wave } = activeFilters;
      if (wave && bus.wave !== wave) return false;
      return true;
    },
  });

  const handleAssignStudent = (busNum: number, wave: WaveType) => {
    if (!assigningStudentId) return;
    const student = students.find((s) => s.id === assigningStudentId);
    if (!student) return;

    // Perform check: Is seat already taken in this bus?
    const seatTaken = students.some(
      (s) => s.wave === wave && s.busNumber === busNum && s.seatNumber === assigningSeatNum
    );

    if (seatTaken) {
      alert(`Kursi nomor ${assigningSeatNum} sudah ditempati siswa lain di Bus ${busNum}. Silakan pilih nomor kursi lain.`);
      return;
    }

    onUpdateStudent({
      ...student,
      busNumber: busNum,
      seatNumber: assigningSeatNum,
      wave: wave, // Ensure they are on the correct wave
    });

    // Reset Form
    setAssigningStudentId('');
    setAssigningBusNum(null);
    setAssigningSeatNum(3);
  };

  const handleRemoveStudent = (student: Student) => {
    if (confirm(`Hapus ${student.name} dari Bus ${student.busNumber}?`)) {
      onUpdateStudent({
        ...student,
        busNumber: undefined,
        seatNumber: undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Information Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
            <BusIcon className="w-3.5 h-3.5 text-indigo-600" /> Fleet & Seat Allocator
          </div>
          <h2 className="text-lg font-black text-slate-900">Kelola Kursi & Rombongan Bus</h2>
          <p className="text-xs text-slate-500">
            Daftar bus terbit secara otomatis berdasarkan data siswa terdaftar. Anda dapat memasukkan, memindahkan, atau menghapus penempatan kursi siswa secara manual.
          </p>
        </div>
      </div>

      {/* Standardized Search & Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nomor bus armada..."
        activeFilters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        filters={[
          {
            key: 'wave',
            label: 'Gelombang Wisata',
            placeholder: 'Semua Gelombang',
            options: [
              { value: 'BALI_GEL_1', label: 'Bali Gelombang 1' },
              { value: 'BALI_GEL_2', label: 'Bali Gelombang 2' },
              { value: 'YOGYA_GEL_1', label: 'Yogyakarta Gelombang 1' },
            ],
          },
        ]}
      />

      {/* Grid of Buses */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredBuses.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <BusIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">Tidak ada bus yang cocok</p>
            <p className="text-xs text-slate-400">Cobalah menyesuaikan nomor bus pencarian atau filter gelombang Anda.</p>
          </div>
        ) : (
          filteredBuses.map((bus) => {
            const busPassengers = students
              .filter((s) => s.busNumber === bus.busNumber && s.wave === bus.wave)
              .sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0));

            const isAssigningThisBus = assigningBusNum === bus.busNumber;

            return (
              <motion.div
                key={`${bus.wave}-${bus.busNumber}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                      <BusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        Bus Nomor {bus.busNumber}
                        <WaveBadge wave={bus.wave} />
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Pendamping: {bus.guide1} & {bus.guide2}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">
                      {busPassengers.length} / {bus.capacity}
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Siswa Terisi</p>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* Quick Passenger Table */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Daftar Kursi Penumpang</p>
                    
                    {busPassengers.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs italic">
                        Bus ini masih kosong. Klik Tambah Siswa di bawah untuk mengalokasikan kursi.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {busPassengers.map((psg) => (
                          <div
                            key={psg.id}
                            className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-black flex items-center justify-center shrink-0" title="Nomor Kursi">
                                #{psg.seatNumber || '-'}
                              </span>
                              <div className="truncate text-left">
                                <p className="font-extrabold text-slate-800 text-[11px] truncate leading-tight">
                                  {psg.name}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold leading-none">
                                  {psg.className}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveStudent(psg)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors shrink-0"
                              title="Hapus Penempatan Kursi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Manual Assignment Form */}
                  <div className="border-t border-slate-100 pt-4 mt-auto">
                    {isAssigningThisBus ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                          Alokasikan Kursi Baru di Bus {bus.busNumber}
                        </p>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Pilih Siswa (Belum Ada Bus):</label>
                            <select
                              value={assigningStudentId}
                              onChange={(e) => setAssigningStudentId(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                            >
                              <option value="">-- Pilih Siswa ({unassignedStudents.length}) --</option>
                              {unassignedStudents
                                .filter((s) => s.wave === bus.wave)
                                .map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name} ({s.className})
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <label className="block text-[10px] text-slate-500 font-bold mb-0.5">No. Kursi:</label>
                              <input
                                type="number"
                                min={3}
                                max={bus.capacity}
                                value={assigningSeatNum}
                                onChange={(e) => setAssigningSeatNum(parseInt(e.target.value) || 3)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              />
                            </div>
                            
                            <div className="flex items-end gap-1 pt-4">
                              <button
                                onClick={() => handleAssignStudent(bus.busNumber, bus.wave)}
                                disabled={!assigningStudentId}
                                className="px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" /> Simpan
                              </button>
                              <button
                                onClick={() => setAssigningBusNum(null)}
                                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAssigningBusNum(bus.busNumber);
                          setAssigningStudentId('');
                          // Set seat number automatically to next free seat
                          const occupiedSeats = busPassengers.map((s) => s.seatNumber || 0);
                          let nextFree = 3;
                          while (occupiedSeats.includes(nextFree) && nextFree <= bus.capacity) {
                            nextFree++;
                          }
                          setAssigningSeatNum(nextFree);
                        }}
                        className="w-full py-2 border border-dashed border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Siswa ke Bus Ini
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
