'use client';

import React, { useState } from 'react';
import { RundownItem } from '@/types';
import schoolMetadata from '@/config/schoolMetadata.json';
import { Compass, Clock, MapPin, Sparkles, Printer } from 'lucide-react';

interface RundownTimelineProps {
  rundowns?: RundownItem[];
}

export const RundownTimeline: React.FC<RundownTimelineProps> = ({ rundowns: propRundowns }) => {
  const [activeTour, setActiveTour] = useState<'BALI' | 'YOGYAKARTA'>('BALI');
  const [selectedDayFilter, setSelectedDayFilter] = useState<number>(0);

  const defaultRundowns: RundownItem[] =
    activeTour === 'BALI'
      ? (schoolMetadata.rundowns.BALI as RundownItem[])
      : (schoolMetadata.rundowns.YOGYAKARTA as RundownItem[]);

  const rawRundowns = propRundowns && propRundowns.length > 0 ? propRundowns : defaultRundowns;

  const currentTourRundowns = rawRundowns.filter((r) => {
    if (activeTour === 'BALI') return r.id?.startsWith('bali') || r.location.toLowerCase().includes('bali') || r.day <= 5;
    return r.id?.startsWith('yogya') || r.location.toLowerCase().includes('yogya') || r.location.toLowerCase().includes('merapi');
  }).sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));

  const filteredRundowns = currentTourRundowns.filter((r) => {
    if (selectedDayFilter === 0) return true;
    return r.day === selectedDayFilter;
  });

  const availableDays = Array.from(new Set(currentTourRundowns.map((r) => r.day))).sort();

  return (
    <div className="space-y-6 max-w-5xl mx-auto printable-area">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-1 no-print">
            <Compass className="w-3.5 h-3.5" /> Rundown Acara Resmi Darmawisata
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Jadwal & Itinerary Perjalanan ({activeTour === 'BALI' ? 'Tour Bali 5 Hari' : 'Tour Yogyakarta 2 Hari'})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Panduan lengkap perjalanan objek wisata, hotel, dan makan peserta tour SMK PGRI 2 Ponorogo.
          </p>
        </div>

        {/* Tour Switcher & Print Button */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setActiveTour('BALI');
                setSelectedDayFilter(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTour === 'BALI'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌴 Tour Bali
            </button>

            <button
              onClick={() => {
                setActiveTour('YOGYAKARTA');
                setSelectedDayFilter(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeTour === 'YOGYAKARTA'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏛️ Tour Yogya
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-emerald-400" /> Cetak Jadwal
          </button>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-print">
        <button
          onClick={() => setSelectedDayFilter(0)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedDayFilter === 0
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua Hari
        </button>

        {availableDays.map((dayNum) => (
          <button
            key={dayNum}
            onClick={() => setSelectedDayFilter(dayNum)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedDayFilter === dayNum
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Hari ke-{dayNum}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="relative border-l-2 border-emerald-500/30 pl-6 ml-3 space-y-6">
          {filteredRundowns.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-xs"></div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 group-hover:border-emerald-500 transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-900 text-white font-extrabold text-[10px] rounded-md uppercase">
                      HARI KE-{item.day}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" /> {item.time} WIB
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                  </span>
                </div>

                <h4 className="font-extrabold text-slate-900 text-sm">{item.activity}</h4>

                {item.notes && (
                  <p className="text-xs text-slate-600 font-medium pt-1 border-t border-slate-200/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{item.notes}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
