'use client';

import React, { useState } from 'react';
import type { Student, DestinationType, WaveType, GenderType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Edit3, CheckCircle2, Sparkles } from 'lucide-react';

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudents: Student[];
  onApplyUpdate: (updatedStudents: Student[]) => void;
}

export const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
  isOpen,
  onClose,
  selectedStudents,
  onApplyUpdate,
}) => {
  const [updateDestination, setUpdateDestination] = useState<string>('KEEP');
  const [updateWave, setUpdateWave] = useState<string>('KEEP');
  const [updateSize, setUpdateSize] = useState<string>('KEEP');
  const [updateGender, setUpdateGender] = useState<string>('KEEP');

  const handleExecuteUpdate = () => {
    if (selectedStudents.length === 0) return;

    const selectedIds = new Set(selectedStudents.map((s) => s.id));

    const updated = selectedStudents.map((st) => {
      const copy = { ...st };

      if (updateDestination !== 'KEEP') {
        if (updateDestination === 'CLEAR') {
          delete copy.destination;
        } else {
          copy.destination = updateDestination as DestinationType;
        }
      }

      if (updateWave !== 'KEEP') {
        if (updateWave === 'CLEAR') {
          delete copy.wave;
        } else {
          copy.wave = updateWave as WaveType;
        }
      }

      if (updateSize !== 'KEEP') {
        if (updateSize === 'CLEAR') {
          delete copy.tShirtSize;
        } else {
          copy.tShirtSize = updateSize as any;
        }
      }

      if (updateGender !== 'KEEP') {
        copy.gender = updateGender as GenderType;
      }

      return copy;
    });

    onApplyUpdate(updated);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ubah Data Massal (${selectedStudents.length} Siswa Terpilih)`}
      subtitle="Perbarui pilihan tujuan, gelombang, atau ukuran kaos untuk siswa yang dicentang"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Destination Update */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1">
            Ubah Tujuan Tour:
          </label>
          <select
            value={updateDestination}
            onChange={(e) => setUpdateDestination(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="KEEP">-- Biarkan Tetap (Tidak Diubah) --</option>
            <option value="BALI">BALI</option>
            <option value="YOGYAKARTA">YOGYAKARTA</option>
            <option value="CLEAR">Kosongkan Tujuan</option>
          </select>
        </div>

        {/* Gender Update */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1">
            Ubah Jenis Kelamin:
          </label>
          <select
            value={updateGender}
            onChange={(e) => setUpdateGender(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="KEEP">-- Biarkan Tetap (Tidak Diubah) --</option>
            <option value="LAKI-LAKI">LAKI-LAKI</option>
            <option value="PEREMPUAN">PEREMPUAN</option>
          </select>
        </div>

        {/* Wave Update */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1">
            Ubah Gelombang Keberangkatan:
          </label>
          <select
            value={updateWave}
            onChange={(e) => setUpdateWave(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="KEEP">-- Biarkan Tetap (Tidak Diubah) --</option>
            <option value="BALI_GEL_1">Bali Gel I (07-11 Nov)</option>
            <option value="BALI_GEL_2">Bali Gel II (14-18 Nov)</option>
            <option value="YOGYA_GEL_1">Yogya Gel I (15-16 Nov)</option>
            <option value="CLEAR">Kosongkan Gelombang</option>
          </select>
        </div>

        {/* Size Update */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1">
            Ubah Ukuran Kaos:
          </label>
          <select
            value={updateSize}
            onChange={(e) => setUpdateSize(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          >
            <option value="KEEP">-- Biarkan Tetap (Tidak Diubah) --</option>
            {['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map((s) => (
              <option key={s} value={s}>
                Ukuran {s}
              </option>
            ))}
            <option value="CLEAR">Kosongkan Ukuran Kaos</option>
          </select>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExecuteUpdate}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Terapkan Perubahan</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
