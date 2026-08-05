'use client';

import React from 'react';
import { WaveType, GenderType, WaiverType } from '@/types';

export const WaveBadge: React.FC<{ wave?: WaveType }> = ({ wave }) => {
  if (!wave) return <span className="text-slate-400 text-xs">-</span>;

  switch (wave) {
    case 'BALI_GEL_1':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Bali Gel I (07-11 Nov)
        </span>
      );
    case 'BALI_GEL_2':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Bali Gel II (14-18 Nov)
        </span>
      );
    case 'YOGYA_GEL_1':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Yogya Gel I (15-16 Nov)
        </span>
      );
    default:
      return <span className="text-xs text-slate-500">{wave}</span>;
  }
};

export const GenderBadge: React.FC<{ gender: GenderType }> = ({ gender }) => {
  if (gender === 'LAKI-LAKI') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
        👨 Laki-Laki
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
      👩 Perempuan
    </span>
  );
};

export const WaiverBadge: React.FC<{ waiver?: WaiverType }> = ({ waiver }) => {
  if (!waiver || waiver === 'NONE') return null;

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
      Diskon {waiver} (Tidak Mampu)
    </span>
  );
};
